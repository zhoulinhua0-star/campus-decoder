import { expect, test } from "@playwright/test";

test("completes the honest Office Hours demo flow", async ({ page }) => {
  const studentResponse = "Thanks for meeting with me. Could we discuss the feedback on my first paragraph?";

  await page.goto("/");
  await page.getByRole("link", { name: "Practice office hours" }).click();

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

  await expect(page.getByRole("heading", { name: "Going to office hours is not wasting your professor’s time." })).toBeVisible();
  await expect(page.getByText("This step explains the general campus norm; it is not yet AI-personalized analysis of your entries.")).toBeVisible();
  await page.getByRole("button", { name: "Start the role-play" }).click();

  await expect(page.getByText("Step 3 of 5")).toBeVisible();
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

test("dictates in Mandarin and converts the editable draft to natural English", async ({ page }) => {
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
        this.onresult?.({ results: [{ 0: { transcript: "我想更好地理解教授对我论文论点的反馈。" }, isFinal: true, length: 1 }] });
      }

      stop() { this.onend?.(); }
      abort() {}
    }

    Object.defineProperty(window, "SpeechRecognition", { configurable: true, value: MockSpeechRecognition });
  });
  await page.route("**/api/translate", async (route) => {
    await route.fulfill({
      contentType: "application/json",
      body: JSON.stringify({ translation: "I’d like to better understand your feedback on my thesis.", mode: "live" }),
    });
  });

  await page.goto("/practice/office-hours");
  await page.getByRole("button", { name: /Try the sample/ }).click();
  await page.getByRole("button", { name: "See Office Hours guidance" }).click();
  await page.getByRole("button", { name: "Start the role-play" }).click();

  await page.getByRole("button", { name: "Mandarin Chinese voice recognition" }).click();
  await expect(page.getByRole("button", { name: "Mandarin Chinese voice recognition" })).toHaveAttribute("aria-pressed", "true");
  await page.getByRole("button", { name: "Start voice input in Mandarin Chinese" }).click();

  const composer = page.getByLabel("Your response to the professor");
  await expect(composer).toHaveValue("我想更好地理解教授对我论文论点的反馈。");
  await expect(page.getByRole("button", { name: "Send response" })).toBeDisabled();
  await page.getByRole("button", { name: "Stop voice input" }).click();
  await page.getByRole("button", { name: "Convert to natural English" }).click();

  await expect(composer).toHaveValue("I’d like to better understand your feedback on my thesis.");
  await expect(page.getByText("Converted to natural English. Review and edit it before sending.")).toBeVisible();
  await expect(page.getByRole("button", { name: "Restore Chinese draft" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Send response" })).toBeEnabled();
});
