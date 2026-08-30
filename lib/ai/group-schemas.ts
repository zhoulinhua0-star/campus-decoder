import { z } from "zod";
import { practiceMessageSchema } from "@/lib/ai/schemas";

export const groupPracticeContextSchema = z.object({
  course: z.string().trim().min(2).max(120),
  role: z.string().trim().min(2).max(300),
  projectSituation: z.string().trim().min(4).max(1200),
  conflict: z.string().trim().min(4).max(1600),
  goal: z.string().trim().min(4).max(500),
  concern: z.string().trim().max(700),
});

export const groupContextRequestSchema = z.object({ context: groupPracticeContextSchema });

export const groupContextGuidanceSchema = z.object({
  literal_source: z.string().trim().min(1).max(2200),
  task_division_context: z.string().trim().min(1).max(1200),
  follow_up_context: z.string().trim().min(1).max(1200),
  disagreement_context: z.string().trim().min(1).max(1200),
  uncertainty: z.string().trim().min(1).max(1200),
  constructive_next_move: z.string().trim().min(1).max(1200),
});

export const groupPracticeRequestSchema = z.object({
  context: groupPracticeContextSchema,
  messages: z.array(practiceMessageSchema).max(20),
}).refine(({ messages }) => messages.length === 0 || messages.some((message) => message.role === "user"), {
  message: "A continued conversation must include at least one student response.",
  path: ["messages"],
});

export const groupFeedbackRequestSchema = z.object({
  context: groupPracticeContextSchema,
  messages: z.array(practiceMessageSchema).min(2).max(20),
}).refine(({ messages }) => messages.some((message) => message.role === "user"), {
  message: "At least one student response is required.",
  path: ["messages"],
});

const groupImprovementSchema = z.object({
  dimension: z.enum(["Directness", "Constructiveness", "Accountability", "Specific action"]),
  observation: z.string().trim().min(1).max(500),
  why_it_matters: z.string().trim().min(1).max(700),
  original_response: z.string().trim().min(1).max(2000),
  suggested_response: z.string().trim().min(1).max(2000),
});

export const groupFeedbackReportSchema = z.object({
  summary: z.string().trim().min(1).max(1200),
  strengths: z.array(z.string().trim().min(1).max(500)).length(2),
  improvements: z.array(groupImprovementSchema).length(2),
  ratings: z.object({
    directness: z.number().int().min(1).max(5),
    constructiveness: z.number().int().min(1).max(5),
    accountability: z.number().int().min(1).max(5),
    specific_action: z.number().int().min(1).max(5),
  }),
  campus_context: z.string().trim().min(1).max(1200),
  conversation_plan: z.object({
    opening: z.string().trim().min(1).max(700),
    points_to_raise: z.array(z.string().trim().min(1).max(500)).min(2).max(4),
    questions: z.array(z.string().trim().min(1).max(500)).min(1).max(4),
    closing: z.string().trim().min(1).max(700),
  }),
  task_division: z.array(z.object({
    owner: z.string().trim().min(1).max(200),
    task: z.string().trim().min(1).max(700),
    deadline: z.string().trim().min(1).max(300),
  })).min(2).max(6),
  follow_up_message: z.string().trim().min(10).max(3000),
});
