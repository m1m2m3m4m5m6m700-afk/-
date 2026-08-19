import { createRequire } from "node:module";
import { test, expect, type Download, type Page, type TestInfo } from "playwright/test";
import { assertPngArtifact } from "./utils/image-validator";

const require = createRequire(import.meta.url);
const jsQR = require("jsqr") as (
  data: Uint8ClampedArray,
  width: number,
  height: number,
  options?: { inversionAttempts?: "attemptBoth" | "dontInvert" | "onlyInvert" | "invertFirst" },
) => { data: string } | null;

const CRITICAL_CASES = [
  { id: "arabic", modeIndex: 1, payload: "مرحبا Flixo — اختبار QR ✓", input: "مرحبا Flixo — اختبار QR ✓" },
  { id: "wifi", modeIndex: 2, payload: "WIFI:T:WPA;S:Office\\;WiFi\\\\5G;P:p@ss\\:word\\,42;;", ssid: "Office;WiFi\\5G", pass: "p@ss:word,42" },
  { id: "long-unicode", modeIndex: 1, payload: "مرحبا Flixo — QR ✓ اختبار ".repeat(40), input: "مرحبا Flixo — QR ✓ اختبار ".repeat(40) },
  { id: "rapid-change", modeIndex: 0, payload: "https://example.com/final-result", input: "https://example.com/final-result" },
] as const;

async function openTool(page: Page) {
  await page.goto("/tools/qr-generator");
  await expect(page.locator('[data-hydrated="true"]')).toHaveCount(1, { timeout: 10_000 });
  await expect(page.locator("h1")).toHaveCount(1, { timeout: 10_000 });
  await expect(page.locator('button[aria-pressed]')).toHaveCount(5, { timeout: 10_000 });
}

async function readDownloadBuffer(download: Download) {
  const stream = await download.createReadStream();
  if (!stream) throw new Error("Download stream unavailable.");
  const chunks: Buffer[] = [];
  for await (const chunk of stream) chunks.push(Buffer.from(chunk));
  return Buffer.concat(chunks);
}

async function decodePng(page: Page, png: Buffer) {
  return page.evaluate(async (source) => {
    const image = new Image();
    image.src = source;
    await image.decode();
    const canvas = document.createElement("canvas");
    canvas.width = image.naturalWidth;
    canvas.height = image.naturalHeight;
    const context = canvas.getContext("2d", { willReadFrequently: true });
    if (!context) throw new Error("Canvas 2D context unavailable.");
    context.drawImage(image, 0, 0);
    const pixels = context.getImageData(0, 0, canvas.width, canvas.height);
    return { data: Array.from(pixels.data), width: pixels.width, height: pixels.height };
  }, `data:image/png;base64,${png.toString("base64")}`);
}

async function decodeSvg(page: Page, svgText: string) {
  return page.evaluate(async (source) => {
    const image = new Image();
    image.src = `data:image/svg+xml;base64,${btoa(unescape(encodeURIComponent(source)))}`;
    await image.decode();
    const canvas = document.createElement("canvas");
    canvas.width = image.naturalWidth;
    canvas.height = image.naturalHeight;
    const context = canvas.getContext("2d", { willReadFrequently: true });
    if (!context) throw new Error("Canvas 2D context unavailable for SVG.");
    context.drawImage(image, 0, 0);
    const pixels = context.getImageData(0, 0, canvas.width, canvas.height);
    return { data: Array.from(pixels.data), width: pixels.width, height: pixels.height };
  }, svgText);
}

async function fillCriticalCase(page: Page, item: (typeof CRITICAL_CASES)[number]) {
  await page.locator('button[aria-pressed]').nth(item.modeIndex).click({ timeout: 5_000 });
  if (item.id === "wifi") {
    await page.locator('input[type="text"]').first().fill(item.ssid, { timeout: 5_000 });
    await page.locator('input[type="password"]').fill(item.pass, { timeout: 5_000 });
  } else if (item.id === "rapid-change") {
    const input = page.locator('input[type="text"]').first();
    await input.fill("https://example.com/old-result");
    await input.fill(item.input);
  } else {
    await page.locator("textarea").fill(item.input, { timeout: 5_000 });
  }
}

async function certifyCase(page: Page, testInfo: TestInfo, item: (typeof CRITICAL_CASES)[number]) {
  try {
    await fillCriticalCase(page, item);
    await expect(page.getByRole("button", { name: "Download PNG" })).toBeEnabled({ timeout: 10_000 });
    await expect(page.getByRole("button", { name: "Download Vector SVG" })).toBeEnabled({ timeout: 10_000 });

    const pngDownloadPromise = page.waitForEvent("download", { timeout: 5_000 });
    await page.getByRole("button", { name: "Download PNG" }).click();
    const pngDownload = await pngDownloadPromise;
    await expect.poll(() => pngDownload.failure(), { timeout: 5_000 }).toBeNull();
    const png = await readDownloadBuffer(pngDownload);
    assertPngArtifact(png, 300, 300);
    const pngPixels = await decodePng(page, png);
    const pngDecoded = jsQR(new Uint8ClampedArray(pngPixels.data), pngPixels.width, pngPixels.height, { inversionAttempts: "attemptBoth" });
    expect(pngDecoded?.data, `${item.id}: PNG decode mismatch`).toBe(item.payload);

    const svgDownloadPromise = page.waitForEvent("download", { timeout: 5_000 });
    await page.getByRole("button", { name: "Download Vector SVG" }).click();
    const svgDownload = await svgDownloadPromise;
    await expect.poll(() => svgDownload.failure(), { timeout: 5_000 }).toBeNull();
    const svg = (await readDownloadBuffer(svgDownload)).toString("utf8");
    expect(svg).toContain("<svg");
    expect(svg).toContain("xmlns=");
    expect(svg).not.toMatch(/<script|javascript:|on[a-z]+\s*=/i);
    const svgPixels = await decodeSvg(page, svg);
    const svgDecoded = jsQR(new Uint8ClampedArray(svgPixels.data), svgPixels.width, svgPixels.height, { inversionAttempts: "attemptBoth" });
    expect(svgDecoded?.data, `${item.id}: SVG decode mismatch`).toBe(item.payload);

    await testInfo.attach(`qr-${item.id}-evidence.json`, {
      body: JSON.stringify({ case: item.id, expectedPayload: item.payload, pngDecoded: pngDecoded?.data ?? null, svgDecoded: svgDecoded?.data ?? null, pngBytes: png.length, svgBytes: Buffer.byteLength(svg) }, null, 2),
      contentType: "application/json",
    });
  } catch (error) {
    await testInfo.attach(`qr-${item.id}-failure.json`, {
      body: JSON.stringify({ case: item.id, expectedPayload: item.payload, error: String(error) }, null, 2),
      contentType: "application/json",
    });
    throw error;
  }
}

test.describe("QR Generator critical output certification", () => {
  test("critical payloads are exact in PNG and SVG", async ({ page }, testInfo) => {
    await openTool(page);
    for (const item of CRITICAL_CASES) {
      await certifyCase(page, testInfo, item);
    }
  }).setTimeout(45_000);
});
