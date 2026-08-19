import { test, expect, type Download, type Page } from "playwright/test";
import JSZip from "jszip";
import { readFile } from "node:fs/promises";

async function waitForHydration(page: Page) {
  await expect(page.locator('[data-hydrated="true"]')).toHaveCount(1, { timeout: 30_000 });
}

async function downloadPath(page: Page, expectedName: string) {
  const downloadPromise = page.waitForEvent("download", { timeout: 60_000 });
  await page.getByRole("link", { name: "Download chunks" }).click();
  const download: Download = await downloadPromise;
  expect(download.suggestedFilename()).toBe(expectedName);
  const path = await download.path();
  expect(path).toBeTruthy();
  return path!;
}

test.describe("File Splitter contract", () => {
  test("rejects invalid chunk sizes without producing a download", async ({ page }) => {
    await page.goto("/tools/file-splitter");
    await waitForHydration(page);

    const source = Buffer.from("file-splitter-invalid-input");
    await page.locator('input[type="file"]').setInputFiles({ name: "sample.bin", mimeType: "application/octet-stream", buffer: source });

    await page.getByLabel("Chunk size").fill("0");
    await page.getByRole("button", { name: "Split file" }).click();

    await expect(page.getByText("Chunk size must be between 1 and 500 MB.", { exact: true })).toBeVisible();
    await expect(page.getByRole("link", { name: "Download chunks" })).toHaveCount(0);
  });

  test("returns one exact chunk when chunk size exceeds file size", async ({ page }) => {
    await page.goto("/tools/file-splitter");
    await waitForHydration(page);

    const source = Buffer.from("smaller-than-one-chunk");
    await page.locator('input[type="file"]').setInputFiles({ name: "small.bin", mimeType: "application/octet-stream", buffer: source });
    await page.getByLabel("Chunk size").fill("10");
    await page.getByRole("button", { name: "Split file" }).click();

    await expect(page.getByText("Created 1 chunk(s).", { exact: true })).toBeVisible();
    const path = await downloadPath(page, "small.bin-parts.zip");
    const zip = await JSZip.loadAsync(await readFile(path));
    const files = Object.keys(zip.files).filter((name) => !zip.files[name].dir);
    expect(files).toEqual(["small.bin.part-0001"]);
    expect(Buffer.from(await zip.files[files[0]].async("nodebuffer"))).toEqual(source);
  });

  test("preserves exact bytes for a non-divisible chunk size", async ({ page }) => {
    await page.goto("/tools/file-splitter");
    await waitForHydration(page);

    const source = Buffer.from(Array.from({ length: 7 }, (_, index) => index + 1));
    await page.locator('input[type="file"]').setInputFiles({ name: "seven.bin", mimeType: "application/octet-stream", buffer: source });
    await page.getByLabel("Chunk size").fill("0.000005");
    await page.getByRole("button", { name: "Split file" }).click();

    await expect(page.getByText("Created 2 chunk(s).", { exact: true })).toBeVisible();
    const path = await downloadPath(page, "seven.bin-parts.zip");
    const zip = await JSZip.loadAsync(await readFile(path));
    const files = Object.keys(zip.files).filter((name) => !zip.files[name].dir).sort();
    expect(files).toEqual(["seven.bin.part-0001", "seven.bin.part-0002"]);

    const merged = Buffer.concat(await Promise.all(files.map((name) => zip.files[name].async("nodebuffer"))));
    expect(merged).toEqual(source);
  });
});
