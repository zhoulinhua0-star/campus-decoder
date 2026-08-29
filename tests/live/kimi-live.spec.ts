import { expect, test } from "@playwright/test";
import { getAiProvider } from "@/lib/ai/providers";
import type { PracticeContext, PracticeMessage } from "@/types/practice";

const englishContext: PracticeContext = {
  course: "First-Year Writing Seminar",
  goal: "Understand why my evidence does not support my thesis and choose one revision step",
  whatHappened: "My first essay received a lower grade than I expected, and I am unsure how to revise it.",
  concern: "I worry that asking about the feedback will sound like I am challenging the grade.",
  professorFeedback: "Your thesis is too broad, and the paragraph does not explain how the evidence supports the claim.",
};

const studentResponse = "Thank you for meeting with me. Could we look at the paragraph comment and identify one place where I should explain the evidence more clearly?";

function containsChinese(value: string) {
  return /[\u3400-\u9fff]/u.test(value);
}

function requireLiveProvider() {
  if (!process.env.MOONSHOT_API_KEY) throw new Error("MOONSHOT_API_KEY is required for the funded Kimi evaluation.");
  const provider = getAiProvider();
  expect(provider.mode).toBe("live");
  return provider;
}

test("evaluates funded Kimi Context in English", async () => {
  const provider = requireLiveProvider();
  const metrics: Record<string, { model: string; elapsedMs: number }> = {};

  async function measure<T>(name: string, operation: "context" | "practice" | "feedback", run: () => Promise<T>) {
    const startedAt = Date.now();
    const result = await run();
    metrics[name] = { model: provider.modelFor(operation), elapsedMs: Date.now() - startedAt };
    return result;
  }

  const englishGuidance = await measure("contextEnglish", "context", () => provider.generateContextGuidance(englishContext));
  expect(englishGuidance.literal_source).toContain(englishContext.professorFeedback);
  expect(containsChinese(englishGuidance.campus_context)).toBe(false);

  console.log(JSON.stringify({ event: "kimi_live_evaluation", scope: "context", metrics }));
});

test("evaluates funded Kimi Practice opening and reply", async () => {
  const provider = requireLiveProvider();
  const metrics: Record<string, { model: string; elapsedMs: number }> = {};
  async function measure<T>(name: string, run: () => Promise<T>) {
    const startedAt = Date.now();
    const result = await run();
    metrics[name] = { model: provider.modelFor("practice"), elapsedMs: Date.now() - startedAt };
    return result;
  }

  const opening = await measure("practiceOpening", () => provider.generateProfessorReply(englishContext, []));
  expect(opening).not.toContain(englishContext.concern);
  expect(containsChinese(opening)).toBe(false);

  const messages: PracticeMessage[] = [
    { role: "assistant", content: opening },
    { role: "user", content: studentResponse },
  ];
  const professorReply = await measure("practiceReply", () => provider.generateProfessorReply(englishContext, messages));
  expect(containsChinese(professorReply)).toBe(false);
  console.log(JSON.stringify({ event: "kimi_live_evaluation", scope: "practice", metrics }));
});

const completedMessages: PracticeMessage[] = [
  { role: "assistant", content: "Welcome. What would be most useful for us to focus on today?" },
  { role: "user", content: studentResponse },
  { role: "assistant", content: "Yes. Which part of the paragraph would you like to examine first?" },
];

test("evaluates funded Kimi Feedback in English", async () => {
  const provider = requireLiveProvider();
  const startedAt = Date.now();
  const englishFeedback = await provider.generateFeedback(englishContext, completedMessages);
  expect(englishFeedback.strengths).toHaveLength(2);
  expect(englishFeedback.improvements).toHaveLength(2);
  expect(englishFeedback.improvements.every((improvement) => studentResponse.includes(improvement.original_response))).toBe(true);
  expect(englishFeedback.action_plan.questions.length).toBeGreaterThanOrEqual(2);
  console.log(JSON.stringify({
    event: "kimi_live_evaluation",
    scope: "feedbackEnglish",
    metrics: { feedbackEnglish: { model: provider.modelFor("feedback"), elapsedMs: Date.now() - startedAt } },
  }));
});
