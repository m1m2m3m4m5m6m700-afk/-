import { test, expect, type Download, type Page } from "playwright/test";
import { assertPngArtifact } from "./utils/image-validator";

// CI trigger: QR certification readiness is intentionally fail-fast and bounded.
test.describe.configure({ mode: "serial", retries: 1, timeout: 45_000 });

async function openTool(page: Page) {
  await page.goto("/tools/qr-generator", { waitUntil: "domcontentloaded", timeout: 10_000 });
  await expect(page.locator('div[data-qr-ready="true"]')).toHaveCount(1, { timeout: 10_000 });
  await expect(page.locator("h1")).toHaveCount(1, { timeout: 10_000 });
  await expect(page.locator("[data-qr-mode-button]")).toHaveCount(5, { timeout: 10_000 });
  await expect(page.getByRole("button", { name: "Download PNG" })).toBeVisible({ timeout: 10_000 });
  await expect(page.getByRole("button", { name: "Download Vector SVG" })).toBeVisible({ timeout: 10_000 });
}

async function selectMode(page: Page, mode: "url" | "text" | "wifi" | "email" | "phone") {
  await page.locator(`[data-qr-mode-button="${mode}"]`).click({ timeout: 5_000 });
  await expect(page.locator(`[data-qr-mode="${mode}"]`)).toHaveCount(1, { timeout: 5_000 });
}

async function readDownloadBuffer(download: Download): Promise<Buffer> {
  const stream = await download.createReadStream();
  if (!stream) throw new Error("Download stream unavailable.");
  const chunks: Buffer[] = [];
  for await (const chunk of stream) chunks.push(Buffer.from(chunk));
  return Buffer.concat(chunks);
}

async function verifyDownloads(page: Page) {
  await expect(page.locator("img[alt]").first()).toBeVisible({ timeout: 10_000 });
  await expect(page.getByRole("button", { name: "Download PNG" })).toBeEnabled({ timeout: 10_000 });
  await expect(page.getByRole("button", { name: "Download Vector SVG" })).toBeEnabled({ timeout: 10_000 });

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
}

test.describe("QR browser integration certification", () => {
  test.beforeEach(async ({ page }) => {
    await openTool(page);
  });

  test("critical UI and downloads work for Arabic", async ({ page }) => {
    await selectMode(page, "text");
    const textarea = page.locator('[data-qr-input="text"]');
    await expect(textarea).toBeVisible({ timeout: 5_000 });
    await textarea.fill("مرحبا Flixo — اختبار QR ✓");
    await verifyDownloads(page);
  });

  test("critical UI and downloads work for Wi-Fi escaping", async ({ page }) => {
    await selectMode(page, "wifi");
    const ssid = page.locator('[data-qr-input="wifi-ssid"]');
    const password = page.locator('[data-qr-input="wifi-password"]');
    const encryption = page.locator('[data-qr-input="wifi-encryption"]');
    await expect(ssid).toBeVisible({ timeout: 5_000 });
    await expect(password).toBeVisible({ timeout: 5_000 });
    await expect(encryption).toBeVisible({ timeout: 5_000 });
    await ssid.fill("Office;WiFi\\5G");
    await password.fill("p@ss:word,42");
    await encryption.selectOption("WPA");
    await verifyDownloads(page);
  });

  test("critical UI and downloads work for long Unicode", async ({ page }) => {
    await selectMode(page, "text");
    const textarea = page.locator('[data-qr-input="text"]');
    await expect(textarea).toBeVisible({ timeout: 5_000 });
    await textarea.fill("مرحبا Flixo — QR ✓ اختبار ".repeat(12));
    await verifyDownloads(page);
  });

  test("critical rapid changes do not block downloads", async ({ page }) => {
    await selectMode(page, "url");
    const input = page.locator('[data-qr-input="url"]');
    await expect(input).toBeVisible({ timeout: 5_000 });
    await input.fill("https://example.com/old-result");
    await input.fill("https://example.com/final-result");
    await verifyDownloads(page);
  });
});
