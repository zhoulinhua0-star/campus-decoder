import type { EmailContextGuidance, EmailFeedbackReport, EmailHint, EmailPracticeContext } from "@/types/email-practice";

function contiguousExcerpt(draft: string, fromEnd = false) {
  const normalized = draft.trim();
  if (normalized.length <= 180) return normalized;
  return fromEnd ? normalized.slice(-180).trimStart() : normalized.slice(0, 180).trimEnd();
}

export function getMockEmailContextGuidance(context: EmailPracticeContext): EmailContextGuidance {
  const concern = context.concern.trim();
  return {
    literal_source: `The draft you provided says:\n\n“${context.existingDraft}”`,
    campus_context: `${concern ? `You named this concern: “${concern}”\n\n` : ""}A useful professor email usually makes four things easy to find: who you are, why you are writing, the relevant fact, and the response or next step you are requesting. Respect does not require repeated apologies or indirect wording.`,
    uncertainty: "The draft cannot tell us when the professor will reply, what decision they will make, or whether a course-specific policy applies. The syllabus and the professor are the appropriate sources for those details.",
    constructive_next_move: `Revise one sentence so that your purpose—“${context.purpose}”—and the response you need from ${context.recipient} are explicit, while keeping only the context needed to understand the request.`,
  };
}

export function getMockEmailHint(draft: string): EmailHint {
  const lower = draft.toLowerCase();
  const apologyCount = (lower.match(/sorry|apolog/g) || []).length;
  const hasRequest = /\?|\bcould you\b|\bwould you\b|\bcan you\b|\bmay i\b/.test(lower);

  if (!hasRequest) {
    return {
      focus: "Request",
      observation: "The reader may understand the situation but still need to infer what response you want.",
      revision_prompt: "Add one sentence that names the exact reply, meeting, clarification, or action you are requesting.",
      sentence_starter: "Would you be available to…",
    };
  }
  if (apologyCount > 1) {
    return {
      focus: "Tone",
      observation: "Repeated apologies may hide the purpose of the email and make the tone feel less confident than you intend.",
      revision_prompt: "Keep one brief courtesy, then move directly to the relevant fact and your request.",
      sentence_starter: "I’m writing to ask about…",
    };
  }
  if (draft.trim().length < 120) {
    return {
      focus: "Specificity",
      observation: "The draft is concise, but the professor may need one more concrete detail to answer efficiently.",
      revision_prompt: "Add the assignment, topic, date, or option that your request refers to.",
      sentence_starter: "For the [assignment/topic] due [date]…",
    };
  }
  return {
    focus: "Clarity",
    observation: "Your main purpose will be easier to scan if the request has its own short sentence near the end.",
    revision_prompt: "Move or restate the requested next step in one direct sentence, then close with thanks.",
    sentence_starter: "Could you please let me know whether…",
  };
}

export function getMockEmailFeedback(context: EmailPracticeContext, revisedDraft: string): EmailFeedbackReport {
  const firstExcerpt = contiguousExcerpt(revisedDraft);
  const lastExcerpt = contiguousExcerpt(revisedDraft, true);
  const subjectLine = `${context.course}: ${context.purpose}`.replace(/\s+/g, " ").slice(0, 120);

  return {
    summary: "This representative demo shows how Campus Decoder reviews a professor email. The excerpts and final editable body come from your revision, while the ratings and coaching use fixed demo rules rather than personalized AI analysis.",
    strengths: [
      "You revised your own draft before asking for feedback, so the message keeps your purpose and voice.",
      `The email is connected to a concrete purpose: “${context.purpose}”`,
    ],
    improvements: [
      {
        dimension: "Clarity",
        observation: "Check that the purpose appears early enough for a busy reader to understand it on the first pass.",
        why_it_matters: "An early purpose sentence makes the rest of the context easier to interpret.",
        original_excerpt: firstExcerpt,
        suggested_edit: "I’m writing to ask about [state the purpose in one sentence].",
      },
      {
        dimension: "Request",
        observation: "Check that the final request names the exact response or next step you need.",
        why_it_matters: "A specific request helps the professor answer without guessing what would be useful.",
        original_excerpt: lastExcerpt,
        suggested_edit: "Could you please let me know whether [specific request] would be possible?",
      },
    ],
    ratings: { tone: 4, clarity: 3, specificity: 3, request_clarity: 3 },
    campus_context: "Professor emails are often read quickly. A concise greeting, clear purpose, necessary context, and explicit request usually communicate respect more effectively than formality or repeated apology alone.",
    subject_line: subjectLine,
    final_email: revisedDraft.trim(),
  };
}
