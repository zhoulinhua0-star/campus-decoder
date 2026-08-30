import { expect, test } from "@playwright/test";

test("routes neutral practice entry points through an equal scenario chooser", async ({ page }) => {
  await page.goto("/");

  const practiceLinks = page.locator('a[href="/practice"]');
  await expect(practiceLinks).toHaveCount(3);
  await expect(page.getByText("One guided path")).toBeVisible();
  await expect(page.getByText("Office hours · Practice")).toHaveCount(0);

  await page.locator("main > section").first().getByRole("link", { name: "Choose a scenario" }).click();
  await expect(page).toHaveURL(/\/practice$/);
  await expect(page.getByRole("heading", { name: "What would you like to practice?" })).toBeVisible();

  const cards = page.locator("main section .card");
  await expect(cards).toHaveCount(3);
  const cardSizes = await cards.evaluateAll((elements) => elements.map((element) => {
    const rect = element.getBoundingClientRect();
    return { height: Math.round(rect.height), width: Math.round(rect.width) };
  }));
  expect(new Set(cardSizes.map(({ width }) => width)).size).toBe(1);
  expect(new Set(cardSizes.map(({ height }) => height)).size).toBe(1);

  await expect(page.getByRole("link", { name: /Office Hours/ })).toHaveAttribute("href", "/practice/office-hours");
  await expect(page.getByRole("link", { name: /Emailing a Professor/ })).toHaveAttribute("href", "/practice/email-professor");
  await expect(page.getByRole("link", { name: /Group Project Conflict/ })).toHaveAttribute("href", "/practice/group-project");
});
