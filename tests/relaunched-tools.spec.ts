import { test, expect } from "playwright/test";

const onePixelPng = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=",
  "base64",
);

async function openTool(page: Parameters<typeof test>[0] extends never ? never : any, slug: string) {
  await page.goto(`/tools/${slug}`);
  await expect(page.locator('[data-hydrated="true"]')).toHaveCount(1, { timeout: 30_000 });
  await expect(page.locator("h1")).toHaveCount(1);
}

test.describe("relaunched public tools", () => {
  test("Image Compressor loads, accepts an image, and exposes a download action", async ({ page }) => {
    await openTool(page, "image-compressor");
    const input = page.locator('input[type="file"]');
    await input.setInputFiles({ name: "pixel.png", mimeType: "image/png", buffer: onePixelPng });
    await expect(page.getByRole("button", { name: /Download/i })).toBeEnabled({ timeout: 30_000 });
    await expect(page.locator('img[alt]').first()).toBeVisible();
  });

  test("Image Enhancer loads and accepts an image input", async ({ page }) => {
    await openTool(page, "image-enhancer");
    const input = page.locator('input[type="file"]').first();
    await expect(input).toBeAttached();
    await input.setInputFiles({ name: "pixel.png", mimeType: "image/png", buffer: onePixelPng });
    await expect(page.locator('img[alt]').first()).toBeVisible({ timeout: 30_000 });
  });

  test("Video Compressor loads, validates video input, and enables processing", async ({ page }) => {
    await openTool(page, "video-compressor");
    const button = page.getByRole("button", { name: /Compress Video/i });
    await expect(button).toBeDisabled();
    await page.locator('input[type="file"]').setInputFiles({
      name: "sample.mp4",
      mimeType: "video/mp4",
      buffer: Buffer.from("not-a-real-video"),
    });
    await expect(button).toBeEnabled();
    await expect(page.getByText(/sample\.mp4/)).toBeVisible();
  });

  test("Video Trimmer loads, accepts a candidate video file, and surfaces validation feedback", async ({ page }) => {
    await openTool(page, "video-trimmer");
    const button = page.getByRole("button", { name: /Trim Video/i });
    await expect(button).toBeDisabled();
    await page.locator('input[type="file"]').setInputFiles({
      name: "invalid.mp4",
      mimeType: "video/mp4",
      buffer: Buffer.from("not-a-real-video"),
    });
    await expect(page.getByRole("alert")).toBeVisible({ timeout: 30_000 });
  });
});
