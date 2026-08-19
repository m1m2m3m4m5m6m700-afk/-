import { createRequire } from "node:module";
import { test, expect, type Download, type Page } from "playwright/test";

import { assertPngArtifact } from "./utils/image-validator";

const require = createRequire(import.meta.url);
const jsQR = require("jsqr") as (
  data: Uint8ClampedArray,
  width: number,
  height: number,
  options?: { inversionAttempts?: "attemptBoth" | "dontInvert" | "onlyInvert" | "invertFirst" },
) => { data: string } | null;

async function openTool(page: Page, slug: string) {
  await page.goto(`/tools/${slug}`);
  await expect(page.locator('[data-hydrated="true"]')).toHaveCount(1, { timeout: 30_000 });
  await expect(page.locator("h1")).toHaveCount(1);
}

async function readDownloadBuffer(download: Download): Promise<Buffer> {
  const stream = await download.createReadStream();
  if (!stream) throw new Error("Download did not provide a readable output stream.");
  const chunks: Buffer[] = [];
  for await (const chunk of stream) chunks.push(Buffer.from(chunk));
  return Buffer.concat(chunks);
}

async function readDownloadText(download: Download): Promise<string> {
  return (await readDownloadBuffer(download)).toString("utf8");
}

async function rasterize(page: Page, dataUrl: string) {
  return page.evaluate(async (source) => {
    const image = new Image();
    image.src = source;
    await image.decode();
    const canvas = document.createElement("canvas");
    canvas.width = image.naturalWidth;
    canvas.height = image.naturalHeight;
    const context = canvas.getContext("2d", { willReadFrequently: true });
    if (!context) throw new Error("Canvas 2D context is unavailable for QR verification.");
    context.drawImage(image, 0, 0);
    const pixels = context.getImageData(0, 0, canvas.width, canvas.height);
    return { data: Array.from(pixels.data), width: pixels.width, height: pixels.height };
  }, dataUrl);
}

async function decodeQrDataUrl(page: Page, dataUrl: string): Promise<string> {
  const { data, width, height } = await rasterize(page, dataUrl);
  const decoded = jsQR(new Uint8ClampedArray(data), width, height, { inversionAttempts: "attemptBoth" });
  if (!decoded?.data) throw new Error(`Independent jsQR decoder failed for ${width}x${height} image.`);
  return decoded.data;
}

async function assertQrDownloads(page: Page, expectedPayload: string) {
  await expect(page.locator("img[alt]").first()).toBeVisible({ timeout: 30_000 });
  await expect(page.getByRole("button", { name: "Download PNG" })).toBeEnabled({ timeout: 30_000 });
  await expect(page.getByRole("button", { name: "Download Vector SVG" })).toBeEnabled({ timeout: 30_000 });

  const pngDownloadPromise = page.waitForEvent("download");
  await page.getByRole("button", { name: "Download PNG" }).click();
  const pngDownload = await pngDownloadPromise;
  await expect.poll(() => pngDownload.failure()).toBeNull();
  const pngBuffer = await readDownloadBuffer(pngDownload);
  assertPngArtifact(pngBuffer, 300, 300);
  expect(await decodeQrDataUrl(page, `data:image/png;base64,${pngBuffer.toString("base64")}`)).toBe(expectedPayload);

  const svgDownloadPromise = page.waitForEvent("download");
  await page.getByRole("button", { name: "Download Vector SVG" }).click();
  const svgDownload = await svgDownloadPromise;
  await expect.poll(() => svgDownload.failure()).toBeNull();
  const svgText = await readDownloadText(svgDownload);
  expect(svgText).toContain("<svg");
  expect(svgText).toContain("xmlns=");
  expect(svgText).not.toMatch(/<script|javascript:|on[a-z]+\s*=/i);
  expect(await decodeQrDataUrl(page, `data:image/svg+xml;base64,${Buffer.from(svgText, "utf8").toString("base64")}`)).toBe(expectedPayload);
}

test.describe("QR Generator independent output certification", () => {
  test.beforeEach(async ({ page }) => {
    await openTool(page, "qr-generator");
    await expect(page.locator('button[aria-pressed]')).toHaveCount(5);
  });

  test("URL payload is exact in PNG and SVG", async ({ page }) => {
    const expected = "https://example.com/flixo?qr=1&lang=ar";
    await page.locator('input[type="text"]').first().fill(expected);
    await assertQrDownloads(page, expected);
  });

  test("Arabic and Unicode text is exact in PNG and SVG", async ({ page }) => {
    await page.locator('button[aria-pressed]').nth(1).click();
    const expected = "مرحبا Flixo QR ✓ — تحقق من الناتج";
    await page.locator("textarea").fill(expected);
    await assertQrDownloads(page, expected);
  });

  test("Wi-Fi escaping is exact", async ({ page }) => {
    await page.locator('button[aria-pressed]').nth(2).click();
    await page.locator('input[type="text"]').first().fill("Office;WiFi\\5G");
    await page.locator('input[type="password"]').fill("p@ss:word,42");
    await page.locator("select").selectOption("WPA");
    const expected = "WIFI:T:WPA;S:Office\\;WiFi\\\\5G;P:p@ss\\:word\\,42;;";
    await assertQrDownloads(page, expected);
  });

  test("Email payload is exact", async ({ page }) => {
    await page.locator('button[aria-pressed]').nth(3).click();
    await page.locator('input[type="email"]').fill("test@example.com");
    await page.locator('input[type="text"]').first().fill("Hello Flixo ✓");
    await assertQrDownloads(page, "mailto:test@example.com?subject=Hello%20Flixo%20%E2%9C%93");
  });

  test("Phone payload is exact", async ({ page }) => {
    await page.locator('button[aria-pressed]').nth(4).click();
    const expected = "tel:+201001234567";
    await page.locator('input[type="tel"]').fill("+201001234567");
    await assertQrDownloads(page, expected);
  });

  test("Long Unicode payload remains exact", async ({ page }) => {
    await page.locator('button[aria-pressed]').nth(1).click();
    const expected = "مرحبا Flixo — " + "QR ✓ اختبار ".repeat(40);
    await page.locator("textarea").fill(expected);
    await assertQrDownloads(page, expected);
  });

  test("Rapid changes do not leave a stale result", async ({ page }) => {
    const input = page.locator('input[type="text"]').first();
    await input.fill("https://example.com/old-result");
    await input.fill("https://example.com/final-result");
    await assertQrDownloads(page, "https://example.com/final-result");
  });

  test("Custom colors preserve payload", async ({ page }) => {
    const expected = "https://example.com/color-variant";
    await page.locator('input[type="text"]').first().fill(expected);
    const colors = page.locator('input[type="color"]');
    await colors.nth(0).evaluate((element) => {
      const input = element as HTMLInputElement;
      input.value = "#123456";
      input.dispatchEvent(new Event("input", { bubbles: true }));
      input.dispatchEvent(new Event("change", { bubbles: true }));
    });
    await assertQrDownloads(page, expected);
  });

  test("Empty input disables downloads", async ({ page }) => {
    await page.locator('input[type="text"]').first().fill("");
    await expect(page.getByRole("button", { name: "Download PNG" })).toBeDisabled();
    await expect(page.getByRole("button", { name: "Download Vector SVG" })).toBeDisabled();
  });
});
