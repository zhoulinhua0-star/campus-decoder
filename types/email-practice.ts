export type EmailPracticeContext = {
  course: string;
  recipient: string;
  purpose: string;
  whatHappened: string;
  concern: string;
  existingDraft: string;
};

export type EmailContextGuidance = {
  literal_source: string;
  campus_context: string;
  uncertainty: string;
  constructive_next_move: string;
};

export type EmailHint = {
  focus: "Tone" | "Clarity" | "Specificity" | "Request";
  observation: string;
  revision_prompt: string;
  sentence_starter: string;
};

export type EmailFeedbackReport = {
  summary: string;
  strengths: string[];
  improvements: {
    dimension: "Tone" | "Clarity" | "Specificity" | "Request";
    observation: string;
    why_it_matters: string;
    original_excerpt: string;
    suggested_edit: string;
  }[];
  ratings: {
    tone: number;
    clarity: number;
    specificity: number;
    request_clarity: number;
  };
  campus_context: string;
  subject_line: string;
  final_email: string;
};

export type EmailContextApiResponse = {
  guidance: EmailContextGuidance;
  mode: "live" | "demo";
  notice: string | null;
};

export type EmailHintApiResponse = {
  hint: EmailHint;
  mode: "live" | "demo";
  notice: string | null;
};

export type EmailFeedbackApiResponse = {
  report: EmailFeedbackReport;
  mode: "live" | "demo";
  notice: string | null;
};
