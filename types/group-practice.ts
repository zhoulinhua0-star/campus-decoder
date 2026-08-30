import type { PracticeMessage } from "@/types/practice";

export type GroupPracticeContext = {
  course: string;
  role: string;
  projectSituation: string;
  conflict: string;
  goal: string;
  concern: string;
};

export type GroupPracticeMessage = PracticeMessage;

export type GroupContextGuidance = {
  literal_source: string;
  task_division_context: string;
  follow_up_context: string;
  disagreement_context: string;
  uncertainty: string;
  constructive_next_move: string;
};

export type GroupFeedbackDimension = "Directness" | "Constructiveness" | "Accountability" | "Specific action";

export type GroupFeedbackReport = {
  summary: string;
  strengths: string[];
  improvements: {
    dimension: GroupFeedbackDimension;
    observation: string;
    why_it_matters: string;
    original_response: string;
    suggested_response: string;
  }[];
  ratings: {
    directness: number;
    constructiveness: number;
    accountability: number;
    specific_action: number;
  };
  campus_context: string;
  conversation_plan: {
    opening: string;
    points_to_raise: string[];
    questions: string[];
    closing: string;
  };
  task_division: {
    owner: string;
    task: string;
    deadline: string;
  }[];
  follow_up_message: string;
};

export type GroupContextApiResponse = {
  guidance: GroupContextGuidance;
  mode: "live" | "demo";
  notice: string | null;
};

export type GroupPracticeApiResponse = {
  teammateReply: string;
  mode: "live" | "demo";
  notice: string | null;
};

export type GroupFeedbackApiResponse = {
  report: GroupFeedbackReport;
  mode: "live" | "demo";
  notice: string | null;
};
