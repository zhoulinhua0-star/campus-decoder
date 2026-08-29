import { expect, test } from "@playwright/test";

test("completes the honest Office Hours demo flow", async ({ page }) => {
  const studentResponse = "Thanks for meeting with me. Could we discuss the feedback on my first paragraph?";

  await page.goto("/");
  await page.locator("main > section").first().getByRole("link", { name: "Choose a scenario" }).click();
  await expect(page).toHaveURL(/\/practice$/);
  await page.getByRole("link", { name: /Office Hours/ }).click();

  await expect(page.getByText("Step 1 of 5")).toBeVisible();
  await expect(page.getByLabel("Course or subject")).toHaveValue("");
  await expect(page.getByRole("button", { name: /Use my situation/ })).toHaveAttribute("aria-pressed", "true");

  await page.getByRole("button", { name: /Try the sample/ }).click();
  await expect(page.getByLabel("Course or subject")).toHaveValue("First-Year Writing Seminar");
  await expect(page.getByRole("button", { name: /Try the sample/ })).toHaveAttribute("aria-pressed", "true");

  await page.getByRole("button", { name: /Use my situation/ }).click();
  await expect(page.getByLabel("Course or subject")).toHaveValue("");

  await page.getByRole("button", { name: /Try the sample/ }).click();
  await page.getByRole("button", { name: "See Office Hours guidance" }).click();

  await expect(page.getByRole("heading", { name: "Separate what we know from what we still need to ask." })).toBeVisible();
  await expect(page.getByText("The professor feedback you provided says: “The thesis is too broad, and the analysis needs to connect more clearly to the evidence.”")).toBeVisible();
  await expect(page.getByText("Grounded Demo guidance uses the details you entered with fixed coaching rules; it is not personalized AI analysis.")).toBeVisible();
  await page.getByRole("button", { name: "Start the role-play" }).click();

  await expect(page.getByText("Step 3 of 5")).toBeVisible();
  await expect(page.getByRole("heading", { name: "Practice Professor" })).toBeVisible();
  await expect(page.getByText("First-Year Writing Seminar · Office hours")).toBeVisible();
  await expect(page.getByText("Hi, come in. What would be most helpful for us to focus on today?")).toBeVisible();
  await page.getByLabel("Your response to the professor").fill(studentResponse);
  await page.getByLabel("Your response to the professor").press("Enter");

  await expect(page.getByText(studentResponse)).toBeVisible();
  await expect(page.getByText("Guided demo is active. Professor replies follow a short sample path until live AI is connected.")).toBeVisible();
  await expect(page.getByText("Thanks for coming in. Could you point me to one part of the feedback or essay you would most like to understand?")).toBeVisible();

  await page.getByRole("button", { name: "Finish & see feedback" }).click();

  await expect(page.getByRole("heading", { name: "Here is how your personalized coaching will be structured." })).toBeVisible();
  await expect(page.getByText("Sample report")).toBeVisible();
  await expect(page.getByText(studentResponse)).toHaveCount(2);
  await expect(page.getByText("Sorry to bother you. I know you are probably very busy.")).toHaveCount(0);

  await page.getByRole("button", { name: "View sample action plan" }).click();
  await expect(page.getByRole("heading", { name: "Sample meeting outline" })).toBeVisible();
});

test("uses Shift+Enter for a new line and supports browser voice dictation", async ({ page }) => {
  await page.addInitScript(() => {
    class MockSpeechRecognition {
      continuous = false;
      interimResults = false;
      lang = "";
      onstart: (() => void) | null = null;
      onresult: ((event: unknown) => void) | null = null;
      onerror: ((event: unknown) => void) | null = null;
      onend: (() => void) | null = null;

      start() {
        this.onstart?.();
        this.onresult?.({ results: [{ 0: { transcript: "Could we review my thesis?" }, isFinal: true, length: 1 }] });
      }

      stop() { this.onend?.(); }
      abort() {}
    }

    Object.defineProperty(window, "SpeechRecognition", { configurable: true, value: MockSpeechRecognition });
  });

  await page.goto("/practice/office-hours");
  await page.getByRole("button", { name: /Try the sample/ }).click();
  await page.getByRole("button", { name: "See Office Hours guidance" }).click();
  await page.getByRole("button", { name: "Start the role-play" }).click();

  const composer = page.getByLabel("Your response to the professor");
  await composer.fill("Thank you for meeting with me.");
  await composer.press("Shift+Enter");
  await composer.type("I have a question.");
  await expect(composer).toHaveValue("Thank you for meeting with me.\nI have a question.");

  await page.getByRole("button", { name: "Start voice input in English" }).click();
  await expect(composer).toHaveValue("Thank you for meeting with me.\nI have a question. Could we review my thesis?");
  await expect(page.getByText("Listening in English… Select the microphone again to stop.")).toBeVisible();

  await page.getByRole("button", { name: "Stop voice input" }).click();
  await expect(page.getByText("Your speech is now text. Edit it or send when ready.")).toBeVisible();
});

test("handles microphone denial, missing hardware, restart, and long speech", async ({ page }) => {
  await page.addInitScript(() => {
    let attempt = 0;
    class MockSpeechRecognition {
      continuous = false;
      interimResults = false;
      lang = "";
      onstart: (() => void) | null = null;
      onresult: ((event: unknown) => void) | null = null;
      onerror: ((event: { error: string }) => void) | null = null;
      onend: (() => void) | null = null;

      start() {
        attempt += 1;
        this.onstart?.();
        if (attempt === 1) this.onerror?.({ error: "not-allowed" });
        else if (attempt === 2) this.onerror?.({ error: "audio-capture" });
        else this.onresult?.({ results: [{ 0: { transcript: "A".repeat(2100) }, isFinal: true, length: 1 }] });
        this.onend?.();
      }

      stop() { this.onend?.(); }
      abort() {}
    }

    Object.defineProperty(window, "SpeechRecognition", { configurable: true, value: MockSpeechRecognition });
  });

  await page.goto("/practice/office-hours");
  await page.getByRole("button", { name: /Try the sample/ }).click();
  await page.getByRole("button", { name: "See Office Hours guidance" }).click();
  await page.getByRole("button", { name: "Start the role-play" }).click();

  const microphone = page.getByRole("button", { name: "Start voice input in English" });
  await microphone.click();
  await expect(page.getByText("Microphone access is blocked. Allow it in your browser settings and try again.")).toBeVisible();
  await microphone.click();
  await expect(page.getByText("No microphone was found. Check your device connection.")).toBeVisible();
  await microphone.click();

  const composer = page.getByLabel("Your response to the professor");
  await expect(composer).toHaveValue("A".repeat(2000));
  await expect(page.getByText("Your speech is now text. Edit it or send when ready.")).toBeVisible();
  await expect(composer).toBeFocused();
});

test("requests a context-aware opening before the student speaks", async ({ page }) => {
  let openingRequest: unknown;
  await page.route("**/api/practice", async (route) => {
    openingRequest = route.request().postDataJSON();
    await route.fulfill({
      contentType: "application/json",
      body: JSON.stringify({
        professorReply: "Welcome. What would you like to understand about the feedback in First-Year Writing Seminar?",
        mode: "live",
        notice: null,
      }),
    });
  });

  await page.goto("/practice/office-hours");
  await page.getByRole("button", { name: /Try the sample/ }).click();
  await page.getByRole("button", { name: "See Office Hours guidance" }).click();
  await page.getByRole("button", { name: "Start the role-play" }).click();

  await expect(page.getByText("Welcome. What would you like to understand about the feedback in First-Year Writing Seminar?")).toBeVisible();
  await expect(page.getByRole("heading", { name: "Practice Professor" })).toBeVisible();
  expect(openingRequest).toMatchObject({
    context: {
      course: "First-Year Writing Seminar",
      goal: "Understand the feedback and improve my next essay",
    },
    messages: [],
  });
});
