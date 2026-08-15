import { test, expect, type Download } from "@playwright/test";
import JSZip from "jszip";
import { readFile } from "node:fs/promises";

const makeBytes = (size: number, value = 65) => Buffer.alloc(size, value);

async function downloadPath(downloadPromise: Promise<Download>, expectedName: string) {
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toBe(expectedName);
  const path = await download.path();
  expect(path).toBeTruthy();
  return path!;
}

test.describe("verified desktop tools", () => {
  test("ZIP Creator creates a readable archive containing selected files", async ({ page }) => {
    await page.goto("/tools/zip-creator");
    await page.locator('input[type="file"]').setInputFiles([
      { name: "alpha.txt", mimeType: "text/plain", buffer: Buffer.from("alpha") },
      { name: "beta.txt", mimeType: "text/plain", buffer: Buffer.from("beta") },
    ]);
    const download = page.waitForEvent("download");
    await page.getByRole("button", { name: "Create ZIP" }).click();
    const path = await downloadPath(download, "flixo-files.zip");
    const zip = await JSZip.loadAsync(await readFile(path));
    expect(Object.keys(zip.files).sort()).toEqual(["alpha.txt", "beta.txt"]);
  });

  test("Archive Extractor reads ZIP entries and exposes extracted output", async ({ page }) => {
    const zip = new JSZip();
    zip.file("hello.txt", "hello from Flixo");
    const bytes = await zip.generateAsync({ type: "nodebuffer" });
    await page.goto("/tools/archive-extractor");
    await page.locator('input[type="file"]').setInputFiles({ name: "sample.zip", mimeType: "application/zip", buffer: bytes });
    await expect(page.getByText("hello.txt", { exact: true })).toBeVisible();
    const link = page.getByRole("link", { name: /hello\.txt/ });
    expect(await link.getAttribute("href")).toMatch(/^blob:/);
    expect(await link.getAttribute("download")).toBe("hello.txt");
  });

  test("File Splitter produces numbered chunks with exact source coverage", async ({ page }) => {
    const source = makeBytes(2 * 1024 * 1024 + 17, 88);
    await page.goto("/tools/file-splitter");
    await page.locator('input[type="file"]').setInputFiles({ name: "large.bin", mimeType: "application/octet-stream", buffer: source });
    await page.getByLabel("Chunk size").fill("1");
    const download = page.waitForEvent("download");
    await page.getByRole("button", { name: "Split file" }).click();
    const path = await downloadPath(download, "large.bin-parts.zip");
    const zip = await JSZip.loadAsync(await readFile(path));
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
