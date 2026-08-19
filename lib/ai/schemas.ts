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
});

export const feedbackRequestSchema = z.object({
  context: practiceContextSchema,
  messages: z.array(practiceMessageSchema).min(2).max(20),
});

const improvementSchema = z.object({
  dimension: z.enum(["Clarity", "Tone", "Specificity", "Initiative", "Campus fit"]),
  observation: z.string(),
  why_it_matters: z.string(),
  original_response: z.string(),
  suggested_response: z.string(),
});

export const feedbackReportSchema = z.object({
  summary: z.string(),
  strengths: z.array(z.string()),
  improvements: z.array(improvementSchema),
  ratings: z.object({
    clarity: z.number(),
    tone: z.number(),
    specificity: z.number(),
    initiative: z.number(),
    campus_fit: z.number(),
  }),
  campus_context: z.array(z.object({
    literal_meaning: z.string(),
    likely_context: z.string(),
    constructive_next_move: z.string(),
  })),
  action_plan: z.object({
    goal: z.string(),
    opening: z.string(),
    questions: z.array(z.string()),
    evidence_to_bring: z.array(z.string()),
    closing: z.string(),
  }),
});
