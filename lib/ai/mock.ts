import type { CoachingLanguage, FeedbackReport, PracticeMessage } from "@/types/practice";

export function getMockProfessorReply(messages: PracticeMessage[]) {
  const studentTurns = messages.filter((message) => message.role === "user");
  const latest = studentTurns.at(-1)?.content.toLowerCase() || "";

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

export function getMockFeedback(language: CoachingLanguage): FeedbackReport {
  const chinese = language === "简体中文";
  return {
    summary: chinese
      ? "你把谈话重点从“争取分数”转向了“理解反馈并改进”，这让交流显得积极而有建设性。下一步可以减少开场时的过度道歉，并更早指出具体想讨论的评语。"
      : "You shifted the conversation from disputing a grade to understanding feedback and improving. The next step is to reduce the apology in your opening and name the exact feedback you want to discuss sooner.",
    strengths: chinese
      ? ["清楚表达了希望改进下一篇论文，而不只是询问分数。", "认真回应教授的问题，并尝试用自己的话解释写作意图。"]
      : ["You made improvement—not the grade itself—the purpose of the meeting.", "You responded thoughtfully and explained what you were trying to do in the essay."],
    improvements: [
      {
        dimension: "Tone",
        observation: chinese ? "开场中的多次道歉让你的合理请求听起来像是一种打扰。" : "Repeated apologies made a reasonable request sound like an interruption.",
        why_it_matters: chinese ? "Office Hours 本来就是用于这类讨论；礼貌不需要以贬低自己的需求为代价。" : "Office hours exist for this kind of conversation; politeness does not require minimizing your need for help.",
        original_response: "Sorry to bother you. I know you are probably very busy.",
        suggested_response: "Thanks for meeting with me. I’d like to better understand your feedback and improve my next essay.",
      },
      {
        dimension: "Specificity",
        observation: chinese ? "你提出了想了解反馈，但没有立刻指出最困惑的具体部分。" : "You asked to understand the feedback without immediately naming the part that confused you most.",
        why_it_matters: chinese ? "具体问题可以帮助教授给出更有针对性的解释，也体现你提前做了准备。" : "A specific question helps the professor give focused guidance and shows that you prepared.",
        original_response: "I don’t really understand why this part was wrong.",
        suggested_response: "Could we look at your comment about my thesis being too broad? I’d like to understand what a more focused version would do differently.",
      },
    ],
    ratings: { clarity: 4, tone: 3, specificity: 3, initiative: 4, campus_fit: 4 },
    campus_context: [{
      literal_meaning: chinese ? "教授问：“你最想先看哪一部分反馈？”" : "The professor asks, “Which part of the feedback should we look at first?”",
      likely_context: chinese ? "这通常是在邀请你设定谈话重点，而不是在考验你是否有资格来 Office Hours。" : "This commonly invites you to set the meeting’s focus; it is not a test of whether you deserve to be there.",
      constructive_next_move: chinese ? "指出一条具体评语、相关段落，以及你已经尝试理解的地方。" : "Name one written comment, the related paragraph, and what you have already tried to understand.",
    }],
    action_plan: {
      goal: "Understand how to make my thesis more focused and apply the feedback to my next essay.",
      opening: "Thanks for meeting with me. I’d like to understand your feedback on my thesis and make a concrete plan for improving my next essay.",
      questions: [
        "Could we look at your comment that my thesis was too broad?",
        "What would a more focused thesis help the reader understand?",
        "What is one revision strategy you recommend I practice next?",
      ],
      evidence_to_bring: ["The marked essay", "The assignment prompt", "One attempted revision of the thesis"],
      closing: "Thank you—my next step is to revise the thesis using this approach. Would it be okay if I bring one follow-up question to the next office hour?",
    },
  };
}
