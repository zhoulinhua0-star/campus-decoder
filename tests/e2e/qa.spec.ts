import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";

async function expectNoHorizontalOverflow(page: Page) {
  const overflow = await page.evaluate(() => {
    const viewportWidth = document.documentElement.clientWidth;
    const offenders = [...document.querySelectorAll<HTMLElement>("body *")]
      .filter((element) => {
        const style = getComputedStyle(element);
        if (style.position === "fixed" || style.position === "absolute") return false;
        const rect = element.getBoundingClientRect();
        return rect.width > 0 && (rect.left < -1 || rect.right > viewportWidth + 1);
      })
      .slice(0, 8)
      .map((element) => `${element.tagName.toLowerCase()}${element.id ? `#${element.id}` : ""}.${element.className}`);

    return {
      documentWidth: document.documentElement.scrollWidth,
      offenders,
      viewportWidth,
    };
  });

  expect(overflow.documentWidth, JSON.stringify(overflow)).toBeLessThanOrEqual(overflow.viewportWidth + 1);
  expect(overflow.offenders, JSON.stringify(overflow)).toEqual([]);
}

async function expectLargeEnoughTargets(page: Page) {
  const undersized = await page.locator("a[href], button").evaluateAll((elements) => elements
    .filter((element) => {
      const htmlElement = element as HTMLElement;
      const style = getComputedStyle(htmlElement);
      return style.visibility !== "hidden" && style.display !== "none" && htmlElement.getClientRects().length > 0;
    })
    .map((element) => {
      const rect = element.getBoundingClientRect();
      return { label: element.getAttribute("aria-label") || element.textContent?.trim() || element.tagName, width: rect.width, height: rect.height };
    })
    .filter(({ width, height }) => width < 44 || height < 44));

  expect(undersized).toEqual([]);
}

async function expectAccessible(page: Page) {
  const results = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
    .analyze();
  expect(results.violations).toEqual([]);
}

test("keeps landing and setup responsive with large interaction targets", async ({ page }) => {
  await page.goto("/");
  await expectNoHorizontalOverflow(page);
  await expectLargeEnoughTargets(page);

  await page.goto("/practice/office-hours");
  await expectNoHorizontalOverflow(page);
  await expectLargeEnoughTargets(page);
});

test("wraps long personal context through the practice stage", async ({ page }) => {
  const longCourse = `BIOLOGY_${"X".repeat(105)}`;
  const longGoal = `Understand_${"Y".repeat(470)}`;
  const longSituation = `Feedback_${"Z".repeat(1100)}`;
  const longFeedback = `COMMENT_${"W".repeat(1900)}`;

  await page.goto("/practice/office-hours");
  await page.getByLabel("Course or subject").fill(longCourse);
  await page.getByLabel("What do you want from this conversation?").fill(longGoal);
  await page.getByLabel("What happened?").fill(longSituation);
  await page.getByLabel(/Professor feedback/).fill(longFeedback);
  await page.getByRole("button", { name: "See Office Hours guidance" }).click();

  await expect(page.getByText(longFeedback, { exact: false })).toBeVisible();
  await expectNoHorizontalOverflow(page);
  await page.getByRole("button", { name: "Start the role-play" }).click();
  await expect(page.getByRole("heading", { name: "Practice Professor" })).toBeVisible();
  await expectNoHorizontalOverflow(page);
});

test("honors reduced motion and keeps revealed content readable", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "desktop-chromium");
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");

  const scenariosHeading = page.getByRole("heading", { name: "Practice university life before it happens." });
  await scenariosHeading.scrollIntoViewIfNeeded();
  await expect(scenariosHeading).toBeVisible();
  const reveal = scenariosHeading.locator("xpath=ancestor::*[@data-scroll-reveal][1]");
  await expect(reveal).toHaveAttribute("data-reveal-visible", "true");
  await expect(reveal).toHaveCSS("opacity", "1");
  await expect(reveal).toHaveCSS("transform", "none");
});

test("moves keyboard focus predictably through the stage change", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "desktop-chromium");
  await page.goto("/practice/office-hours");

  await page.keyboard.press("Tab");
  const skipLink = page.getByRole("link", { name: "Skip to main content" });
  await expect(skipLink).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(page.locator("#main-content")).toBeFocused();

  await page.reload();
  await page.keyboard.press("Tab");
  await expect(skipLink).toBeFocused();
  await page.keyboard.press("Tab");
  await expect(page.getByRole("link", { name: "Campus Decoder home" })).toBeFocused();
  await page.keyboard.press("Tab");
  await expect(page.getByRole("link", { name: "Exit practice" })).toBeFocused();
  await page.keyboard.press("Tab");
  await expect(page.getByRole("button", { name: /Use my situation/ })).toBeFocused();
  await page.keyboard.press("Tab");
  await expect(page.getByRole("button", { name: /Try the sample/ })).toBeFocused();
  await page.keyboard.press("Enter");

  await page.getByRole("button", { name: "See Office Hours guidance" }).click();
  const contextHeading = page.getByRole("heading", { name: "Separate what we know from what we still need to ask." });
  await expect(contextHeading).toBeFocused();
  await page.keyboard.press("Tab");
  const editButton = page.getByRole("button", { name: "Edit context" });
  await expect(editButton).toBeFocused();
  expect(await editButton.evaluate((element) => Number.parseFloat(getComputedStyle(element).outlineWidth))).toBeGreaterThanOrEqual(2);

  await page.keyboard.press("Tab");
  await page.keyboard.press("Enter");
  await expect(page.getByRole("heading", { name: "Practice Professor" })).toBeFocused();
});

test("has no automated accessibility violations across core stages", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "desktop-chromium");
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  await expectAccessible(page);

  await page.goto("/practice/office-hours");
  await expectAccessible(page);
  await page.getByRole("button", { name: /Try the sample/ }).click();
  await page.getByRole("button", { name: "See Office Hours guidance" }).click();
  await expect(page.getByRole("heading", { name: "Separate what we know from what we still need to ask." })).toBeVisible();
  await expectAccessible(page);
  await page.getByRole("button", { name: "Start the role-play" }).click();
  await expect(page.getByRole("heading", { name: "Practice Professor" })).toBeVisible();
  await expectAccessible(page);

  await page.getByLabel("Your response to the professor").fill("Could we review the feedback on my thesis?");
  await page.getByRole("button", { name: "Send response" }).click();
  await expect(page.getByText("Thanks for coming in. Could you point me to one part of the feedback or essay you would most like to understand?")).toBeVisible();
  await page.getByRole("button", { name: "Finish & see feedback" }).click();
  await expect(page.getByRole("heading", { name: "Here is how your personalized coaching will be structured." })).toBeVisible();
  await expectAccessible(page);

  await page.getByRole("button", { name: "View sample action plan" }).click();
  await expect(page.getByRole("heading", { name: "Sample meeting outline" })).toBeVisible();
  await expectAccessible(page);
});
