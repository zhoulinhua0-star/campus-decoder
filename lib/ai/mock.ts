import type { FeedbackReport, PracticeContext, PracticeMessage } from "@/types/practice";
import { DEMO_OPENING } from "@/lib/ai/constants";

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
  const chinese = context.preferredLanguage === "简体中文";
  const studentResponses = messages.filter((message) => message.role === "user").map((message) => message.content);
  const firstResponse = studentResponses[0] || "No student response was recorded.";
  const latestResponse = studentResponses.at(-1) || firstResponse;
  const latestProfessorReply = messages.filter((message) => message.role === "assistant").at(-1)?.content
    || "What would you like to discuss?";
  const sourceToBring = context.professorFeedback.trim()
    ? "The professor feedback you provided"
    : "Any written feedback or notes you have";

  return {
    summary: chinese
      ? "这是代表性的 Demo 反馈，用于展示 Campus Decoder 的反馈结构。下面引用的表达来自你刚才的练习，但评分与建议尚未经过 AI 个性化分析。"
      : "This representative demo shows how Campus Decoder structures feedback. The quoted responses come from your practice, but the ratings and coaching have not been personalized by AI.",
    strengths: chinese
      ? ["你完成了一次 Office Hours 练习，并留下了可以继续修改的真实表达。", `你的练习围绕一个明确目标展开：“${context.goal}”`]
      : ["You completed an Office Hours practice and now have real wording you can revise.", `Your practice was anchored in a stated goal: “${context.goal}”`],
    improvements: [
      {
        dimension: "Tone",
        observation: chinese ? "检查开场是否直接说明了会面的目的，同时保持自然和礼貌。" : "Check whether the opening states the meeting’s purpose directly while staying natural and polite.",
        why_it_matters: chinese ? "清楚的开场能帮助教授迅速理解你需要什么，也不需要通过过度道歉来证明礼貌。" : "A clear opening helps the professor understand what you need without requiring excessive apology.",
        original_response: firstResponse,
        suggested_response: "Thanks for meeting with me. I’d like to better understand the feedback and decide what to improve next.",
      },
      {
        dimension: "Specificity",
        observation: chinese ? "检查问题是否指向了一条具体评语、段落或下一步修改。" : "Check whether the question points to a specific comment, passage, or next revision step.",
        why_it_matters: chinese ? "具体问题更容易得到有针对性的解释，也能让会面产生一个可执行的结果。" : "Specific questions make focused guidance and an actionable outcome more likely.",
        original_response: latestResponse,
        suggested_response: "Could we look at one specific comment together? I’d like to understand what I should change in my next revision.",
      },
    ],
    ratings: { clarity: 4, tone: 3, specificity: 3, initiative: 4, campus_fit: 4 },
    campus_context: [{
      literal_meaning: chinese ? `教授在练习中说：“${latestProfessorReply}”` : `In the practice, the professor says: “${latestProfessorReply}”`,
      likely_context: chinese ? "这通常是在邀请你设定谈话重点，而不是在考验你是否有资格来 Office Hours。" : "This commonly invites you to set the meeting’s focus; it is not a test of whether you deserve to be there.",
      constructive_next_move: chinese ? "指出一条具体评语、相关段落，以及你已经尝试理解的地方。" : "Name one written comment, the related paragraph, and what you have already tried to understand.",
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
