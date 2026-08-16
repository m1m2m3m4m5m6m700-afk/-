import { test, expect, type Download } from "playwright/test";
import JSZip from "jszip";
import { readFile } from "node:fs/promises";

const makeBytes = (size: number, value = 65) => Buffer.alloc(size, value);

async function downloadSize(downloadPromise: Promise<Download>, downloadName?: string) {
  const download = await downloadPromise;
  if (downloadName) expect(download.suggestedFilename()).toBe(downloadName);
  const path = await download.path();
  expect(path).toBeTruthy();
  return path!;
}

test.describe("verified desktop tools", () => {
  test("ZIP Creator creates a readable archive containing selected files", async ({ page }) => {
    await page.goto("/tools/zip-creator");

    // Register the download listener before selecting files because the ZIP tool
    // may generate the archive immediately after the file selection completes.
    const downloadPromise = page.waitForEvent("download", { timeout: 60_000 });
    const input = page.locator('input[type="file"]');
    await input.setInputFiles([
      { name: "alpha.txt", mimeType: "text/plain", buffer: Buffer.from("alpha") },
      { name: "beta.txt", mimeType: "text/plain", buffer: Buffer.from("beta") },
    ]);

    const downloadPath = await downloadSize(downloadPromise, "flixo-files.zip");
    const archive = await readFile(downloadPath);
    expect(archive.length).toBeGreaterThan(0);

    const zip = await JSZip.loadAsync(archive);
    expect(Object.keys(zip.files).sort()).toEqual(["alpha.txt", "beta.txt"]);
    expect(await zip.files["alpha.txt"].async("string")).toBe("alpha");
    expect(await zip.files["beta.txt"].async("string")).toBe("beta");
    await expect(page.getByText("Download ZIP")).toBeVisible();
  });

  test("Archive Extractor reads ZIP entries and exposes extracted output", async ({ page }) => {
    const zip = new JSZip();
    zip.file("hello.txt", "hello from Flixo");
    const bytes = await zip.generateAsync({ type: "nodebuffer" });
    await page.goto("/tools/archive-extractor");
    await page.locator('input[type="file"]').setInputFiles({ name: "sample.zip", mimeType: "application/zip", buffer: bytes });
    await expect(page.getByText("hello.txt")).toBeVisible();
    const link = page.getByRole("link", { name: /hello\.txt/ });
    const href = await link.getAttribute("href");
    expect(href).toMatch(/^blob:/);
    const extracted = await link.getAttribute("download");
    expect(extracted).toBe("hello.txt");
  });

  test("File Splitter produces numbered chunks with exact source coverage", async ({ page }) => {
    const source = makeBytes(2 * 1024 * 1024 + 17, 88);
    await page.goto("/tools/file-splitter");
    await page.locator('input[type="file"]').setInputFiles({ name: "large.bin", mimeType: "application/octet-stream", buffer: source });
    await page.getByLabel("Chunk size").fill("1");
    const downloadPromise = page.waitForEvent("download", { timeout: 60_000 });
    await page.getByRole("button", { name: /Split|Create/i }).click();
    const downloadPath = await downloadSize(downloadPromise, "large.bin-parts.zip");
    const zip = await JSZip.loadAsync(await readFile(downloadPath));
    const names = Object.keys(zip.files).sort();
    expect(names).toEqual(["large.bin.part-0001", "large.bin.part-0002", "large.bin.part-0003"]);
    const merged = Buffer.concat(await Promise.all(names.map((name) => zip.files[name].async("nodebuffer"))));
    expect(merged.equals(source)).toBe(true);
  });

  test("Metadata Viewer reports basic browser file metadata", async ({ page }) => {
    await page.goto("/tools/metadata-viewer");
    await page.locator('input[type="file"]').setInputFiles({ name: "report.txt", mimeType: "text/plain", buffer: Buffer.from("report") });
    await expect(page.getByText("report.txt", { exact: true })).toBeVisible();
    await expect(page.getByText("text/plain", { exact: true })).toBeVisible();
    await expect(page.getByText("6", { exact: true })).toBeVisible();
  });
});
