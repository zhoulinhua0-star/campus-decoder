import { expect, test } from "@playwright/test";

const revisedEmail = `Dear Professor Morgan,

I’m writing about the research topic for our next paper. I have narrowed my ideas to two questions and would appreciate your guidance on which one is focused enough for the assignment.

Would you be available for a brief meeting this week? I can bring both questions and the assignment prompt.

Best,
[Your name]`;

test("completes the Emailing a Professor journey with Demo fallback", async ({ page, context }) => {
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  await page.goto("/");
  await page.locator("main > section").first().getByRole("link", { name: "Choose a scenario" }).click();
  await expect(page).toHaveURL(/\/practice$/);
  await page.getByRole("link", { name: /Emailing a Professor/ }).click();

  await expect(page).toHaveURL(/\/practice\/email-professor$/);
  await expect(page.getByText("Step 1 of 5")).toBeVisible();
  await page.getByRole("button", { name: /Try the sample email/ }).click();
  await expect(page.getByLabel("Course or subject")).toHaveValue("First-Year Writing Seminar");
  await expect(page.getByLabel("Professor or recipient")).toHaveValue("Professor Morgan");
  await expect(page.getByLabel("Your current draft")).toHaveValue(/Sorry to bother you/);
  await page.getByRole("button", { name: "See email guidance" }).click();

  await expect(page.getByText("Step 2 of 5")).toBeVisible();
  await expect(page.getByRole("heading", { name: "Help the professor understand the purpose and the next step." })).toBeFocused();
  await expect(page.getByText("Grounded Demo guidance uses your entries with fixed coaching rules; it is not personalized AI analysis.")).toBeVisible();
  await expect(page.getByText(/The draft you provided says:/)).toBeVisible();
  await page.getByRole("button", { name: "Revise my draft" }).click();

  await expect(page.getByText("Step 3 of 5")).toBeVisible();
  const editor = page.getByLabel("Your revised email");
  await expect(editor).toHaveValue(/Sorry to bother you/);
  await page.getByRole("button", { name: "Review my revision" }).click();
  await expect(page.getByRole("alert", { name: "Make at least one change in your own words before requesting feedback." })).toBeFocused();
  await expect(page.getByRole("heading", { name: "Make at least one change in your own words before requesting feedback." })).toBeVisible();

  await editor.fill(revisedEmail);
  await page.getByRole("button", { name: "Get one revision hint" }).click();
  await expect(page.getByText("Guided Demo hint uses fixed revision rules and leaves the writing to you.")).toBeVisible();
  await expect(page.getByText("Focus: Clarity")).toBeVisible();
  await expect(editor).toHaveValue(revisedEmail);
  await page.getByRole("button", { name: "Review my revision" }).click();

  await expect(page.getByText("Step 4 of 5")).toBeVisible();
  await expect(page.getByRole("heading", { name: "Here is how your revised email will be reviewed." })).toBeFocused();
  await expect(page.getByText("Sample report")).toBeVisible();
  await expect(page.getByText("These fixed ratings demonstrate the report structure; they are not personalized AI analysis.")).toBeVisible();
  await expect(page.getByText("Sorry to bother you.", { exact: false })).toHaveCount(0);
  await page.getByRole("button", { name: "Open final email" }).click();

  await expect(page.getByText("Step 5 of 5")).toBeVisible();
  await expect(page.getByRole("heading", { name: "Review your editable email before you use it." })).toBeFocused();
  await expect(page.getByLabel("To")).toHaveValue("Professor Morgan");
  await expect(page.getByLabel("Subject")).toHaveValue("First-Year Writing Seminar: Ask for a brief meeting about narrowing my research topic");
  await expect(page.getByLabel("Email body")).toHaveValue(revisedEmail);
  await page.getByRole("button", { name: "Copy email" }).click();
  await expect(page.getByText("Email copied. Review the recipient and details before sending.")).toBeVisible();
});

test("validates required email setup fields with a focusable error summary", async ({ page }) => {
  await page.goto("/practice/email-professor");
  await page.getByRole("button", { name: "See email guidance" }).click();

  await expect(page.getByRole("alert", { name: "Please complete the highlighted fields." })).toBeFocused();
  await expect(page.getByRole("heading", { name: "Please complete the highlighted fields." })).toBeVisible();
  await expect(page.getByText("Add the course or subject.")).toBeVisible();
  await expect(page.getByText("Add the professor or recipient.")).toBeVisible();
  await expect(page.getByText("Add at least a short draft to revise.")).toBeVisible();
});
