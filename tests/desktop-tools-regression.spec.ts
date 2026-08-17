import { test, expect, type Download } from "playwright/test";
import JSZip from "jszip";
import { readFile } from "node:fs/promises";

async function downloadSize(downloadPromise: Promise<Download>, expectedName: string) {
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toBe(expectedName);
  const path = await download.path();
  expect(path).toBeTruthy();
  return path!;
}

test.describe("desktop/file tool regressions", () => {
  test("ZIP Creator creates and downloads a readable archive", async ({ page }) => {
    await page.goto("/tools/zip-creator");
    await page.locator('input[type="file"]').setInputFiles([
      { name: "alpha.txt", mimeType: "text/plain", buffer: Buffer.from("alpha") },
      { name: "beta.txt", mimeType: "text/plain", buffer: Buffer.from("beta") },
    ]);
    await expect(page.getByText("2 file(s) selected.")).toBeVisible();
    await page.getByRole("button", { name: "Create ZIP" }).click();
    const downloadLink = page.getByRole("link", { name: /Download ZIP/ });
    await expect(downloadLink).toBeVisible({ timeout: 60_000 });
    const downloadPromise = page.waitForEvent("download", { timeout: 60_000 });
    await downloadLink.click();
    const archive = await readFile(await downloadSize(downloadPromise, "flixo-files.zip"));
    expect(archive.length).toBeGreaterThan(0);
    const zip = await JSZip.loadAsync(archive);
    expect(Object.keys(zip.files).sort()).toEqual(["alpha.txt", "beta.txt"]);
    expect(await zip.files["alpha.txt"].async("string")).toBe("alpha");
    expect(await zip.files["beta.txt"].async("string")).toBe("beta");
  });

  test("Archive Extractor exposes extracted entries", async ({ page }) => {
    const zip = new JSZip();
    zip.file("hello.txt", "hello from Flixo");
    const bytes = await zip.generateAsync({ type: "nodebuffer" });
    await page.goto("/tools/archive-extractor");
    await page.locator('input[type="file"]').setInputFiles({ name: "sample.zip", mimeType: "application/zip", buffer: bytes });
    const link = page.getByRole("link", { name: /hello\.txt/ });
    await expect(link).toBeVisible();
    expect(await link.getAttribute("href")).toMatch(/^blob:/);
    expect(await link.getAttribute("download")).toBe("hello.txt");
  });

  test("File Splitter preserves exact source bytes", async ({ page }) => {
    const source = Buffer.alloc(2 * 1024 * 1024 + 17, 88);
    await page.goto("/tools/file-splitter");
    await page.locator('input[type="file"]').setInputFiles({ name: "large.bin", mimeType: "application/octet-stream", buffer: source });
    await page.getByLabel("Chunk size").fill("1");
    const downloadPromise = page.waitForEvent("download", { timeout: 60_000 });
    await page.getByRole("button", { name: /Split|Create/i }).click();
    const zip = await JSZip.loadAsync(await readFile(await downloadSize(downloadPromise, "large.bin-parts.zip")));
    const names = Object.keys(zip.files).sort();
    expect(names).toEqual(["large.bin.part-0001", "large.bin.part-0002", "large.bin.part-0003"]);
    const merged = Buffer.concat(await Promise.all(names.map((name) => zip.files[name].async("nodebuffer"))));
    expect(merged.equals(source)).toBe(true);
  });

  test("Metadata Viewer reports file metadata", async ({ page }) => {
    await page.goto("/tools/metadata-viewer");
    await page.locator('input[type="file"]').setInputFiles({ name: "report.txt", mimeType: "text/plain", buffer: Buffer.from("report") });
    await expect(page.getByText("report.txt", { exact: true })).toBeVisible();
    await expect(page.getByText("text/plain", { exact: true })).toBeVisible();
    await expect(page.getByText("6", { exact: true })).toBeVisible();
  });
});
