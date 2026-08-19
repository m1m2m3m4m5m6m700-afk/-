import { test, expect } from "playwright/test";
import JSZip from "jszip";

test.describe("Archive Extractor security and collision contract", () => {
  test("rejects duplicate download basenames without exposing downloads", async ({ page }) => {
    await page.goto("/tools/archive-extractor");
    await expect(page.locator('[data-hydrated="true"]')).toHaveCount(1, { timeout: 30_000 });

    const zip = new JSZip();
    zip.file("a/report.txt", "first");
    zip.file("b/report.txt", "second");
    const bytes = await zip.generateAsync({ type: "nodebuffer" });

    await page.locator('input[type="file"]').setInputFiles({
      name: "duplicate-basenames.zip",
      mimeType: "application/zip",
      buffer: bytes,
    });

    await expect(
      page.getByText("The ZIP archive contains duplicate output filenames and cannot be extracted safely.", { exact: true }),
    ).toBeVisible();
    await expect(page.locator("a[download]")).toHaveCount(0);
  });

  test("rejects unsafe traversal paths without exposing downloads", async ({ page }) => {
    await page.goto("/tools/archive-extractor");
    await expect(page.locator('[data-hydrated="true"]')).toHaveCount(1, { timeout: 30_000 });

    const zip = new JSZip();
    zip.file("../escape.txt", "should never be extracted");
    const bytes = await zip.generateAsync({ type: "nodebuffer" });

    await page.locator('input[type="file"]').setInputFiles({
      name: "unsafe-path.zip",
      mimeType: "application/zip",
      buffer: bytes,
    });

    await expect(
      page.getByText("The ZIP archive contains an unsafe file path and cannot be extracted.", { exact: true }),
    ).toBeVisible();
    await expect(page.locator("a[download]")).toHaveCount(0);
  });
});
