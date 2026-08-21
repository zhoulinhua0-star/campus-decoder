import { expect, test } from "@playwright/test";

test("completes the honest Office Hours demo flow", async ({ page }) => {
  const studentResponse = "Thanks for meeting with me. Could we discuss the feedback on my first paragraph?";

  await page.goto("/");
  await page.getByRole("link", { name: "Practice office hours" }).click();

  await expect(page.getByText("Step 1 of 5")).toBeVisible();
  await page.getByRole("button", { name: "See Office Hours guidance" }).click();

  await expect(page.getByRole("heading", { name: "Going to office hours is not wasting your professor’s time." })).toBeVisible();
  await expect(page.getByText("This step explains the general campus norm; it is not yet AI-personalized analysis of your entries.")).toBeVisible();
  await page.getByRole("button", { name: "Start the role-play" }).click();

  await expect(page.getByText("Step 3 of 5")).toBeVisible();
  await page.getByLabel("Your response to the professor").fill(studentResponse);
  await page.getByRole("button", { name: "Send response" }).click();

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
