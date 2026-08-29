import OpenAI from "openai";
import { zodResponseFormat } from "openai/helpers/zod";
import type { ZodType } from "zod";
import { getMockContextGuidance, getMockFeedback, getMockProfessorReply } from "@/lib/ai/mock";
import { buildContextGuidanceInput, buildContextPrompt, buildFeedbackInput, OFFICE_HOURS_CONTEXT_PROMPT, OFFICE_HOURS_FEEDBACK_PROMPT, OFFICE_HOURS_ROLEPLAY_PROMPT } from "@/lib/ai/prompts";
import { contextGuidanceSchema, feedbackReportSchema } from "@/lib/ai/schemas";
import { AiProviderFailure, type AiOperation, logAiRetry } from "@/lib/ai/telemetry";
import type { ContextGuidance, FeedbackReport, PracticeContext, PracticeMessage } from "@/types/practice";

type KimiModels = Record<AiOperation, string>;

export const KIMI_REQUEST_TIMEOUTS: Record<AiOperation, number> = {
  context: 45_000,
  practice: 20_000,
  feedback: 45_000,
};

const DEFAULT_KIMI_MODELS: KimiModels = {
  context: "kimi-k2.6",
  practice: "kimi-k2.6",
  feedback: "kimi-k2.6",
};

function getKimiModelSettings(model: string) {
  if (model === "kimi-k3") return { reasoning_effort: "low" as const };
  if (model === "kimi-k2.6") return { thinking: { type: "disabled" as const } };
  return {};
}

function parseStructuredOutput<T>(content: string | null | undefined, schema: ZodType<T>) {
  const trimmed = content?.trim();
  if (!trimmed) throw new AiProviderFailure("empty_response");

  let decoded: unknown;
  try {
    decoded = JSON.parse(trimmed);
  } catch {
    throw new AiProviderFailure("invalid_json");
  }

  const parsed = schema.safeParse(decoded);
  if (!parsed.success) {
    const detail = parsed.error.issues
      .slice(0, 4)
      .map((issue) => `${issue.path.join(".") || "root"}:${issue.code}`)
      .join(",");
    throw new AiProviderFailure("invalid_schema", detail);
  }
  return parsed.data;
}

function shouldRetryStructuredFailure(error: unknown) {
  return error instanceof AiProviderFailure && [
    "empty_response",
    "truncated",
    "invalid_json",
    "invalid_schema",
    "grounding_failed",
  ].includes(error.reason);
}

export interface AiProvider {
  mode: "demo" | "live";
  modelFor(operation: AiOperation): string;
  generateContextGuidance(context: PracticeContext): Promise<ContextGuidance>;
  generateProfessorReply(context: PracticeContext, messages: PracticeMessage[]): Promise<string>;
  generateFeedback(context: PracticeContext, messages: PracticeMessage[]): Promise<FeedbackReport>;
}

export class DemoProvider implements AiProvider {
  readonly mode = "demo" as const;

  modelFor() {
    return "demo";
  }

  async generateContextGuidance(context: PracticeContext) {
    return getMockContextGuidance(context);
  }

  async generateProfessorReply(_context: PracticeContext, messages: PracticeMessage[]) {
    return getMockProfessorReply(messages);
  }

  async generateFeedback(context: PracticeContext, messages: PracticeMessage[]) {
    return getMockFeedback(context, messages);
  }

}

export class KimiProvider implements AiProvider {
  readonly mode = "live" as const;

  constructor(private readonly client: OpenAI, private readonly models: KimiModels = DEFAULT_KIMI_MODELS) {}

  modelFor(operation: AiOperation) {
    return this.models[operation];
  }

  async generateContextGuidance(context: PracticeContext) {
    try {
      return await this.requestContextGuidance(context, false);
    } catch (error) {
      if (!shouldRetryStructuredFailure(error)) throw error;
      logAiRetry({ operation: "context", model: this.modelFor("context"), error });
      return this.requestContextGuidance(context, true);
    }
  }

  private async requestContextGuidance(context: PracticeContext, retry: boolean) {
    const model = this.modelFor("context");
    const completion = await this.client.chat.completions.create({
      model,
      messages: [
        { role: "system", content: OFFICE_HOURS_CONTEXT_PROMPT },
        {
          role: "user",
          content: `${buildContextGuidanceInput(context)}${retry ? "\nThis is a retry after an invalid response. Return only the exact four-field JSON object in English and preserve the literal source verbatim." : ""}`,
        },
      ],
      response_format: zodResponseFormat(contextGuidanceSchema, "office_hours_context_guidance"),
      ...getKimiModelSettings(model),
    }, { timeout: KIMI_REQUEST_TIMEOUTS.context, maxRetries: 1 });

    if (completion.choices[0]?.finish_reason === "length") {
      throw new AiProviderFailure("truncated");
    }

    const guidance = parseStructuredOutput(completion.choices[0]?.message.content, contextGuidanceSchema);
    const literalSource = context.professorFeedback.trim() || context.whatHappened.trim();
    if (!guidance.literal_source.includes(literalSource)) {
      throw new AiProviderFailure("grounding_failed");
    }
    return guidance;
  }

  async generateProfessorReply(context: PracticeContext, messages: PracticeMessage[]) {
    const model = this.modelFor("practice");
    const completion = await this.client.chat.completions.create({
      model,
      messages: [
        { role: "system", content: OFFICE_HOURS_ROLEPLAY_PROMPT },
        { role: "user", content: buildContextPrompt(context) },
        ...messages.map((message) => ({ role: message.role, content: message.content })),
      ],
      ...getKimiModelSettings(model),
    }, { timeout: KIMI_REQUEST_TIMEOUTS.practice, maxRetries: 1 });

    if (completion.choices[0]?.finish_reason === "length") {
      throw new AiProviderFailure("truncated");
    }

    const professorReply = completion.choices[0]?.message.content?.trim();
    if (!professorReply) throw new AiProviderFailure("empty_response");
    return professorReply;
  }

  async generateFeedback(context: PracticeContext, messages: PracticeMessage[]) {
    try {
      return await this.requestFeedback(context, messages, false);
    } catch (error) {
      if (!shouldRetryStructuredFailure(error)) throw error;
      logAiRetry({ operation: "feedback", model: this.modelFor("feedback"), error });
      return this.requestFeedback(context, messages, true);
    }
  }

  private async requestFeedback(context: PracticeContext, messages: PracticeMessage[], retry: boolean) {
    const model = this.modelFor("feedback");
    const completion = await this.client.chat.completions.create({
      model,
      messages: [
        { role: "system", content: OFFICE_HOURS_FEEDBACK_PROMPT },
        {
          role: "user",
          content: `${buildFeedbackInput(context, messages)}${retry ? "\nThis is a retry after an invalid response. Follow the exact JSON field names, types, counts, English-only requirement, and verbatim transcript-grounding requirements." : ""}`,
        },
      ],
      response_format: zodResponseFormat(feedbackReportSchema, "office_hours_feedback"),
      ...getKimiModelSettings(model),
    }, { timeout: KIMI_REQUEST_TIMEOUTS.feedback, maxRetries: 1 });

    if (completion.choices[0]?.finish_reason === "length") {
      throw new AiProviderFailure("truncated");
    }

    const report = parseStructuredOutput(completion.choices[0]?.message.content, feedbackReportSchema);
    const studentResponses = messages.filter((message) => message.role === "user").map((message) => message.content);
    if (report.improvements.some((improvement) => !studentResponses.some((response) => response.includes(improvement.original_response)))) {
      throw new AiProviderFailure("grounding_failed");
    }
    return report;
  }

}

export const demoProvider = new DemoProvider();

export function getAiProvider(): AiProvider {
  if (process.env.AI_PROVIDER !== "kimi" || !process.env.MOONSHOT_API_KEY) {
    return demoProvider;
  }

  const client = new OpenAI({
    apiKey: process.env.MOONSHOT_API_KEY,
    baseURL: "https://api.moonshot.ai/v1",
  });

  const legacyModel = process.env.KIMI_MODEL;
  return new KimiProvider(client, {
    context: process.env.KIMI_CONTEXT_MODEL || legacyModel || DEFAULT_KIMI_MODELS.context,
    practice: process.env.KIMI_PRACTICE_MODEL || legacyModel || DEFAULT_KIMI_MODELS.practice,
    feedback: process.env.KIMI_FEEDBACK_MODEL || legacyModel || DEFAULT_KIMI_MODELS.feedback,
  });
}
