import { expect, test } from "@playwright/test";
import { getAiProvider } from "@/lib/ai/providers";
import type { EmailPracticeContext } from "@/types/email-practice";
import type { GroupPracticeContext, GroupPracticeMessage } from "@/types/group-practice";
import type { PracticeContext, PracticeMessage } from "@/types/practice";

const LIVE_RUNS = [1, 2, 3] as const;

const officeHoursContext: PracticeContext = {
  course: "First-Year Writing Seminar",
  goal: "Understand why my evidence does not support my thesis and choose one revision step",
  whatHappened: "My first essay received a lower grade than I expected, and I am unsure how to revise it.",
  concern: "I worry that asking about the feedback will sound like I am challenging the grade.",
  professorFeedback: "Your thesis is too broad, and the paragraph does not explain how the evidence supports the claim.",
};

const officeHoursStudentResponse = "Thank you for meeting with me. Could we look at the paragraph comment and identify one place where I should explain the evidence more clearly?";

const emailContext: EmailPracticeContext = {
  course: "First-Year Writing Seminar",
  recipient: "Professor Morgan",
  purpose: "Ask for a brief meeting about my research topic",
  whatHappened: "I narrowed my topic to two possible research questions.",
  concern: "I worry that asking for help will sound unprepared.",
  existingDraft: "Dear Professor Morgan,\n\nCould you help with my topic?\n\nBest,\nLi Wei",
};

const revisedEmail = "Dear Professor Morgan,\n\nI have narrowed my topic to two research questions. Could we meet briefly this week to discuss which one is focused enough for the assignment?\n\nBest,\nLi Wei";

const groupContext: GroupPracticeContext = {
  course: "Marketing presentation",
  role: "Research coordinator",
  projectSituation: "The group presents next week and needs to combine slides on Tuesday.",
  conflict: "One research section is late and the owner has not replied to two messages.",
  goal: "Agree on a fair task split and a new deadline",
  concern: "I worry that being direct will sound controlling.",
};

const groupStudentResponse = "The research section is late. Could we agree on an owner and a Tuesday deadline? I can combine the final slides.";

function containsNonEnglishScript(value: string) {
  return /[^\p{Script=Latin}\p{Number}\p{Punctuation}\p{Separator}\p{Symbol}\p{Mark}\s]/u.test(value);
}

function requireLiveProvider() {
  if (!process.env.MOONSHOT_API_KEY) throw new Error("MOONSHOT_API_KEY is required for the funded Kimi evaluation.");
  const provider = getAiProvider();
  expect(provider.mode).toBe("live");
  return provider;
}

for (const run of LIVE_RUNS) {
  test(`evaluates funded Kimi Office Hours journey in English, run ${run}`, async () => {
    const provider = requireLiveProvider();
    const metrics: Record<string, { model: string; elapsedMs: number }> = {};

    async function measure<T>(name: string, operation: "context" | "practice" | "feedback", task: () => Promise<T>) {
      const startedAt = Date.now();
      const result = await task();
      metrics[name] = { model: provider.modelFor(operation), elapsedMs: Date.now() - startedAt };
      return result;
    }

    const guidance = await measure("context", "context", () => provider.generateContextGuidance(officeHoursContext));
    expect(guidance.literal_source).toContain(officeHoursContext.professorFeedback);
    expect(containsNonEnglishScript(JSON.stringify(guidance))).toBe(false);

    const opening = await measure("practiceOpening", "practice", () => provider.generateProfessorReply(officeHoursContext, []));
    expect(opening).not.toContain(officeHoursContext.concern);
    expect(containsNonEnglishScript(opening)).toBe(false);

    const messages: PracticeMessage[] = [
      { role: "assistant", content: opening },
      { role: "user", content: officeHoursStudentResponse },
    ];
    const reply = await measure("practiceReply", "practice", () => provider.generateProfessorReply(officeHoursContext, messages));
    expect(containsNonEnglishScript(reply)).toBe(false);

    const completedMessages: PracticeMessage[] = [...messages, { role: "assistant", content: reply }];
    const feedback = await measure("feedback", "feedback", () => provider.generateFeedback(officeHoursContext, completedMessages));
    expect(feedback.strengths).toHaveLength(2);
    expect(feedback.improvements).toHaveLength(2);
    expect(feedback.improvements.every((item) => officeHoursStudentResponse.includes(item.original_response))).toBe(true);
    expect(feedback.action_plan.questions.length).toBeGreaterThanOrEqual(2);
    expect(containsNonEnglishScript(JSON.stringify(feedback))).toBe(false);

    console.log(JSON.stringify({ event: "kimi_live_evaluation", scenario: "office_hours", run, metrics }));
  });

  test(`evaluates funded Kimi Email journey in English, run ${run}`, async () => {
    const provider = requireLiveProvider();
    const metrics: Record<string, { model: string; elapsedMs: number }> = {};

    async function measure<T>(name: string, operation: "context" | "practice" | "feedback", task: () => Promise<T>) {
      const startedAt = Date.now();
      const result = await task();
      metrics[name] = { model: provider.modelFor(operation), elapsedMs: Date.now() - startedAt };
      return result;
    }

    const guidance = await measure("context", "context", () => provider.generateEmailContextGuidance(emailContext));
    expect(guidance.literal_source).toContain(emailContext.existingDraft);
    expect(containsNonEnglishScript(JSON.stringify(guidance))).toBe(false);

    const hint = await measure("hint", "practice", () => provider.generateEmailHint(emailContext, emailContext.existingDraft));
    expect(hint.sentence_starter.length).toBeLessThan(300);
    expect(containsNonEnglishScript(JSON.stringify(hint))).toBe(false);

    const feedback = await measure("feedback", "feedback", () => provider.generateEmailFeedback(emailContext, revisedEmail));
    expect(feedback.strengths).toHaveLength(2);
    expect(feedback.improvements).toHaveLength(2);
    expect(feedback.improvements.every((item) => revisedEmail.includes(item.original_excerpt))).toBe(true);
    expect(feedback.final_email.length).toBeGreaterThan(10);
    expect(containsNonEnglishScript(JSON.stringify(feedback))).toBe(false);

    console.log(JSON.stringify({ event: "kimi_live_evaluation", scenario: "email", run, metrics }));
  });

  test(`evaluates funded Kimi Group Project journey in English, run ${run}`, async () => {
    const provider = requireLiveProvider();
    const metrics: Record<string, { model: string; elapsedMs: number }> = {};

    async function measure<T>(name: string, operation: "context" | "practice" | "feedback", task: () => Promise<T>) {
      const startedAt = Date.now();
      const result = await task();
      metrics[name] = { model: provider.modelFor(operation), elapsedMs: Date.now() - startedAt };
      return result;
    }

    const guidance = await measure("context", "context", () => provider.generateGroupContextGuidance(groupContext));
    expect(guidance.literal_source).toContain(groupContext.conflict);
    expect(containsNonEnglishScript(JSON.stringify(guidance))).toBe(false);

    const opening = await measure("practiceOpening", "practice", () => provider.generateTeammateReply(groupContext, []));
    expect(containsNonEnglishScript(opening)).toBe(false);

    const messages: GroupPracticeMessage[] = [
      { role: "assistant", content: opening },
      { role: "user", content: groupStudentResponse },
    ];
    const reply = await measure("practiceReply", "practice", () => provider.generateTeammateReply(groupContext, messages));
    expect(containsNonEnglishScript(reply)).toBe(false);

    const completedMessages: GroupPracticeMessage[] = [...messages, { role: "assistant", content: reply }];
    const feedback = await measure("feedback", "feedback", () => provider.generateGroupFeedback(groupContext, completedMessages));
    expect(feedback.strengths).toHaveLength(2);
    expect(feedback.improvements).toHaveLength(2);
    expect(feedback.improvements.every((item) => groupStudentResponse.includes(item.original_response))).toBe(true);
    expect(feedback.task_division.length).toBeGreaterThanOrEqual(2);
    expect(feedback.follow_up_message.length).toBeGreaterThan(10);
    expect(containsNonEnglishScript(JSON.stringify(feedback))).toBe(false);

    console.log(JSON.stringify({ event: "kimi_live_evaluation", scenario: "group_project", run, metrics }));
  });
}
