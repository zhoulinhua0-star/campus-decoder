import { expect, test } from "@playwright/test";
import type OpenAI from "openai";
import { POST as createContextGuidance } from "@/app/api/context/route";
import { POST as createEmailFeedback } from "@/app/api/email/feedback/route";
import { POST as createGroupFeedback } from "@/app/api/group/feedback/route";
import { DEMO_OPENING } from "@/lib/ai/constants";
import { getMockEmailContextGuidance, getMockEmailFeedback, getMockEmailHint } from "@/lib/ai/email-mock";
import { getMockGroupContextGuidance, getMockGroupFeedback, getMockTeammateReply } from "@/lib/ai/group-mock";
import { getMockContextGuidance, getMockFeedback } from "@/lib/ai/mock";
import { DemoProvider, getAiProvider, KIMI_REQUEST_TIMEOUTS, KimiProvider } from "@/lib/ai/providers";
import { AiProviderFailure, classifyAiFailure, logAiFallback, logAiRetry } from "@/lib/ai/telemetry";
import type { PracticeContext, PracticeMessage } from "@/types/practice";
import type { EmailPracticeContext } from "@/types/email-practice";
import type { GroupPracticeContext } from "@/types/group-practice";

const context: PracticeContext = {
  course: "First-Year Writing Seminar",
  goal: "Understand the feedback",
  whatHappened: "I received unclear essay feedback.",
  concern: "I worry about wasting the professor's time.",
  professorFeedback: "The thesis is too broad.",
};

const messages: PracticeMessage[] = [
  { role: "assistant", content: "Hi, what would you like to discuss?" },
  { role: "user", content: "Could we discuss the feedback on my thesis?" },
];

const emailContext: EmailPracticeContext = {
  course: "First-Year Writing Seminar",
  recipient: "Professor Morgan",
  purpose: "Ask for a brief meeting about my research topic",
  whatHappened: "I narrowed my topic to two possible questions.",
  concern: "I worry that asking for help will sound unprepared.",
  existingDraft: "Dear Professor Morgan,\n\nCould you help with my topic?\n\nBest,\n[Your name]",
};

const revisedEmail = "Dear Professor Morgan,\n\nI have narrowed my topic to two questions. Could we meet briefly to discuss which one is focused enough?\n\nBest,\n[Your name]";

const groupContext: GroupPracticeContext = {
  course: "Marketing presentation",
  role: "Research coordinator",
  projectSituation: "The group presents next week and needs to combine slides on Tuesday.",
  conflict: "One research section is late and the owner has not replied to two messages.",
  goal: "Agree on a fair task split and new deadline",
  concern: "I worry that being direct will sound controlling.",
};

const groupMessages = [
  { role: "assistant" as const, content: "What should the group resolve first?" },
  { role: "user" as const, content: "The research section is late. Could we agree on an owner and a Tuesday deadline? I can combine the final slides." },
];

function createFakeClient(contents: string[], finishReasons: string[] = []) {
  const requests: unknown[] = [];
  const requestOptions: unknown[] = [];
  let index = 0;
  const client = {
    chat: {
      completions: {
        create: async (request: unknown, options: unknown) => {
          requests.push(request);
          requestOptions.push(options);
          return {
            choices: [{ finish_reason: finishReasons[index] ?? "stop", message: { content: contents[index++] ?? null } }],
          };
        },
      },
    },
  } as unknown as OpenAI;
  return { client, requests, requestOptions };
}

async function failureReason(promise: Promise<unknown>) {
  try {
    await promise;
    return null;
  } catch (error) {
    return classifyAiFailure(error);
  }
}

test("uses DemoProvider when Kimi is not fully configured", () => {
  const previousProvider = process.env.AI_PROVIDER;
  const previousKey = process.env.MOONSHOT_API_KEY;
  process.env.AI_PROVIDER = "kimi";
  delete process.env.MOONSHOT_API_KEY;

  try {
    expect(getAiProvider()).toBeInstanceOf(DemoProvider);
  } finally {
    if (previousProvider === undefined) delete process.env.AI_PROVIDER;
    else process.env.AI_PROVIDER = previousProvider;
    if (previousKey === undefined) delete process.env.MOONSHOT_API_KEY;
    else process.env.MOONSHOT_API_KEY = previousKey;
  }
});

test("context route rejects incomplete situation details", async () => {
  const response = await createContextGuidance(new Request("http://localhost/api/context", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ context: { course: "" } }),
  }));

  expect(response.status).toBe(400);
  await expect(response.json()).resolves.toEqual({ error: "Please check the situation details and try again." });
});

test("DemoProvider uses the honest general opening before the student speaks", async () => {
  const provider = new DemoProvider();
  await expect(provider.generateProfessorReply(context, [])).resolves.toBe(DEMO_OPENING);
});

test("DemoProvider grounds context guidance in the submitted source", async () => {
  const provider = new DemoProvider();
  const guidance = await provider.generateContextGuidance(context);

  expect(guidance.literal_source).toContain("The thesis is too broad.");
  expect(guidance.campus_context).toContain("I worry about wasting the professor's time.");
  expect(guidance.uncertainty).toContain("cannot tell us");
  expect(guidance.constructive_next_move).toContain("Understand the feedback");
});

test("DemoProvider keeps the student in control of the email revision", async () => {
  const provider = new DemoProvider();
  const guidance = await provider.generateEmailContextGuidance(emailContext);
  const hint = await provider.generateEmailHint(emailContext, emailContext.existingDraft);
  const report = await provider.generateEmailFeedback(emailContext, revisedEmail);

  expect(guidance.literal_source).toContain(emailContext.existingDraft);
  expect(hint.sentence_starter.length).toBeLessThan(100);
  expect(hint.observation).not.toContain(revisedEmail);
  expect(report.final_email).toBe(revisedEmail);
  expect(report.improvements.every((item) => revisedEmail.includes(item.original_excerpt))).toBe(true);
});

test("email feedback route rejects an unchanged draft", async () => {
  const response = await createEmailFeedback(new Request("http://localhost/api/email/feedback", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ context: emailContext, revisedDraft: emailContext.existingDraft }),
  }));

  expect(response.status).toBe(400);
  await expect(response.json()).resolves.toEqual({ error: "Revise the draft before requesting feedback." });
});

test("DemoProvider grounds the complete group-project journey", async () => {
  const provider = new DemoProvider();
  const guidance = await provider.generateGroupContextGuidance(groupContext);
  const opening = await provider.generateTeammateReply(groupContext, []);
  const report = await provider.generateGroupFeedback(groupContext, groupMessages);

  expect(guidance.literal_source).toContain(groupContext.conflict);
  expect(opening).toBe(getMockTeammateReply([]));
  expect(report.improvements.every((item) => groupMessages[1].content.includes(item.original_response))).toBe(true);
  expect(report.task_division.some((item) => item.owner === "You")).toBe(true);
  expect(report.follow_up_message).toContain("Please reply if I missed or misunderstood anything");
});

test("group feedback route rejects a transcript without a student response", async () => {
  const response = await createGroupFeedback(new Request("http://localhost/api/group/feedback", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ context: groupContext, messages: [{ role: "assistant", content: "What should we resolve?" }, { role: "assistant", content: "Can you clarify?" }] }),
  }));

  expect(response.status).toBe(400);
  await expect(response.json()).resolves.toEqual({ error: "There is not enough practice content to create feedback." });
});

test("KimiProvider validates grounded group context, role-play, and feedback", async () => {
  const expectedGuidance = getMockGroupContextGuidance(groupContext);
  const expectedReport = getMockGroupFeedback(groupContext, groupMessages);
  const { client, requests } = createFakeClient([
    JSON.stringify(expectedGuidance),
    "I hear the deadline is the main concern. What task split do you propose?",
    JSON.stringify(expectedReport),
  ]);
  const provider = new KimiProvider(client);

  await expect(provider.generateGroupContextGuidance(groupContext)).resolves.toEqual(expectedGuidance);
  await expect(provider.generateTeammateReply(groupContext, groupMessages)).resolves.toContain("What task split");
  await expect(provider.generateGroupFeedback(groupContext, groupMessages)).resolves.toEqual(expectedReport);
  expect(requests).toHaveLength(3);
  expect(requests[0]).toMatchObject({ response_format: { type: "json_schema" } });
  expect(requests[1]).toMatchObject({ messages: expect.arrayContaining([{ role: "system", content: expect.stringContaining("Stay in the teammate role") }]) });
  expect(requests[2]).toMatchObject({ messages: expect.arrayContaining([{ role: "system", content: expect.stringContaining("verbatim contiguous excerpt") }]) });
});

test("KimiProvider validates grounded email context, hints, and feedback", async () => {
  const expectedGuidance = getMockEmailContextGuidance(emailContext);
  const expectedHint = getMockEmailHint(revisedEmail);
  const expectedReport = getMockEmailFeedback(emailContext, revisedEmail);
  const { client, requests } = createFakeClient([
    JSON.stringify(expectedGuidance),
    JSON.stringify(expectedHint),
    JSON.stringify(expectedReport),
  ]);
  const provider = new KimiProvider(client);

  await expect(provider.generateEmailContextGuidance(emailContext)).resolves.toEqual(expectedGuidance);
  await expect(provider.generateEmailHint(emailContext, revisedEmail)).resolves.toEqual(expectedHint);
  await expect(provider.generateEmailFeedback(emailContext, revisedEmail)).resolves.toEqual(expectedReport);
  expect(requests).toHaveLength(3);
  expect(requests[0]).toMatchObject({ response_format: { type: "json_schema" } });
  expect(requests[1]).toMatchObject({ messages: expect.arrayContaining([{ role: "system", content: expect.stringContaining("Do not rewrite the full email") }]) });
  expect(requests[2]).toMatchObject({ messages: expect.arrayContaining([{ role: "system", content: expect.stringContaining("verbatim contiguous excerpt") }]) });
});

test("KimiProvider requests and validates structured context guidance", async () => {
  const expectedGuidance = getMockContextGuidance(context);
  const { client, requests, requestOptions } = createFakeClient([JSON.stringify(expectedGuidance)]);
  const provider = new KimiProvider(client);

  await expect(provider.generateContextGuidance(context)).resolves.toEqual(expectedGuidance);
  expect(requests[0]).toMatchObject({
    model: "kimi-k2.6",
    thinking: { type: "disabled" },
    response_format: { type: "json_schema", json_schema: { strict: true } },
    messages: [
      { role: "system", content: expect.stringContaining("exactly four string fields") },
      { role: "user", content: expect.stringContaining("Professor feedback provided by student: The thesis is too broad.") },
    ],
  });
  expect(requestOptions[0]).toMatchObject({ timeout: KIMI_REQUEST_TIMEOUTS.context, maxRetries: 1 });
});

test("KimiProvider receives private context when generating the opening", async () => {
  const { client, requests, requestOptions } = createFakeClient(["Welcome. What would you like to focus on in our meeting today?"]);
  const provider = new KimiProvider(client);

  await expect(provider.generateProfessorReply(context, [])).resolves.toContain("What would you like to focus on");
  expect(requests[0]).toMatchObject({
    messages: [
      { role: "system", content: expect.stringContaining("When there are no conversation turns yet") },
      { role: "user", content: expect.stringContaining("Student goal: Understand the feedback") },
    ],
  });
  expect(requests[0]).toMatchObject({
    model: "kimi-k2.6",
    thinking: { type: "disabled" },
    messages: expect.arrayContaining([
      { role: "user", content: expect.stringContaining("private simulation context, not a student utterance") },
    ]),
  });
  expect(requestOptions[0]).toMatchObject({ timeout: KIMI_REQUEST_TIMEOUTS.practice, maxRetries: 1 });
});

test("KimiProvider sends Chat Completions requests and validates feedback", async () => {
  const expectedReport = getMockFeedback(context, messages);
  const { client, requests, requestOptions } = createFakeClient([
    "Let's look at the thesis comment first. What part feels unclear?",
    JSON.stringify(expectedReport),
  ]);
  const provider = new KimiProvider(client);

  await expect(provider.generateProfessorReply(context, messages)).resolves.toContain("thesis comment");
  await expect(provider.generateFeedback(context, messages)).resolves.toEqual(expectedReport);
  expect(requests[0]).toMatchObject({ model: "kimi-k2.6", thinking: { type: "disabled" } });
  expect(requests[1]).toMatchObject({
    model: "kimi-k2.6",
    thinking: { type: "disabled" },
    response_format: { type: "json_schema", json_schema: { strict: true } },
  });
  expect(requestOptions).toEqual([
    expect.objectContaining({ timeout: KIMI_REQUEST_TIMEOUTS.practice, maxRetries: 1 }),
    expect.objectContaining({ timeout: KIMI_REQUEST_TIMEOUTS.feedback, maxRetries: 1 }),
  ]);
});

test("KimiProvider rejects invalid structured feedback so routes can fall back", async () => {
  const { client } = createFakeClient(["not valid JSON", "still not valid JSON"]);
  const provider = new KimiProvider(client);
  await expect(failureReason(provider.generateFeedback(context, messages))).resolves.toBe("invalid_json");
});

test("KimiProvider retries one invalid feedback response before falling back", async () => {
  const expectedReport = getMockFeedback(context, messages);
  const { client, requests } = createFakeClient(["not valid JSON", JSON.stringify(expectedReport)]);
  const provider = new KimiProvider(client);

  await expect(provider.generateFeedback(context, messages)).resolves.toEqual(expectedReport);
  expect(requests).toHaveLength(2);
  expect(requests[1]).toMatchObject({
    messages: [
      { role: "system", content: expect.any(String) },
      { role: "user", content: expect.stringContaining("This is a retry after an invalid response") },
    ],
  });
});

test("KimiProvider rejects invalid structured context guidance so routes can fall back", async () => {
  const invalidGuidance = JSON.stringify({ campus_context: "Missing the other fields" });
  const { client } = createFakeClient([invalidGuidance, invalidGuidance]);
  const provider = new KimiProvider(client);
  await expect(failureReason(provider.generateContextGuidance(context))).resolves.toBe("invalid_schema");
});

test("KimiProvider retries one invalid context response before falling back", async () => {
  const expectedGuidance = getMockContextGuidance(context);
  const { client, requests } = createFakeClient(["not valid JSON", JSON.stringify(expectedGuidance)]);
  const provider = new KimiProvider(client);

  await expect(provider.generateContextGuidance(context)).resolves.toEqual(expectedGuidance);
  expect(requests).toHaveLength(2);
  expect(requests[1]).toMatchObject({
    messages: [
      { role: "system", content: expect.any(String) },
      { role: "user", content: expect.stringContaining("This is a retry after an invalid response") },
    ],
  });
});

test("KimiProvider rejects context guidance that changes the literal source", async () => {
  const guidance = {
    ...getMockContextGuidance(context),
    literal_source: "The professor gave different feedback.",
  };
  const encodedGuidance = JSON.stringify(guidance);
  const { client } = createFakeClient([encodedGuidance, encodedGuidance]);
  const provider = new KimiProvider(client);
  await expect(failureReason(provider.generateContextGuidance(context))).resolves.toBe("grounding_failed");
});

test("KimiProvider classifies truncated and ungrounded feedback for safe fallback", async () => {
  const expectedReport = getMockFeedback(context, messages);
  const truncated = createFakeClient([JSON.stringify(expectedReport), JSON.stringify(expectedReport)], ["length", "length"]);
  const ungroundedReport = JSON.stringify({
    ...expectedReport,
    improvements: expectedReport.improvements.map((improvement) => ({
      ...improvement,
      original_response: "This sentence was never submitted by the student.",
    })),
  });
  const ungrounded = createFakeClient([ungroundedReport, ungroundedReport]);

  await expect(failureReason(new KimiProvider(truncated.client).generateFeedback(context, messages))).resolves.toBe("truncated");
  await expect(failureReason(new KimiProvider(ungrounded.client).generateFeedback(context, messages))).resolves.toBe("grounding_failed");
});

test("classifies provider failures without logging student content", () => {
  expect(classifyAiFailure({ name: "APIConnectionTimeoutError" })).toBe("timeout");
  expect(classifyAiFailure({ status: 401 })).toBe("authentication");
  expect(classifyAiFailure({ status: 429 })).toBe("rate_limit");
  expect(classifyAiFailure({ status: 503 })).toBe("upstream_error");

  const studentText = "PRIVATE STUDENT TRANSCRIPT";
  const output: string[] = [];
  const originalWarn = console.warn;
  console.warn = (...values: unknown[]) => output.push(values.join(" "));
  try {
    logAiFallback({
      operation: "feedback",
      model: "kimi-k3",
      error: new Error(studentText),
      elapsedMs: 20_003.4,
    });
    logAiRetry({
      operation: "feedback",
      model: "kimi-k2.6",
      error: new Error(studentText),
    });
  } finally {
    console.warn = originalWarn;
  }

  expect(output).toHaveLength(2);
  expect(output[0]).toContain('"event":"ai_fallback"');
  expect(output[0]).toContain('"reason":"unknown"');
  expect(output[1]).toContain('"event":"ai_retry"');
  expect(output.join(" ")).not.toContain(studentText);
});

test("uses explicit safe failure reasons", () => {
  expect(classifyAiFailure(new AiProviderFailure("empty_response"))).toBe("empty_response");
  expect(classifyAiFailure(new AiProviderFailure("invalid_schema"))).toBe("invalid_schema");
});
