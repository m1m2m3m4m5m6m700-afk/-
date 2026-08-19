import { test, expect, type Download, type Page, type TestInfo } from "playwright/test";
import { assertPngArtifact } from "./utils/image-validator";

test.describe.configure({ mode: "serial", retries: 1, timeout: 45_000 });

const CRITICAL_CASES = [
  { id: "arabic", modeIndex: 1, input: "مرحبا Flixo — اختبار QR ✓" },
  { id: "wifi", modeIndex: 2, ssid: "Office;WiFi\\5G", pass: "p@ss:word,42" },
  { id: "long-unicode", modeIndex: 1, input: "مرحبا Flixo — QR ✓ اختبار ".repeat(12) },
  { id: "rapid-change", modeIndex: 0, input: "https://example.com/final-result" },
] as const;

async function openTool(page: Page) {
  await page.goto("/tools/qr-generator", { waitUntil: "domcontentloaded", timeout: 10_000 });
  await expect(page.locator("h1")).toHaveCount(1, { timeout: 10_000 });
  await expect(page.locator('button[aria-pressed]')).toHaveCount(5, { timeout: 10_000 });
  await expect(page.getByRole("button", { name: "Download PNG" })).toBeVisible({ timeout: 10_000 });
  await expect(page.getByRole("button", { name: "Download Vector SVG" })).toBeVisible({ timeout: 10_000 });
}

async function readDownloadBuffer(download: Download) {
  const stream = await download.createReadStream();
  if (!stream) throw new Error("Download stream unavailable.");
  const chunks: Buffer[] = [];
  for await (const chunk of stream) chunks.push(Buffer.from(chunk));
  return Buffer.concat(chunks);
}

async function assertCase(page: Page, testInfo: TestInfo, item: (typeof CRITICAL_CASES)[number]) {
  try {
    await page.locator('button[aria-pressed]').nth(item.modeIndex).click({ timeout: 5_000 });
    if (item.id === "wifi") {
      await expect(page.locator('input[type="password"]')).toBeVisible({ timeout: 5_000 });
      await page.locator('input[type="text"]').first().fill(item.ssid, { timeout: 5_000 });
      await page.locator('input[type="password"]').fill(item.pass, { timeout: 5_000 });
    } else if (item.id === "rapid-change") {
      const input = page.locator('input[type="text"]').first();
      await input.fill("https://example.com/old-result");
      await input.fill(item.input);
    } else {
      await page.locator("textarea").fill(item.input, { timeout: 5_000 });
    }

    await expect(page.locator("img[alt]").first()).toBeVisible({ timeout: 10_000 });
    const pngPromise = page.waitForEvent("download", { timeout: 5_000 });
    await page.getByRole("button", { name: "Download PNG" }).click();
    const pngDownload = await pngPromise;
    await expect.poll(() => pngDownload.failure(), { timeout: 5_000 }).toBeNull();
    const png = await readDownloadBuffer(pngDownload);
    assertPngArtifact(png, 300, 300);

    const svgPromise = page.waitForEvent("download", { timeout: 5_000 });
    await page.getByRole("button", { name: "Download Vector SVG" }).click();
    const svgDownload = await svgPromise;
    await expect.poll(() => svgDownload.failure(), { timeout: 5_000 }).toBeNull();
    const svg = (await readDownloadBuffer(svgDownload)).toString("utf8");
    expect(svg).toMatch(/^<svg[\s>]/i);
    expect(svg).toContain("xmlns=");
    expect(svg).not.toMatch(/<script|javascript:|on[a-z]+\s*=/i);

    await testInfo.attach(`qr-${item.id}-stability.json`, {
      body: JSON.stringify({ case: item.id, pngBytes: png.length, svgBytes: Buffer.byteLength(svg), status: "PASS" }, null, 2),
      contentType: "application/json",
    });
  } catch (error) {
    await testInfo.attach(`qr-${item.id}-failure.json`, {
      body: JSON.stringify({ case: item.id, error: String(error) }, null, 2),
      contentType: "application/json",
    });
    throw error;
  }
}

test.describe("QR critical browser stability", () => {
  test("critical UI and downloads remain stable", async ({ page }, testInfo) => {
    await openTool(page);
    for (const item of CRITICAL_CASES) {
      await assertCase(page, testInfo, item);
    }
  });
});
