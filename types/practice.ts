export type CoachingLanguage = "English" | "简体中文";

export type PracticeContext = {
  course: string;
  goal: string;
  whatHappened: string;
  concern: string;
  professorFeedback: string;
  preferredLanguage: CoachingLanguage;
};

export type PracticeMessage = {
  role: "user" | "assistant";
  content: string;
};

export type ContextGuidance = {
  literal_source: string;
  campus_context: string;
  uncertainty: string;
  constructive_next_move: string;
};

export type ContextApiResponse = {
  guidance: ContextGuidance;
  mode: "live" | "demo";
  notice: string | null;
};

export type PracticeApiResponse = {
  professorReply: string;
  mode: "live" | "demo";
  notice: string | null;
};

export type TranslationApiResponse = {
  translation: string;
  mode: "live";
};

export type Dimension = "Clarity" | "Tone" | "Specificity" | "Initiative" | "Campus fit";

export type FeedbackReport = {
  summary: string;
  strengths: string[];
  improvements: {
    dimension: Dimension;
    observation: string;
    why_it_matters: string;
    original_response: string;
    suggested_response: string;
  }[];
  ratings: {
    clarity: number;
    tone: number;
    specificity: number;
    initiative: number;
    campus_fit: number;
  };
  campus_context: {
    literal_meaning: string;
    likely_context: string;
    constructive_next_move: string;
  }[];
  action_plan: {
    goal: string;
    opening: string;
    questions: string[];
    evidence_to_bring: string[];
    closing: string;
  };
};

export type FeedbackApiResponse = {
  report: FeedbackReport;
  mode: "live" | "demo";
  notice: string | null;
};
