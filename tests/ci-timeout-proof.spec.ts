import { test, expect } from "@playwright/test";

test("CI timeout proof harness loads the app", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveTitle(/Flixo|Flexo/i);
});
