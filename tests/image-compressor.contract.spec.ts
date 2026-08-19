import { test, expect } from "playwright/test";

test.describe("Image Compressor contract", () => {
  test("rejects a non-image input without exposing a download", async ({ page }) => {
    await page.goto("/tools/image-compressor");
    await expect(page.locator('[data-hydrated="true"]')).toHaveCount(1, { timeout: 30_000 });

    await page.locator('input[type="file"]').setInputFiles({
      name: "not-an-image.txt",
      mimeType: "text/plain",
      buffer: Buffer.from("not image data"),
    });

    await expect(page.getByRole("alert")).toBeVisible({ timeout: 30_000 });
    await expect(page.getByRole("button", { name: /Download/i })).toHaveCount(0);
  });
});
