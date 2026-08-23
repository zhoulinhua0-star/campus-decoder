import type { ContextGuidance, FeedbackReport, PracticeContext, PracticeMessage } from "@/types/practice";
import { DEMO_OPENING } from "@/lib/ai/constants";

export function getMockContextGuidance(context: PracticeContext): ContextGuidance {
  const chinese = context.preferredLanguage === "简体中文";
  const feedback = context.professorFeedback.trim();
  const concern = context.concern.trim();

  if (chinese) {
    return {
      literal_source: feedback
        ? `你提供的教授反馈原文是：“${feedback}”`
        : `你对事情经过的描述是：“${context.whatHappened}”`,
      campus_context: concern
        ? `你提到的担忧是：“${concern}”\n\n在 Office Hours 中，请教授解释具体反馈通常是在主动学习，并不自动代表你在质疑分数或给教授添麻烦。`
        : "Office Hours 通常就是用来澄清课程内容、作业反馈和改进方向的。提出具体问题通常体现主动性，并不自动代表你在质疑分数。",
      uncertainty: feedback
        ? "仅凭这段书面反馈，我们无法确定教授最希望你优先修改什么，也无法知道这段评语背后的个人意图。只有教授本人能进一步说明具体标准和优先顺序。"
        : "你没有提供教授的原话，因此我们无法判断教授具体指的是哪一部分，也不能推测教授的个人意图。Office Hours 可以帮助你直接确认这些信息。",
      constructive_next_move: `带上相关作业、课程要求${feedback ? "和这条反馈" : "以及你现有的笔记"}。先说明你的目标：“${context.goal}”，再请教授一起看一个具体例子，并确认一个可以尝试的下一步。`,
    };
  }

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
