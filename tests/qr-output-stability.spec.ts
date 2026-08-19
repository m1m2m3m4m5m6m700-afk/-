import { test, expect, type Download, type Page, type TestInfo } from "playwright/test";
import { assertPngArtifact } from "./utils/image-validator";
import { createRequire } from "node:module";

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

async function assertCriticalCase(page: Page, testInfo: TestInfo, item: (typeof CRITICAL_CASES)[number]) {
  try {
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

    await expect(page.getByRole("button", { name: "Download PNG" })).toBeEnabled({ timeout: 10_000 });
    const downloadPromise = page.waitForEvent("download", { timeout: 5_000 });
    await page.getByRole("button", { name: "Download PNG" }).click();
    const download = await downloadPromise;
    await expect.poll(() => download.failure(), { timeout: 5_000 }).toBeNull();
    const png = await readDownloadBuffer(download);
    assertPngArtifact(png, 300, 300);

    const decoded = await decodePng(page, png);
    const result = jsQR(new Uint8ClampedArray(decoded.data), decoded.width, decoded.height, { inversionAttempts: "attemptBoth" });
    expect(result?.data, `${item.id}: independent QR decode failed`).toBe(item.payload);

    await testInfo.attach(`qr-${item.id}-evidence.json`, {
      body: JSON.stringify({ case: item.id, expectedPayload: item.payload, decodedPayload: result?.data ?? null, pngBytes: png.length }, null, 2),
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

test.describe("QR critical output stability", () => {
  test("critical cases remain exact and decodable", async ({ page }, testInfo) => {
    await openTool(page);
    for (const item of CRITICAL_CASES) {
      await assertCriticalCase(page, testInfo, item);
    }
  }).setTimeout(20_000);
});
