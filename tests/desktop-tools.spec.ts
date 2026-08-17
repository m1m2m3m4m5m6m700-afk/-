import { test, expect } from "playwright/test";

test.describe("desktop/file tool browser smoke checks", () => {
  test("public tool runtime remains interactive after navigation", async ({ page }) => {
    await page.goto("/tools/translator", { waitUntil: "domcontentloaded" });

    await expect(page.getByRole("heading", { name: "AI Translator" })).toBeVisible();
    await expect(page.locator("textarea").first()).toBeVisible();
  });
});
