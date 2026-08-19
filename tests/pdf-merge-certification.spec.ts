import { PDFDocument } from "pdf-lib";
import { expect, test, type Download, type Page } from "playwright/test";

async function makePdf(name: string, pages: Array<[number, number]>) {
  const doc = await PDFDocument.create();
  for (const [width, height] of pages) doc.addPage([width, height]);
  const bytes = await doc.save({ useObjectStreams: false });
  return { name, mimeType: "application/pdf", buffer: Buffer.from(bytes) };
}

async function openTool(page: Page) {
  await page.goto("/tools/pdf-merge", { waitUntil: "domcontentloaded", timeout: 15_000 });
  await expect(page.locator('[data-pdf-merge-ready="true"]')).toHaveCount(1, { timeout: 10_000 });
  await expect(page.locator('[data-pdf-merge-input="true"]')).toHaveCount(1);
}

async function readDownload(download: Download) {
  const stream = await download.createReadStream();
  if (!stream) throw new Error("Download stream unavailable.");
  const chunks: Buffer[] = [];
  for await (const chunk of stream) chunks.push(Buffer.from(chunk));
  return Buffer.concat(chunks);
}

async function certifyMergedPdf(bytes: Buffer, expectedSizes: Array<[number, number]>) {
  expect(bytes.subarray(0, 5).toString("ascii")).toBe("%PDF-");
  const merged = await PDFDocument.load(bytes);
  expect(merged.getPageCount()).toBe(expectedSizes.length);
  expectedSizes.forEach(([width, height], index) => {
    const page = merged.getPage(index);
    expect(Math.round(page.getWidth())).toBe(width);
    expect(Math.round(page.getHeight())).toBe(height);
  });
}

test.describe("PDF Merge critical output certification", () => {
  test("merges PDFs, preserves page order, and downloads a valid PDF", async ({ page }, testInfo) => {
    await openTool(page);

    const first = await makePdf("first.pdf", [[200, 300], [210, 310]]);
    const second = await makePdf("second.pdf", [[400, 500]]);

    await page.locator('[data-pdf-merge-input="true"]').setInputFiles([first, second]);
    await expect(page.locator('[data-pdf-merge-item="true"]')).toHaveCount(2);
    await expect(page.getByRole("button", { name: "Merge PDFs" })).toBeEnabled();

    const downloadPromise = page.waitForEvent("download", { timeout: 10_000 });
    await page.getByRole("button", { name: "Merge PDFs" }).click();
    await expect(page.locator('[data-pdf-merge-result="true"]')).toBeVisible({ timeout: 15_000 });
    const link = page.locator('[data-pdf-merge-download="true"]');
    await expect(link).toBeVisible();
    await link.click();

    const download = await downloadPromise;
    await expect.poll(() => download.failure(), { timeout: 10_000 }).toBeNull();
    const bytes = await readDownload(download);
    await certifyMergedPdf(bytes, [[200, 300], [210, 310], [400, 500]]);

    await testInfo.attach("pdf-merge-certification.json", {
      body: JSON.stringify({
        inputs: [first.name, second.name],
        outputBytes: bytes.length,
        expectedPages: 3,
        pageOrder: [[200, 300], [210, 310], [400, 500]],
        independentDecoder: "pdf-lib",
      }, null, 2),
      contentType: "application/json",
    });
  });

  test("rejects a single input instead of generating an invalid merge", async ({ page }) => {
    await openTool(page);
    const only = await makePdf("only.pdf", [[200, 300]]);
    await page.locator('[data-pdf-merge-input="true"]').setInputFiles(only);
    await expect(page.getByRole("button", { name: "Merge PDFs" })).toBeDisabled();
    await expect(page.locator('[data-pdf-merge-result="true"]')).toHaveCount(0);
  });
});
