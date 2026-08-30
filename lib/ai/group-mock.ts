import type { GroupContextGuidance, GroupFeedbackReport, GroupPracticeContext, GroupPracticeMessage } from "@/types/group-practice";

export const DEMO_TEAMMATE_OPENING = "Thanks for starting this conversation. What do you think the group needs to resolve first so we can move forward?";

function excerpt(message: string, fromEnd = false) {
  const normalized = message.trim();
  if (normalized.length <= 180) return normalized;
  return fromEnd ? normalized.slice(-180).trimStart() : normalized.slice(0, 180).trimEnd();
}

export function getMockGroupContextGuidance(context: GroupPracticeContext): GroupContextGuidance {
  return {
    literal_source: `You described the conflict this way:\n\n“${context.conflict}”`,
    task_division_context: "In many university group projects, naming one owner, one deliverable, and one deadline for each task is a coordination tool—not a judgment about who is a good teammate.",
    follow_up_context: "A timely follow-up can be constructive when it refers to an agreed task or observable deadline, checks whether the plan needs to change, and keeps the whole group informed.",
    disagreement_context: "You can disagree without making the conflict personal: state the shared goal, name the specific impact on the project, and propose a workable alternative. Directness and respect can coexist.",
    uncertainty: "The information provided cannot tell us why another group member acted this way, what they intended, or what your instructor would require. Ask the group directly and check the assignment guidance when needed.",
    constructive_next_move: `Open with the shared goal—“${context.goal}”—then ask the group to confirm one owner and one deadline for each remaining task, including your own responsibility.`,
  };
}

export function getMockTeammateReply(messages: GroupPracticeMessage[]) {
  const studentTurns = messages.filter((message) => message.role === "user").length;
  if (studentTurns === 0) return DEMO_TEAMMATE_OPENING;
  if (studentTurns === 1) return "I understand that the current plan is not working for you. What specific task split and deadline would you like us to agree on?";
  return "That sounds workable. Can we write down who owns each part and choose a time to check in before the deadline?";
}

export function getMockGroupFeedback(context: GroupPracticeContext, messages: GroupPracticeMessage[]): GroupFeedbackReport {
  const studentResponses = messages.filter((message) => message.role === "user").map((message) => message.content);
  const first = excerpt(studentResponses[0] || "I would like us to make the task division clearer.");
  const last = excerpt(studentResponses.at(-1) || first, true);

  return {
    summary: "This representative demo shows how Campus Decoder reviews a group-project conversation. The excerpts come from your actual practice, while the ratings and coaching use fixed demo rules rather than personalized AI analysis.",
    strengths: [
      "You raised the issue in a conversation instead of leaving the group to guess what was wrong.",
      `You kept the practice connected to a constructive goal: “${context.goal}”`,
    ],
    improvements: [
      {
        dimension: "Directness",
        observation: "Name the observable project problem early, without guessing why it happened.",
        why_it_matters: "A specific fact gives teammates something concrete to respond to and reduces the chance that the conversation feels like a personal accusation.",
        original_response: first,
        suggested_response: "I want to flag that [specific deliverable] is still unassigned or incomplete, and it affects [project impact].",
      },
      {
        dimension: "Specific action",
        observation: "End with a proposed owner, deliverable, deadline, or check-in that the group can confirm or revise.",
        why_it_matters: "A concrete proposal turns concern into a decision and makes follow-up fairer for everyone.",
        original_response: last,
        suggested_response: "Could we confirm who owns each remaining section and set a check-in for [day/time]? I can take responsibility for [your task].",
      },
    ],
    ratings: { directness: 3, constructiveness: 4, accountability: 3, specific_action: 3 },
    campus_context: "Group-project norms often reward visible coordination: clear ownership, documented deadlines, early follow-up, and asking an instructor for process guidance when the group cannot resolve a recurring problem. This does not require blaming a teammate or accepting all the work yourself.",
    conversation_plan: {
      opening: `I want us to finish ${context.course} successfully, and I would like to clarify how we are handling the remaining work.`,
      points_to_raise: [
        `Describe the observable issue: ${context.conflict}`,
        "Explain the impact on the project without assigning a motive.",
        `State the outcome you want: ${context.goal}`,
      ],
      questions: ["Which remaining task can each person own?", "What deadline and check-in time can everyone commit to?"],
      closing: "I will write down the plan after we talk so everyone can correct anything I misunderstood.",
    },
    task_division: [
      { owner: "You", task: `[Add the task that fits your role: ${context.role}]`, deadline: "[Date and time]" },
      { owner: "Teammate(s)", task: "[Add the agreed remaining deliverable]", deadline: "[Date and time]" },
      { owner: "Whole group", task: "Review the combined draft and flag missing work", deadline: "[Check-in date and time]" },
    ],
    follow_up_message: `Hi everyone, thanks for talking about the project. Here is the task plan I understood:\n\n- I will complete [my task] by [date/time].\n- [Name] will complete [task] by [date/time].\n- We will check the combined work on [date/time].\n\nPlease reply if I missed or misunderstood anything. Our shared goal is ${context.goal}.`,
  };
}
