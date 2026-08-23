import { expect, test } from "@playwright/test";
import type OpenAI from "openai";
import { POST as createContextGuidance } from "@/app/api/context/route";
import { DEMO_OPENING } from "@/lib/ai/constants";
import { getMockContextGuidance, getMockFeedback } from "@/lib/ai/mock";
import { DemoProvider, getAiProvider, KimiProvider } from "@/lib/ai/providers";
import type { PracticeContext, PracticeMessage } from "@/types/practice";

const context: PracticeContext = {
  course: "First-Year Writing Seminar",
  goal: "Understand the feedback",
  whatHappened: "I received unclear essay feedback.",
  concern: "I worry about wasting the professor's time.",
  professorFeedback: "The thesis is too broad.",
  preferredLanguage: "English",
};

const messages: PracticeMessage[] = [
  { role: "assistant", content: "Hi, what would you like to discuss?" },
  { role: "user", content: "Could we discuss the feedback on my thesis?" },
];

function createFakeClient(contents: string[]) {
  const requests: unknown[] = [];
  let index = 0;
  const client = {
    chat: {
      completions: {
        create: async (request: unknown) => {
          requests.push(request);
          return {
            choices: [{ finish_reason: "stop", message: { content: contents[index++] ?? null } }],
          };
        },
      },
    },
  } as unknown as OpenAI;
  return { client, requests };
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

test("DemoProvider supports Chinese context coaching without professor feedback", async () => {
  const provider = new DemoProvider();
  const guidance = await provider.generateContextGuidance({
    ...context,
    professorFeedback: "",
    preferredLanguage: "简体中文",
  });

  expect(guidance.literal_source).toContain(context.whatHappened);
  expect(guidance.uncertainty).toContain("没有提供教授的原话");
  expect(guidance.constructive_next_move).toContain(context.goal);
});

test("KimiProvider requests and validates structured context guidance", async () => {
  const expectedGuidance = getMockContextGuidance(context);
  const { client, requests } = createFakeClient([JSON.stringify(expectedGuidance)]);
  const provider = new KimiProvider(client);

  await expect(provider.generateContextGuidance(context)).resolves.toEqual(expectedGuidance);
  expect(requests[0]).toMatchObject({
    model: "kimi-k3",
    reasoning_effort: "low",
    response_format: { type: "json_schema", json_schema: { strict: true } },
    messages: [
      { role: "system", content: expect.stringContaining("exactly four structured fields") },
      { role: "user", content: expect.stringContaining("Professor feedback provided by student: The thesis is too broad.") },
    ],
  });
});

test("KimiProvider receives private context when generating the opening", async () => {
  const { client, requests } = createFakeClient(["Welcome. What would you like to focus on in our meeting today?"]);
  const provider = new KimiProvider(client);

  await expect(provider.generateProfessorReply(context, [])).resolves.toContain("What would you like to focus on");
  expect(requests[0]).toMatchObject({
    messages: [
      { role: "system", content: expect.stringContaining("When there are no conversation turns yet") },
      { role: "user", content: expect.stringContaining("Student goal: Understand the feedback") },
    ],
  });
  expect(requests[0]).toMatchObject({
    messages: expect.arrayContaining([
      { role: "user", content: expect.stringContaining("private simulation context, not a student utterance") },
    ]),
  });
});

test("KimiProvider sends Chat Completions requests and validates feedback", async () => {
  const expectedReport = getMockFeedback(context, messages);
  const { client, requests } = createFakeClient([
    "Let's look at the thesis comment first. What part feels unclear?",
    JSON.stringify(expectedReport),
    "Could we look at the feedback on my thesis together?",
  ]);
  const provider = new KimiProvider(client);

  await expect(provider.generateProfessorReply(context, messages)).resolves.toContain("thesis comment");
  await expect(provider.generateFeedback(context, messages)).resolves.toEqual(expectedReport);
  await expect(provider.translateToNaturalEnglish("我们可以一起看看关于我论文论点的反馈吗？")).resolves.toBe("Could we look at the feedback on my thesis together?");
  expect(requests[0]).toMatchObject({ model: "kimi-k3", reasoning_effort: "low" });
  expect(requests[1]).toMatchObject({
    model: "kimi-k3",
    reasoning_effort: "low",
    response_format: { type: "json_schema", json_schema: { strict: true } },
  });
  expect(requests[2]).toMatchObject({
    model: "kimi-k3",
    reasoning_effort: "low",
    messages: [
      { role: "system", content: expect.stringContaining("natural spoken English") },
      { role: "user", content: expect.stringContaining("我们可以一起看看") },
    ],
  });
});

test("KimiProvider rejects invalid structured feedback so routes can fall back", async () => {
  const { client } = createFakeClient(["not valid JSON"]);
  const provider = new KimiProvider(client);
  await expect(provider.generateFeedback(context, messages)).rejects.toThrow();
});

test("KimiProvider rejects invalid structured context guidance so routes can fall back", async () => {
  const { client } = createFakeClient([JSON.stringify({ campus_context: "Missing the other fields" })]);
  const provider = new KimiProvider(client);
  await expect(provider.generateContextGuidance(context)).rejects.toThrow();
});

test("KimiProvider rejects context guidance that changes the literal source", async () => {
  const guidance = {
    ...getMockContextGuidance(context),
    literal_source: "The professor gave different feedback.",
  };
  const { client } = createFakeClient([JSON.stringify(guidance)]);
  const provider = new KimiProvider(client);
  await expect(provider.generateContextGuidance(context)).rejects.toThrow("not grounded in the submitted source");
});

test("KimiProvider rejects a conversion that still contains Chinese", async () => {
  const { client } = createFakeClient(["我们可以一起看看 feedback 吗？"]);
  const provider = new KimiProvider(client);
  await expect(provider.translateToNaturalEnglish("我们可以一起看看反馈吗？")).rejects.toThrow();
});
