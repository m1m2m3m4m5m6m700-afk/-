import { PDFDocument } from "pdf-lib";
import { expect, test, type Download, type Page } from "playwright/test";

test.describe.configure({ mode: "serial", retries: 1, timeout: 45_000 });

async function makePdf(name: string, pageCount: number) {
  const doc = await PDFDocument.create();
  for (let index = 0; index < pageCount; index += 1) doc.addPage([300 + index * 10, 400 + index * 10]);
  const bytes = await doc.save({ useObjectStreams: false });
  return { name, mimeType: "application/pdf", buffer: Buffer.from(bytes) };
}

async function readDownload(download: Download) {
  const stream = await download.createReadStream();
  if (!stream) throw new Error("Download stream unavailable.");
  const chunks: Buffer[] = [];
  for await (const chunk of stream) chunks.push(Buffer.from(chunk));
  return Buffer.concat(chunks);
}

async function certify(page: Page) {
  await page.goto("/tools/pdf-merge", { waitUntil: "domcontentloaded", timeout: 15_000 });
  await expect(page.locator('[data-pdf-merge-ready="true"]')).toHaveCount(1, { timeout: 10_000 });

  const first = await makePdf("stable-first.pdf", 2);
  const second = await makePdf("stable-second.pdf", 1);
  await page.locator('[data-pdf-merge-input="true"]').setInputFiles([first, second]);
  await expect(page.getByRole("button", { name: "Merge PDFs" })).toBeEnabled();

  await page.getByRole("button", { name: "Merge PDFs" }).click();
  await expect(page.locator('[data-pdf-merge-result="true"]')).toBeVisible({ timeout: 15_000 });

  const downloadPromise = page.waitForEvent("download", { timeout: 10_000 });
  await page.locator('[data-pdf-merge-download="true"]').click();
  const download = await downloadPromise;
  await expect.poll(() => download.failure(), { timeout: 10_000 }).toBeNull();

  const bytes = await readDownload(download);
  const merged = await PDFDocument.load(bytes);
  expect(merged.getPageCount()).toBe(3);
  expect(merged.getPage(0).getWidth()).toBe(300);
  expect(merged.getPage(1).getWidth()).toBe(310);
  expect(merged.getPage(2).getWidth()).toBe(300);
}

test.describe("PDF Merge stability", () => {
  test("merge output is deterministic across repeated browser runs", async ({ page }) => {
    await certify(page);
  });
});
