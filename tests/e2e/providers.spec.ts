import { expect, test } from "@playwright/test";
import type OpenAI from "openai";
import { getMockFeedback } from "@/lib/ai/mock";
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

test("KimiProvider sends Chat Completions requests and validates feedback", async () => {
  const expectedReport = getMockFeedback(context, messages);
  const { client, requests } = createFakeClient([
    "Let's look at the thesis comment first. What part feels unclear?",
    JSON.stringify(expectedReport),
  ]);
  const provider = new KimiProvider(client);

  await expect(provider.generateProfessorReply(context, messages)).resolves.toContain("thesis comment");
  await expect(provider.generateFeedback(context, messages)).resolves.toEqual(expectedReport);
  expect(requests[0]).toMatchObject({ model: "kimi-k3", reasoning_effort: "low" });
  expect(requests[1]).toMatchObject({
    model: "kimi-k3",
    reasoning_effort: "low",
    response_format: { type: "json_schema", json_schema: { strict: true } },
  });
});

test("KimiProvider rejects invalid structured feedback so routes can fall back", async () => {
  const { client } = createFakeClient(["not valid JSON"]);
  const provider = new KimiProvider(client);
  await expect(provider.generateFeedback(context, messages)).rejects.toThrow();
});
