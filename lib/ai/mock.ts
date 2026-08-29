import type { ContextGuidance, FeedbackReport, PracticeContext, PracticeMessage } from "@/types/practice";
import { DEMO_OPENING } from "@/lib/ai/constants";

export function getMockContextGuidance(context: PracticeContext): ContextGuidance {
  const feedback = context.professorFeedback.trim();
  const concern = context.concern.trim();

  return {
    literal_source: feedback
      ? `The professor feedback you provided says: “${feedback}”`
      : `You described what happened this way: “${context.whatHappened}”`,
    campus_context: concern
      ? `You named this concern: “${concern}”\n\nIn office hours, asking a professor to explain specific feedback usually shows initiative; it does not automatically mean you are challenging the grade or wasting the professor’s time.`
      : "Office hours are a normal place to clarify course material, assignment feedback, and possible ways to improve. A specific question usually signals initiative; it does not automatically challenge the grade.",
    uncertainty: feedback
      ? "The written feedback alone cannot tell us which change the professor would prioritize or what private intention sits behind the comment. Only the professor can clarify the specific standard and next priority."
      : "Without the professor’s exact wording, we cannot know which part they would prioritize or infer their private intention. Office hours can help you ask directly and clarify the missing detail.",
    constructive_next_move: `Bring the relevant work, the course prompt, and ${feedback ? "this feedback" : "any notes you have"}. State your goal—“${context.goal}”—then ask the professor to look at one specific example with you and identify one next step to try.`,
  };
}

export function getMockProfessorReply(messages: PracticeMessage[]) {
  const studentTurns = messages.filter((message) => message.role === "user");
  const latest = studentTurns.at(-1)?.content.toLowerCase() || "";

  if (studentTurns.length === 0) return DEMO_OPENING;
  if (studentTurns.length === 1) {
    if (latest.includes("grade") || latest.includes("score")) {
      return "I understand that the grade was disappointing. Which part of my written feedback would be most useful for us to look at first?";
    }
    return "Thanks for coming in. Could you point me to one part of the feedback or essay you would most like to understand?";
  }
  if (studentTurns.length === 2) {
    return "That is a useful place to start. What were you trying to communicate in that section, and how might you revise it now?";
  }
  return "That revision direction sounds more specific. Before we finish, what is one question you still want answered for your next essay?";
}

export function getMockFeedback(context: PracticeContext, messages: PracticeMessage[]): FeedbackReport {
  const studentResponses = messages.filter((message) => message.role === "user").map((message) => message.content);
  const firstResponse = studentResponses[0] || "No student response was recorded.";
  const latestResponse = studentResponses.at(-1) || firstResponse;
  const latestProfessorReply = messages.filter((message) => message.role === "assistant").at(-1)?.content
    || "What would you like to discuss?";
  const sourceToBring = context.professorFeedback.trim()
    ? "The professor feedback you provided"
    : "Any written feedback or notes you have";

  return {
    summary: "This representative demo shows how Campus Decoder structures feedback. The quoted responses come from your practice, but the ratings and coaching have not been personalized by AI.",
    strengths: ["You completed an Office Hours practice and now have real wording you can revise.", `Your practice was anchored in a stated goal: “${context.goal}”`],
    improvements: [
      {
        dimension: "Tone",
        observation: "Check whether the opening states the meeting’s purpose directly while staying natural and polite.",
        why_it_matters: "A clear opening helps the professor understand what you need without requiring excessive apology.",
        original_response: firstResponse,
        suggested_response: "Thanks for meeting with me. I’d like to better understand the feedback and decide what to improve next.",
      },
      {
        dimension: "Specificity",
        observation: "Check whether the question points to a specific comment, passage, or next revision step.",
        why_it_matters: "Specific questions make focused guidance and an actionable outcome more likely.",
        original_response: latestResponse,
        suggested_response: "Could we look at one specific comment together? I’d like to understand what I should change in my next revision.",
      },
    ],
    ratings: { clarity: 4, tone: 3, specificity: 3, initiative: 4, campus_fit: 4 },
    campus_context: [{
      literal_meaning: `In the practice, the professor says: “${latestProfessorReply}”`,
      likely_context: "This commonly invites you to set the meeting’s focus; it is not a test of whether you deserve to be there.",
      constructive_next_move: "Name one written comment, the related paragraph, and what you have already tried to understand.",
    }],
    action_plan: {
      goal: context.goal,
      opening: "Thanks for meeting with me. I’d like to better understand the feedback and leave with a concrete next step.",
      questions: [
        "Could we look at one specific comment together?",
        "What is one change you recommend I try next?",
        "How can I tell whether I have applied that feedback successfully?",
      ],
      evidence_to_bring: [sourceToBring, "The assignment or course prompt", "One example or attempted revision"],
      closing: "Thank you—my next step is to apply this feedback in my next revision. Would it be okay if I bring one follow-up question to the next office hour?",
    },
  };
}
