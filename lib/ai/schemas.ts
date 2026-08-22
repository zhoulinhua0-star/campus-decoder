import { z } from "zod";

export const coachingLanguageSchema = z.enum(["English", "简体中文"]);

export const practiceContextSchema = z.object({
  course: z.string().trim().min(2).max(120),
  goal: z.string().trim().min(4).max(500),
  whatHappened: z.string().trim().min(4).max(1200),
  concern: z.string().trim().max(500),
  professorFeedback: z.string().trim().max(2000),
  preferredLanguage: coachingLanguageSchema,
});

export const practiceMessageSchema = z.object({
  role: z.enum(["user", "assistant"]),
  content: z.string().trim().min(1).max(2000),
});

export const practiceRequestSchema = z.object({
  context: practiceContextSchema,
  messages: z.array(practiceMessageSchema).min(2).max(20),
}).refine(({ messages }) => messages.some((message) => message.role === "user"), {
  message: "At least one student response is required.",
  path: ["messages"],
});

export const feedbackRequestSchema = z.object({
  context: practiceContextSchema,
  messages: z.array(practiceMessageSchema).min(2).max(20),
}).refine(({ messages }) => messages.some((message) => message.role === "user"), {
  message: "At least one student response is required.",
  path: ["messages"],
});

export const translationRequestSchema = z.object({
  text: z.string().trim().min(1).max(2000).refine((text) => /[\u3400-\u9fff]/u.test(text), {
    message: "The draft must include Chinese text.",
  }),
});

export const naturalEnglishSchema = z.string().trim().min(1).max(2000).refine((text) => !/[\u3400-\u9fff]/u.test(text), {
  message: "The translation must be English only.",
});

const improvementSchema = z.object({
  dimension: z.enum(["Clarity", "Tone", "Specificity", "Initiative", "Campus fit"]),
  observation: z.string().trim().min(1).max(500),
  why_it_matters: z.string().trim().min(1).max(700),
  original_response: z.string().trim().min(1).max(2000),
  suggested_response: z.string().trim().min(1).max(2000),
});

export const feedbackReportSchema = z.object({
  summary: z.string().trim().min(1).max(1200),
  strengths: z.array(z.string().trim().min(1).max(500)).length(2),
  improvements: z.array(improvementSchema).length(2),
  ratings: z.object({
    clarity: z.number().int().min(1).max(5),
    tone: z.number().int().min(1).max(5),
    specificity: z.number().int().min(1).max(5),
    initiative: z.number().int().min(1).max(5),
    campus_fit: z.number().int().min(1).max(5),
  }),
  campus_context: z.array(z.object({
    literal_meaning: z.string().trim().min(1).max(700),
    likely_context: z.string().trim().min(1).max(700),
    constructive_next_move: z.string().trim().min(1).max(700),
  })).min(1).max(3),
  action_plan: z.object({
    goal: z.string().trim().min(1).max(500),
    opening: z.string().trim().min(1).max(700),
    questions: z.array(z.string().trim().min(1).max(500)).min(2).max(4),
    evidence_to_bring: z.array(z.string().trim().min(1).max(500)).min(1).max(4),
    closing: z.string().trim().min(1).max(700),
  }),
});
