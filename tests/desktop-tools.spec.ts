import { test, expect, type Download, type Page } from "playwright/test";

import { assertPngArtifact } from "./utils/image-validator";

const onePixelPng = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=",
  "base64",
);

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

async function decodeQrDataUrl(page: Page, dataUrl: string): Promise<string> {
  return page.evaluate(async (source) => {
    type DetectedCode = { rawValue: string };
    type Detector = { detect(source: ImageBitmapSource): Promise<DetectedCode[]> };
    type DetectorConstructor = {
      new (options?: { formats?: string[] }): Detector;
      getSupportedFormats(): Promise<string[]>;
    };

    const barcodeDetector = (
      globalThis as unknown as { BarcodeDetector?: DetectorConstructor }
    ).BarcodeDetector;
    if (!barcodeDetector) {
      throw new Error("QR output verification requires BarcodeDetector support in the CI browser.");
    }

    const formats = await barcodeDetector.getSupportedFormats();
    if (!formats.includes("qr_code")) {
      throw new Error(`CI browser does not support QR decoding. Supported formats: ${formats.join(", ")}`);
    }

    const image = new Image();
    image.src = source;
    await image.decode();

    const detector = new barcodeDetector({ formats: ["qr_code"] });
    const detected = await detector.detect(image);
    if (detected.length !== 1 || !detected[0]?.rawValue) {
      throw new Error(`Expected exactly one QR payload, detected ${detected.length}.`);
    }
    return detected[0].rawValue;
  }, dataUrl);
}

async function setColorInput(locator: ReturnType<Page["locator"]>, value: string) {
  await locator.evaluate((element, nextValue) => {
    const input = element as HTMLInputElement;
    input.value = nextValue;
    input.dispatchEvent(new Event("input", { bubbles: true }));
    input.dispatchEvent(new Event("change", { bubbles: true }));
  }, value);
}

async function assertQrDownloads(page: Page, expectedPayload: string) {
  await expect(page.locator('img[alt]').first()).toBeVisible({ timeout: 30_000 });
  await expect(page.getByRole("button", { name: "Download PNG" })).toBeEnabled({ timeout: 30_000 });
  await expect(page.getByRole("button", { name: "Download Vector SVG" })).toBeEnabled({ timeout: 30_000 });

  const pngDownloadPromise = page.waitForEvent("download");
  await page.getByRole("button", { name: "Download PNG" }).click();
  const pngDownload = await pngDownloadPromise;
  await expect.poll(() => pngDownload.failure()).toBeNull();
  expect(pngDownload.suggestedFilename()).toMatch(/\.png$/i);

  const pngBuffer = await readDownloadBuffer(pngDownload);
  assertPngArtifact(pngBuffer, 300, 300);
  const pngDecoded = await decodeQrDataUrl(
    page,
    `data:image/png;base64,${pngBuffer.toString("base64")}`,
  );
  expect(pngDecoded).toBe(expectedPayload);

  const svgDownloadPromise = page.waitForEvent("download");
  await page.getByRole("button", { name: "Download Vector SVG" }).click();
  const svgDownload = await svgDownloadPromise;
  await expect.poll(() => svgDownload.failure()).toBeNull();
  expect(svgDownload.suggestedFilename()).toMatch(/\.svg$/i);

  const svgText = await readDownloadText(svgDownload);
  expect(svgText).toContain("<svg");
  expect(svgText).toContain("xmlns=");
  expect(svgText).not.toMatch(/<script|javascript:|on[a-z]+\s*=/i);
  const svgDataUrl = `data:image/svg+xml;base64,${Buffer.from(svgText, "utf8").toString("base64")}`;
  const svgDecoded = await decodeQrDataUrl(page, svgDataUrl);
  expect(svgDecoded).toBe(expectedPayload);
}

test.describe("relaunched public tools", () => {
  test("Image Compressor loads, accepts an image, and exposes a download action", async ({ page }) => {
    await openTool(page, "image-compressor");
    const input = page.locator('input[type="file"]');
    await input.setInputFiles({ name: "pixel.png", mimeType: "image/png", buffer: onePixelPng });
    await expect(page.getByRole("button", { name: /Download/i })).toBeEnabled({ timeout: 30_000 });
    await expect(page.locator('img[alt]').first()).toBeVisible();
  });

  test("Image Compressor produces a valid PNG artifact", async ({ page }) => {
    await openTool(page, "image-compressor");
    await page.locator('input[type="file"]').setInputFiles({
      name: "pixel.png",
      mimeType: "image/png",
      buffer: onePixelPng,
    });

    await expect(page.getByRole("button", { name: /Download/i })).toBeEnabled({ timeout: 30_000 });
    const downloadPromise = page.waitForEvent("download");
    await page.getByRole("button", { name: /Download/i }).click();

    const download = await downloadPromise;
    await expect.poll(() => download.failure()).toBeNull();
    expect(download.suggestedFilename()).toMatch(/-compressed\.png$/i);

    const output = await download.createReadStream();
    if (!output) throw new Error("Image Compressor did not provide a downloadable output stream.");

    const chunks: Buffer[] = [];
    for await (const chunk of output) chunks.push(Buffer.from(chunk));
    const buffer = Buffer.concat(chunks);
    assertPngArtifact(buffer, 1, 1);
  });

  test("Image Enhancer loads and accepts an image input", async ({ page }) => {
    await openTool(page, "image-enhancer");
    const input = page.locator('input[type="file"]').first();
    await expect(input).toBeAttached();
    await input.setInputFiles({ name: "pixel.png", mimeType: "image/png", buffer: onePixelPng });
    await expect(page.locator('img[alt]').first()).toBeVisible({ timeout: 30_000 });
  });

  test("Image Enhancer produces a valid 4x PNG artifact", async ({ page }) => {
    await openTool(page, "image-enhancer");
    await page.locator('input[type="file"]').setInputFiles({
      name: "pixel.png",
      mimeType: "image/png",
      buffer: onePixelPng,
    });

    await expect(page.getByRole("button", { name: /Download/i })).toBeEnabled({ timeout: 30_000 });
    const downloadPromise = page.waitForEvent("download");
    await page.getByRole("button", { name: /Download/i }).click();

    const download = await downloadPromise;
    await expect.poll(() => download.failure()).toBeNull();
    expect(download.suggestedFilename()).toMatch(/-4x\.png$/i);

    const output = await download.createReadStream();
    if (!output) throw new Error("Image Enhancer did not provide a downloadable output stream.");

    const chunks: Buffer[] = [];
    for await (const chunk of output) chunks.push(Buffer.from(chunk));
    const buffer = Buffer.concat(chunks);
    assertPngArtifact(buffer, 4, 4);
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

  test.describe("QR Generator output correctness", () => {
    test.beforeEach(async ({ page }) => {
      await openTool(page, "qr-generator");
      await expect(page.locator('button[aria-pressed]')).toHaveCount(5);
    });

    test("URL payload decodes exactly from both PNG and SVG", async ({ page }) => {
      const expected = "https://example.com/flixo?qr=1&lang=ar";
      await page.locator('input[type="text"]').first().fill(expected);
      await assertQrDownloads(page, expected);
    });

    test("plain Unicode text decodes exactly from both PNG and SVG", async ({ page }) => {
      await page.locator('button[aria-pressed]').nth(1).click();
      const expected = "مرحبا Flixo QR ✓ — تحقق من الناتج";
      await page.locator("textarea").fill(expected);
      await assertQrDownloads(page, expected);
    });

    test("Wi-Fi payload preserves required escaping exactly", async ({ page }) => {
      await page.locator('button[aria-pressed]').nth(2).click();
      await page.locator('input[type="text"]').first().fill("Office;WiFi\\5G");
      await page.locator('input[type="password"]').fill("p@ss:word,42");
      await page.locator("select").selectOption("WPA");

      const expected = "WIFI:T:WPA;S:Office\\;WiFi\\\\5G;P:p@ss\\:word\\,42;;";
      await assertQrDownloads(page, expected);
    });

    test("email payload preserves address and encoded subject", async ({ page }) => {
      await page.locator('button[aria-pressed]').nth(3).click();
      await page.locator('input[type="email"]').fill("test@example.com");
      await page.locator('input[type="text"]').first().fill("Hello Flixo ✓");
      await assertQrDownloads(page, "mailto:test@example.com?subject=Hello%20Flixo%20%E2%9C%93");
    });

    test("phone payload decodes exactly", async ({ page }) => {
      await page.locator('button[aria-pressed]').nth(4).click();
      const expected = "tel:+201001234567";
      await page.locator('input[type="tel"]').fill("+201001234567");
      await assertQrDownloads(page, expected);
    });

    test("long Unicode text remains decodable without payload corruption", async ({ page }) => {
      await page.locator('button[aria-pressed]').nth(1).click();
      const expected = "مرحبا Flixo — " + "QR ✓ اختبار ".repeat(40);
      await page.locator("textarea").fill(expected);
      await assertQrDownloads(page, expected);
    });

    test("rapid input changes do not leave a stale QR result", async ({ page }) => {
      const input = page.locator('input[type="text"]').first();
      await input.fill("https://example.com/old-result");
      await input.fill("https://example.com/final-result");
      await expect(page.locator('img[alt]').first()).toBeVisible({ timeout: 30_000 });
      await assertQrDownloads(page, "https://example.com/final-result");
    });

    test("custom dark/light colors still produce a decodable QR payload", async ({ page }) => {
      const expected = "https://example.com/color-variant";
      await page.locator('input[type="text"]').first().fill(expected);
      const colors = page.locator('input[type="color"]');
      await setColorInput(colors.nth(0), "#123456");
      await setColorInput(colors.nth(1), "#ffffff");
      await assertQrDownloads(page, expected);
    });

    test("empty input disables both output downloads", async ({ page }) => {
      await page.locator('input[type="text"]').first().fill("");
      await expect(page.getByRole("button", { name: "Download PNG" })).toBeDisabled();
      await expect(page.getByRole("button", { name: "Download Vector SVG" })).toBeDisabled();
    });
  });
});
