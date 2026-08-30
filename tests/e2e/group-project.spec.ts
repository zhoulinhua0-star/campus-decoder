import { expect, test } from "@playwright/test";

const studentResponse = "I want us to finish the presentation well. The research section is still incomplete, and that leaves too little time to combine and rehearse the slides. Could we agree on who will finish that section by Tuesday at 6 p.m.? I can still combine the final deck, but I cannot take both tasks.";

test("completes the Group Project Conflict journey with Demo fallback", async ({ page, context }) => {
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  await page.goto("/practice");
  await page.getByRole("link", { name: /Group Project Conflict/ }).click();

  await expect(page).toHaveURL(/\/practice\/group-project$/);
  await expect(page.getByText("Step 1 of 5")).toBeVisible();
  await page.getByRole("button", { name: /Try the sample project/ }).click();
  await expect(page.getByLabel("Course or project")).toHaveValue(/Introduction to Marketing/);
  await expect(page.getByLabel("Your role or responsibility")).toHaveValue(/coordinating the research/);
  await expect(page.getByLabel(/What conflict or coordination problem happened/)).toHaveValue(/missed the research deadline/);
  await page.getByRole("button", { name: "See group guidance" }).click();

  await expect(page.getByText("Step 2 of 5")).toBeVisible();
  await expect(page.getByRole("heading", { name: "Separate the work problem from the story about the person." })).toBeFocused();
  await expect(page.getByText("Grounded Demo guidance uses your entries with fixed coaching rules; it is not personalized AI analysis.")).toBeVisible();
  await expect(page.getByText(/One teammate missed the research deadline/)).toBeVisible();
  await expect(page.getByRole("heading", { name: "Ownership works best when it is explicit" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "A reminder can support the shared work" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Direct does not have to mean personal" })).toBeVisible();
  await page.getByRole("button", { name: "Start teammate practice" }).click();

  await expect(page.getByText("Step 3 of 5")).toBeVisible();
  await expect(page.getByRole("heading", { name: "Practice Teammate" })).toBeFocused();
  await expect(page.getByText("Guided demo is active. Teammate replies follow a short sample path until live AI is connected.")).toBeVisible();
  const finish = page.getByRole("button", { name: "Finish & see feedback" });
  await expect(finish).toBeDisabled();
  await page.getByLabel("Your response to the group member").fill(studentResponse);
  await page.getByRole("button", { name: "Send response" }).click();
  await expect(page.getByText("What specific task split and deadline would you like us to agree on?", { exact: false })).toBeVisible();
  await expect(finish).toBeEnabled();
  await finish.click();

  await expect(page.getByText("Step 4 of 5")).toBeVisible();
  await expect(page.getByRole("heading", { name: "Here is how your group conversation will be reviewed." })).toBeFocused();
  await expect(page.getByText("Sample report")).toBeVisible();
  await expect(page.getByText(studentResponse.slice(0, 160), { exact: false }).first()).toBeVisible();
  await expect(page.getByText("These fixed ratings demonstrate the report structure; they are not personalized AI analysis.")).toBeVisible();
  await page.getByRole("button", { name: "Build my action kit" }).click();

  await expect(page.getByText("Step 5 of 5")).toBeVisible();
  await expect(page.getByRole("heading", { name: "Adapt these three artifacts to the agreement you actually reach." })).toBeFocused();
  await expect(page.getByLabel("Editable conversation plan")).toHaveValue(/POINTS TO RAISE/);
  await expect(page.getByLabel("Editable task division")).toHaveValue(/You\nTask:/);
  await expect(page.getByLabel("Editable follow-up message")).toHaveValue(/Please reply if I missed or misunderstood anything/);
  await page.getByRole("button", { name: "Copy all three" }).click();
  await expect(page.getByText("Action kit copied. Review names, tasks, and deadlines before you use it.")).toBeVisible();
});

test("validates required group setup fields with a focusable error summary", async ({ page }) => {
  await page.goto("/practice/group-project");
  await page.getByRole("button", { name: "See group guidance" }).click();

  await expect(page.getByRole("alert", { name: "Please complete the highlighted fields." })).toBeFocused();
  await expect(page.getByText("Add the course or project.")).toBeVisible();
  await expect(page.getByText("Describe your role or current responsibility.")).toBeVisible();
  await expect(page.getByText("Describe the specific conflict or coordination problem.")).toBeVisible();
});
