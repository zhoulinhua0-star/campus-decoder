import OpenAI from "openai";
import { zodResponseFormat } from "openai/helpers/zod";
import type { ZodType } from "zod";
import { getMockEmailContextGuidance, getMockEmailFeedback, getMockEmailHint } from "@/lib/ai/email-mock";
import { buildEmailFeedbackInput, buildEmailGuidanceInput, buildEmailHintInput, EMAIL_CONTEXT_PROMPT, EMAIL_FEEDBACK_PROMPT, EMAIL_HINT_PROMPT } from "@/lib/ai/email-prompts";
import { emailContextGuidanceSchema, emailFeedbackReportSchema, emailHintSchema } from "@/lib/ai/email-schemas";
import { getMockGroupContextGuidance, getMockGroupFeedback, getMockTeammateReply } from "@/lib/ai/group-mock";
import { buildGroupContext, buildGroupContextGuidanceInput, buildGroupFeedbackInput, GROUP_CONTEXT_PROMPT, GROUP_FEEDBACK_PROMPT, GROUP_ROLEPLAY_PROMPT } from "@/lib/ai/group-prompts";
import { groupContextGuidanceSchema, groupFeedbackReportSchema } from "@/lib/ai/group-schemas";
import { getMockContextGuidance, getMockFeedback, getMockProfessorReply } from "@/lib/ai/mock";
import { buildContextGuidanceInput, buildContextPrompt, buildFeedbackInput, OFFICE_HOURS_CONTEXT_PROMPT, OFFICE_HOURS_FEEDBACK_PROMPT, OFFICE_HOURS_ROLEPLAY_PROMPT } from "@/lib/ai/prompts";
import { contextGuidanceSchema, feedbackReportSchema } from "@/lib/ai/schemas";
import { AiProviderFailure, type AiOperation, logAiRetry } from "@/lib/ai/telemetry";
import type { EmailContextGuidance, EmailFeedbackReport, EmailHint, EmailPracticeContext } from "@/types/email-practice";
import type { GroupContextGuidance, GroupFeedbackReport, GroupPracticeContext, GroupPracticeMessage } from "@/types/group-practice";
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

const NON_ENGLISH_SCRIPT = /[^\p{Script=Latin}\p{Number}\p{Punctuation}\p{Separator}\p{Symbol}\p{Mark}\s]/u;

function assertEnglishOnly(fields: Array<[path: string, value: string]>) {
  const invalidField = fields.find(([, value]) => NON_ENGLISH_SCRIPT.test(value));
  if (invalidField) throw new AiProviderFailure("invalid_language", invalidField[0]);
}

function shouldRetryStructuredFailure(error: unknown) {
  return error instanceof AiProviderFailure && [
    "empty_response",
    "truncated",
    "invalid_json",
    "invalid_schema",
    "invalid_language",
    "grounding_failed",
  ].includes(error.reason);
}

function shouldRetryLanguageFailure(error: unknown) {
  return error instanceof AiProviderFailure && error.reason === "invalid_language";
}

export interface AiProvider {
  mode: "demo" | "live";
  modelFor(operation: AiOperation): string;
  generateContextGuidance(context: PracticeContext): Promise<ContextGuidance>;
  generateProfessorReply(context: PracticeContext, messages: PracticeMessage[]): Promise<string>;
  generateFeedback(context: PracticeContext, messages: PracticeMessage[]): Promise<FeedbackReport>;
  generateEmailContextGuidance(context: EmailPracticeContext): Promise<EmailContextGuidance>;
  generateEmailHint(context: EmailPracticeContext, draft: string): Promise<EmailHint>;
  generateEmailFeedback(context: EmailPracticeContext, revisedDraft: string): Promise<EmailFeedbackReport>;
  generateGroupContextGuidance(context: GroupPracticeContext): Promise<GroupContextGuidance>;
  generateTeammateReply(context: GroupPracticeContext, messages: GroupPracticeMessage[]): Promise<string>;
  generateGroupFeedback(context: GroupPracticeContext, messages: GroupPracticeMessage[]): Promise<GroupFeedbackReport>;
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

  async generateEmailContextGuidance(context: EmailPracticeContext) {
    return getMockEmailContextGuidance(context);
  }

  async generateEmailHint(_context: EmailPracticeContext, draft: string) {
    return getMockEmailHint(draft);
  }

  async generateEmailFeedback(context: EmailPracticeContext, revisedDraft: string) {
    return getMockEmailFeedback(context, revisedDraft);
  }

  async generateGroupContextGuidance(context: GroupPracticeContext) {
    return getMockGroupContextGuidance(context);
  }

  async generateTeammateReply(_context: GroupPracticeContext, messages: GroupPracticeMessage[]) {
    return getMockTeammateReply(messages);
  }

  async generateGroupFeedback(context: GroupPracticeContext, messages: GroupPracticeMessage[]) {
    return getMockGroupFeedback(context, messages);
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
    assertEnglishOnly([
      ["campus_context", guidance.campus_context],
      ["uncertainty", guidance.uncertainty],
      ["constructive_next_move", guidance.constructive_next_move],
    ]);
    return guidance;
  }

  async generateProfessorReply(context: PracticeContext, messages: PracticeMessage[]) {
    try {
      return await this.requestProfessorReply(context, messages, false);
    } catch (error) {
      if (!shouldRetryLanguageFailure(error)) throw error;
      logAiRetry({ operation: "practice", model: this.modelFor("practice"), error });
      return this.requestProfessorReply(context, messages, true);
    }
  }

  private async requestProfessorReply(context: PracticeContext, messages: PracticeMessage[], retry: boolean) {
    const model = this.modelFor("practice");
    const completion = await this.client.chat.completions.create({
      model,
      messages: [
        {
          role: "system",
          content: `${OFFICE_HOURS_ROLEPLAY_PROMPT}${retry ? "\nThe previous response used a non-English script. Respond only in natural English." : ""}`,
        },
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
    assertEnglishOnly([["professor_reply", professorReply]]);
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
    assertEnglishOnly([
      ["summary", report.summary],
      ...report.strengths.map((value, index) => [`strengths.${index}`, value] as [string, string]),
      ...report.improvements.flatMap((improvement, index) => [
        [`improvements.${index}.observation`, improvement.observation] as [string, string],
        [`improvements.${index}.why_it_matters`, improvement.why_it_matters] as [string, string],
        [`improvements.${index}.suggested_response`, improvement.suggested_response] as [string, string],
      ]),
      ...report.campus_context.flatMap((item, index) => [
        [`campus_context.${index}.literal_meaning`, item.literal_meaning] as [string, string],
        [`campus_context.${index}.likely_context`, item.likely_context] as [string, string],
        [`campus_context.${index}.constructive_next_move`, item.constructive_next_move] as [string, string],
      ]),
      ["action_plan.goal", report.action_plan.goal],
      ["action_plan.opening", report.action_plan.opening],
      ...report.action_plan.questions.map((value, index) => [`action_plan.questions.${index}`, value] as [string, string]),
      ...report.action_plan.evidence_to_bring.map((value, index) => [`action_plan.evidence_to_bring.${index}`, value] as [string, string]),
      ["action_plan.closing", report.action_plan.closing],
    ]);
    return report;
  }

  async generateEmailContextGuidance(context: EmailPracticeContext) {
    try {
      return await this.requestEmailContextGuidance(context, false);
    } catch (error) {
      if (!shouldRetryStructuredFailure(error)) throw error;
      logAiRetry({ operation: "context", model: this.modelFor("context"), error });
      return this.requestEmailContextGuidance(context, true);
    }
  }

  private async requestEmailContextGuidance(context: EmailPracticeContext, retry: boolean) {
    const model = this.modelFor("context");
    const completion = await this.client.chat.completions.create({
      model,
      messages: [
        { role: "system", content: EMAIL_CONTEXT_PROMPT },
        {
          role: "user",
          content: `${buildEmailGuidanceInput(context)}${retry ? "\nThis is a retry after an invalid response. Return only the exact four-field JSON object in English and preserve the entire existing draft verbatim." : ""}`,
        },
      ],
      response_format: zodResponseFormat(emailContextGuidanceSchema, "email_context_guidance"),
      ...getKimiModelSettings(model),
    }, { timeout: KIMI_REQUEST_TIMEOUTS.context, maxRetries: 1 });

    if (completion.choices[0]?.finish_reason === "length") throw new AiProviderFailure("truncated");
    const guidance = parseStructuredOutput(completion.choices[0]?.message.content, emailContextGuidanceSchema);
    if (!guidance.literal_source.includes(context.existingDraft.trim())) {
      throw new AiProviderFailure("grounding_failed");
    }
    assertEnglishOnly([
      ["campus_context", guidance.campus_context],
      ["uncertainty", guidance.uncertainty],
      ["constructive_next_move", guidance.constructive_next_move],
    ]);
    return guidance;
  }

  async generateEmailHint(context: EmailPracticeContext, draft: string) {
    try {
      return await this.requestEmailHint(context, draft, false);
    } catch (error) {
      if (!shouldRetryStructuredFailure(error)) throw error;
      logAiRetry({ operation: "practice", model: this.modelFor("practice"), error });
      return this.requestEmailHint(context, draft, true);
    }
  }

  private async requestEmailHint(context: EmailPracticeContext, draft: string, retry: boolean) {
    const model = this.modelFor("practice");
    const completion = await this.client.chat.completions.create({
      model,
      messages: [
        { role: "system", content: EMAIL_HINT_PROMPT },
        {
          role: "user",
          content: `${buildEmailHintInput(context, draft)}${retry ? "\nThis is a retry after an invalid response. Return only the exact four-field JSON hint in English and do not write a complete email." : ""}`,
        },
      ],
      response_format: zodResponseFormat(emailHintSchema, "email_revision_hint"),
      ...getKimiModelSettings(model),
    }, { timeout: KIMI_REQUEST_TIMEOUTS.practice, maxRetries: 1 });

    if (completion.choices[0]?.finish_reason === "length") throw new AiProviderFailure("truncated");
    const hint = parseStructuredOutput(completion.choices[0]?.message.content, emailHintSchema);
    assertEnglishOnly([
      ["observation", hint.observation],
      ["revision_prompt", hint.revision_prompt],
      ["sentence_starter", hint.sentence_starter],
    ]);
    return hint;
  }

  async generateEmailFeedback(context: EmailPracticeContext, revisedDraft: string) {
    try {
      return await this.requestEmailFeedback(context, revisedDraft, false);
    } catch (error) {
      if (!shouldRetryStructuredFailure(error)) throw error;
      logAiRetry({ operation: "feedback", model: this.modelFor("feedback"), error });
      return this.requestEmailFeedback(context, revisedDraft, true);
    }
  }

  private async requestEmailFeedback(context: EmailPracticeContext, revisedDraft: string, retry: boolean) {
    const model = this.modelFor("feedback");
    const completion = await this.client.chat.completions.create({
      model,
      messages: [
        { role: "system", content: EMAIL_FEEDBACK_PROMPT },
        {
          role: "user",
          content: `${buildEmailFeedbackInput(context, revisedDraft)}${retry ? "\nThis is a retry after an invalid response. Follow the exact JSON fields, types, counts, English-only requirement, and verbatim excerpt requirements." : ""}`,
        },
      ],
      response_format: zodResponseFormat(emailFeedbackReportSchema, "email_feedback"),
      ...getKimiModelSettings(model),
    }, { timeout: KIMI_REQUEST_TIMEOUTS.feedback, maxRetries: 1 });

    if (completion.choices[0]?.finish_reason === "length") throw new AiProviderFailure("truncated");
    const report = parseStructuredOutput(completion.choices[0]?.message.content, emailFeedbackReportSchema);
    if (report.improvements.some((improvement) => !revisedDraft.includes(improvement.original_excerpt))) {
      throw new AiProviderFailure("grounding_failed");
    }
    assertEnglishOnly([
      ["summary", report.summary],
      ...report.strengths.map((value, index) => [`strengths.${index}`, value] as [string, string]),
      ...report.improvements.flatMap((improvement, index) => [
        [`improvements.${index}.observation`, improvement.observation] as [string, string],
        [`improvements.${index}.why_it_matters`, improvement.why_it_matters] as [string, string],
        [`improvements.${index}.suggested_edit`, improvement.suggested_edit] as [string, string],
      ]),
      ["campus_context", report.campus_context],
      ["subject_line", report.subject_line],
      ["final_email", report.final_email],
    ]);
    return report;
  }

  async generateGroupContextGuidance(context: GroupPracticeContext) {
    try {
      return await this.requestGroupContextGuidance(context, false);
    } catch (error) {
      if (!shouldRetryStructuredFailure(error)) throw error;
      logAiRetry({ operation: "context", model: this.modelFor("context"), error });
      return this.requestGroupContextGuidance(context, true);
    }
  }

  private async requestGroupContextGuidance(context: GroupPracticeContext, retry: boolean) {
    const model = this.modelFor("context");
    const completion = await this.client.chat.completions.create({
      model,
      messages: [
        { role: "system", content: GROUP_CONTEXT_PROMPT },
        {
          role: "user",
          content: `${buildGroupContextGuidanceInput(context)}${retry ? "\nThis is a retry after an invalid response. Return only the exact six-field JSON object in English and preserve the entire conflict description verbatim." : ""}`,
        },
      ],
      response_format: zodResponseFormat(groupContextGuidanceSchema, "group_context_guidance"),
      ...getKimiModelSettings(model),
    }, { timeout: KIMI_REQUEST_TIMEOUTS.context, maxRetries: 1 });

    if (completion.choices[0]?.finish_reason === "length") throw new AiProviderFailure("truncated");
    const guidance = parseStructuredOutput(completion.choices[0]?.message.content, groupContextGuidanceSchema);
    if (!guidance.literal_source.includes(context.conflict.trim())) throw new AiProviderFailure("grounding_failed");
    assertEnglishOnly([
      ["task_division_context", guidance.task_division_context],
      ["follow_up_context", guidance.follow_up_context],
      ["disagreement_context", guidance.disagreement_context],
      ["uncertainty", guidance.uncertainty],
      ["constructive_next_move", guidance.constructive_next_move],
    ]);
    return guidance;
  }

  async generateTeammateReply(context: GroupPracticeContext, messages: GroupPracticeMessage[]) {
    try {
      return await this.requestTeammateReply(context, messages, false);
    } catch (error) {
      if (!shouldRetryLanguageFailure(error)) throw error;
      logAiRetry({ operation: "practice", model: this.modelFor("practice"), error });
      return this.requestTeammateReply(context, messages, true);
    }
  }

  private async requestTeammateReply(context: GroupPracticeContext, messages: GroupPracticeMessage[], retry: boolean) {
    const model = this.modelFor("practice");
    const completion = await this.client.chat.completions.create({
      model,
      messages: [
        {
          role: "system",
          content: `${GROUP_ROLEPLAY_PROMPT}${retry ? "\nThe previous response used a non-English script. Respond only in natural English." : ""}`,
        },
        { role: "user", content: buildGroupContext(context) },
        ...messages.map((message) => ({ role: message.role, content: message.content })),
      ],
      ...getKimiModelSettings(model),
    }, { timeout: KIMI_REQUEST_TIMEOUTS.practice, maxRetries: 1 });

    if (completion.choices[0]?.finish_reason === "length") throw new AiProviderFailure("truncated");
    const teammateReply = completion.choices[0]?.message.content?.trim();
    if (!teammateReply) throw new AiProviderFailure("empty_response");
    assertEnglishOnly([["teammate_reply", teammateReply]]);
    return teammateReply;
  }

  async generateGroupFeedback(context: GroupPracticeContext, messages: GroupPracticeMessage[]) {
    try {
      return await this.requestGroupFeedback(context, messages, false);
    } catch (error) {
      if (!shouldRetryStructuredFailure(error)) throw error;
      logAiRetry({ operation: "feedback", model: this.modelFor("feedback"), error });
      return this.requestGroupFeedback(context, messages, true);
    }
  }

  private async requestGroupFeedback(context: GroupPracticeContext, messages: GroupPracticeMessage[], retry: boolean) {
    const model = this.modelFor("feedback");
    const completion = await this.client.chat.completions.create({
      model,
      messages: [
        { role: "system", content: GROUP_FEEDBACK_PROMPT },
        {
          role: "user",
          content: `${buildGroupFeedbackInput(context, messages)}${retry ? "\nThis is a retry after an invalid response. Follow the exact JSON fields, types, counts, English-only requirement, and verbatim transcript-grounding requirements." : ""}`,
        },
      ],
      response_format: zodResponseFormat(groupFeedbackReportSchema, "group_project_feedback"),
      ...getKimiModelSettings(model),
    }, { timeout: KIMI_REQUEST_TIMEOUTS.feedback, maxRetries: 1 });

    if (completion.choices[0]?.finish_reason === "length") throw new AiProviderFailure("truncated");
    const report = parseStructuredOutput(completion.choices[0]?.message.content, groupFeedbackReportSchema);
    const studentResponses = messages.filter((message) => message.role === "user").map((message) => message.content);
    if (report.improvements.some((improvement) => !studentResponses.some((response) => response.includes(improvement.original_response)))) {
      throw new AiProviderFailure("grounding_failed");
    }
    assertEnglishOnly([
      ["summary", report.summary],
      ...report.strengths.map((value, index) => [`strengths.${index}`, value] as [string, string]),
      ...report.improvements.flatMap((improvement, index) => [
        [`improvements.${index}.observation`, improvement.observation] as [string, string],
        [`improvements.${index}.why_it_matters`, improvement.why_it_matters] as [string, string],
        [`improvements.${index}.suggested_response`, improvement.suggested_response] as [string, string],
      ]),
      ["campus_context", report.campus_context],
      ["conversation_plan.opening", report.conversation_plan.opening],
      ...report.conversation_plan.points_to_raise.map((value, index) => [`conversation_plan.points_to_raise.${index}`, value] as [string, string]),
      ...report.conversation_plan.questions.map((value, index) => [`conversation_plan.questions.${index}`, value] as [string, string]),
      ["conversation_plan.closing", report.conversation_plan.closing],
      ...report.task_division.flatMap((item, index) => [
        [`task_division.${index}.owner`, item.owner] as [string, string],
        [`task_division.${index}.task`, item.task] as [string, string],
        [`task_division.${index}.deadline`, item.deadline] as [string, string],
      ]),
      ["follow_up_message", report.follow_up_message],
    ]);
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
