import OpenAI from "openai";
import { zodResponseFormat } from "openai/helpers/zod";
import { getMockFeedback, getMockProfessorReply } from "@/lib/ai/mock";
import { buildContextPrompt, buildFeedbackInput, NATURAL_ENGLISH_TRANSLATION_PROMPT, OFFICE_HOURS_FEEDBACK_PROMPT, OFFICE_HOURS_ROLEPLAY_PROMPT } from "@/lib/ai/prompts";
import { feedbackReportSchema, naturalEnglishSchema } from "@/lib/ai/schemas";
import type { FeedbackReport, PracticeContext, PracticeMessage } from "@/types/practice";

export interface AiProvider {
  mode: "demo" | "live";
  generateProfessorReply(context: PracticeContext, messages: PracticeMessage[]): Promise<string>;
  generateFeedback(context: PracticeContext, messages: PracticeMessage[]): Promise<FeedbackReport>;
  translateToNaturalEnglish(text: string): Promise<string>;
}

export class DemoProvider implements AiProvider {
  readonly mode = "demo" as const;

  async generateProfessorReply(_context: PracticeContext, messages: PracticeMessage[]) {
    return getMockProfessorReply(messages);
  }

  async generateFeedback(context: PracticeContext, messages: PracticeMessage[]) {
    return getMockFeedback(context, messages);
  }

  async translateToNaturalEnglish(text: string): Promise<string> {
    void text;
    throw new Error("Natural-English conversion requires a live AI provider.");
  }
}

export class KimiProvider implements AiProvider {
  readonly mode = "live" as const;

  constructor(private readonly client: OpenAI, private readonly model = "kimi-k3") {}

  async generateProfessorReply(context: PracticeContext, messages: PracticeMessage[]) {
    const completion = await this.client.chat.completions.create({
      model: this.model,
      messages: [
        { role: "system", content: OFFICE_HOURS_ROLEPLAY_PROMPT },
        { role: "user", content: buildContextPrompt(context) },
        ...messages.map((message) => ({ role: message.role, content: message.content })),
      ],
      ...(this.model === "kimi-k3" ? { reasoning_effort: "low" as const } : {}),
    });

    if (completion.choices[0]?.finish_reason === "length") {
      throw new Error("Kimi truncated the professor reply.");
    }

    const professorReply = completion.choices[0]?.message.content?.trim();
    if (!professorReply) throw new Error("Kimi returned an empty professor reply.");
    return professorReply;
  }

  async generateFeedback(context: PracticeContext, messages: PracticeMessage[]) {
    const completion = await this.client.chat.completions.create({
      model: this.model,
      messages: [
        { role: "system", content: OFFICE_HOURS_FEEDBACK_PROMPT },
        { role: "user", content: buildFeedbackInput(context, messages) },
      ],
      response_format: zodResponseFormat(feedbackReportSchema, "office_hours_feedback"),
      ...(this.model === "kimi-k3" ? { reasoning_effort: "low" as const } : {}),
    });

    if (completion.choices[0]?.finish_reason === "length") {
      throw new Error("Kimi truncated the feedback report.");
    }

    const content = completion.choices[0]?.message.content?.trim();
    if (!content) throw new Error("Kimi returned empty feedback.");
    return feedbackReportSchema.parse(JSON.parse(content));
  }

  async translateToNaturalEnglish(text: string) {
    const completion = await this.client.chat.completions.create({
      model: this.model,
      messages: [
        { role: "system", content: NATURAL_ENGLISH_TRANSLATION_PROMPT },
        { role: "user", content: `<student_draft>${text}</student_draft>` },
      ],
      ...(this.model === "kimi-k3" ? { reasoning_effort: "low" as const } : {}),
    });

    if (completion.choices[0]?.finish_reason === "length") {
      throw new Error("Kimi truncated the English rewrite.");
    }

    return naturalEnglishSchema.parse(completion.choices[0]?.message.content);
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
    maxRetries: 1,
    timeout: 20_000,
  });

  return new KimiProvider(client, process.env.KIMI_MODEL || "kimi-k3");
}
