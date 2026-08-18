import { test, expect } from "playwright/test";

test.describe("ZIP Creator contract", () => {
  test("rejects duplicate entry names without producing a download", async ({ page }) => {
    await page.goto("/tools/zip-creator");
    await expect(page.locator('[data-hydrated="true"]')).toHaveCount(1, { timeout: 30_000 });

    await page.locator('input[type="file"]').setInputFiles([
      { name: "duplicate.txt", mimeType: "text/plain", buffer: Buffer.from("first") },
      { name: "duplicate.txt", mimeType: "text/plain", buffer: Buffer.from("second") },
    ]);

    const button = page.getByRole("button", { name: "Create ZIP" });
    await expect(button).toBeEnabled();
    await button.click();

    await expect(
      page.getByText(
        "Duplicate file names are not allowed because they would overwrite data in the ZIP archive.",
        { exact: true },
      ),
    ).toBeVisible();
    await expect(page.getByRole("link", { name: "Download ZIP" })).toHaveCount(0);
  });
});
