import { z } from "zod";

export const emailPracticeContextSchema = z.object({
  course: z.string().trim().min(2).max(120),
  recipient: z.string().trim().min(2).max(120),
  purpose: z.string().trim().min(4).max(500),
  whatHappened: z.string().trim().min(4).max(1200),
  concern: z.string().trim().max(500),
  existingDraft: z.string().trim().min(10).max(4000),
});

export const emailContextRequestSchema = z.object({
  context: emailPracticeContextSchema,
});

export const emailContextGuidanceSchema = z.object({
  literal_source: z.string().trim().min(1).max(5200),
  campus_context: z.string().trim().min(1).max(1200),
  uncertainty: z.string().trim().min(1).max(1200),
  constructive_next_move: z.string().trim().min(1).max(1200),
});

export const emailHintRequestSchema = z.object({
  context: emailPracticeContextSchema,
  draft: z.string().trim().min(10).max(4000),
});

export const emailHintSchema = z.object({
  focus: z.enum(["Tone", "Clarity", "Specificity", "Request"]),
  observation: z.string().trim().min(1).max(500),
  revision_prompt: z.string().trim().min(1).max(500),
  sentence_starter: z.string().trim().min(1).max(300),
});

const emailImprovementSchema = z.object({
  dimension: z.enum(["Tone", "Clarity", "Specificity", "Request"]),
  observation: z.string().trim().min(1).max(500),
  why_it_matters: z.string().trim().min(1).max(700),
  original_excerpt: z.string().trim().min(1).max(2000),
  suggested_edit: z.string().trim().min(1).max(2000),
});

export const emailFeedbackRequestSchema = z.object({
  context: emailPracticeContextSchema,
  revisedDraft: z.string().trim().min(10).max(4000),
}).refine(({ context, revisedDraft }) => revisedDraft.trim() !== context.existingDraft.trim(), {
  message: "Revise the draft before requesting feedback.",
  path: ["revisedDraft"],
});

export const emailFeedbackReportSchema = z.object({
  summary: z.string().trim().min(1).max(1200),
  strengths: z.array(z.string().trim().min(1).max(500)).length(2),
  improvements: z.array(emailImprovementSchema).length(2),
  ratings: z.object({
    tone: z.number().int().min(1).max(5),
    clarity: z.number().int().min(1).max(5),
    specificity: z.number().int().min(1).max(5),
    request_clarity: z.number().int().min(1).max(5),
  }),
  campus_context: z.string().trim().min(1).max(1000),
  subject_line: z.string().trim().min(1).max(200),
  final_email: z.string().trim().min(10).max(5000),
});
