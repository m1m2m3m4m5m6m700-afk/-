import { test, expect } from "playwright/test";

/**
 * Regression guard for the removed mega-tool PDF surface.
 * Real PDF functionality is admitted only through the canonical Tool Platform
 * once a PDF runtime is registered and certified.
 */
test("removed legacy PDF mega-tool surface is not exposed", async ({ page }) => {
  await page.goto("/");
  await page.waitForLoadState("domcontentloaded");

  await expect(page.locator("body")).toBeVisible();
  await expect(page.locator("[data-mega-tool-hub], [data-mega-tools]")).toHaveCount(0);
  await expect(page.getByText(/Mega Tool Hub/i)).toHaveCount(0);
});
