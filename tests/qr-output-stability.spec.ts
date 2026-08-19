import { test, expect, type Download, type Page, type TestInfo } from "playwright/test";
import { assertPngArtifact } from "./utils/image-validator";

test.describe.configure({ mode: "serial", retries: 1, timeout: 45_000 });

const CRITICAL_CASES = [
  { id: "arabic", mode: "text", input: "مرحبا Flixo — اختبار QR ✓" },
  { id: "wifi", mode: "wifi", ssid: "Office;WiFi\\5G", pass: "p@ss:word,42" },
  { id: "long-unicode", mode: "text", input: "مرحبا Flixo — QR ✓ اختبار ".repeat(12) },
  { id: "rapid-change", mode: "url", input: "https://example.com/final-result" },
] as const;

async function openTool(page: Page) {
  await page.goto("/tools/qr-generator", { waitUntil: "domcontentloaded", timeout: 10_000 });
  await expect(page.locator('div[data-qr-ready="true"]')).toHaveCount(1, { timeout: 10_000 });
  await expect(page.locator("h1")).toHaveCount(1, { timeout: 10_000 });
  await expect(page.locator("[data-qr-mode-button]")).toHaveCount(5, { timeout: 10_000 });
  await expect(page.getByRole("button", { name: "Download PNG" })).toBeVisible({ timeout: 10_000 });
  await expect(page.getByRole("button", { name: "Download Vector SVG" })).toBeVisible({ timeout: 10_000 });
}

async function selectMode(page: Page, mode: "url" | "text" | "wifi") {
  await page.locator(`[data-qr-mode-button="${mode}"]`).click({ timeout: 5_000 });
  await expect(page.locator(`[data-qr-mode="${mode}"]`)).toHaveCount(1, { timeout: 5_000 });
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
    await selectMode(page, item.mode);
    if (item.id === "wifi") {
      const ssid = page.locator('[data-qr-input="wifi-ssid"]');
      const password = page.locator('[data-qr-input="wifi-password"]');
      const encryption = page.locator('[data-qr-input="wifi-encryption"]');
      await expect(ssid).toBeVisible({ timeout: 5_000 });
      await expect(password).toBeVisible({ timeout: 5_000 });
      await expect(encryption).toBeVisible({ timeout: 5_000 });
      await ssid.fill(item.ssid, { timeout: 5_000 });
      await password.fill(item.pass, { timeout: 5_000 });
      await encryption.selectOption("WPA");
    } else if (item.mode === "url") {
      const input = page.locator('[data-qr-input="url"]');
      await expect(input).toBeVisible({ timeout: 5_000 });
      await input.fill("https://example.com/old-result");
      await input.fill(item.input);
    } else {
      const textarea = page.locator('[data-qr-input="text"]');
      await expect(textarea).toBeVisible({ timeout: 5_000 });
      await textarea.fill(item.input, { timeout: 5_000 });
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
