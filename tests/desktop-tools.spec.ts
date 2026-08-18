import { test, expect, type Download, type Page } from "playwright/test";
import JSZip from "jszip";
import { readFile } from "node:fs/promises";

const makeBytes = (size: number, value = 65) => Buffer.alloc(size, value);

async function waitForToolHydration(page: Page) {
  await expect(page.locator('[data-hydrated="true"]')).toHaveCount(1, { timeout: 30_000 });
}

async function downloadSize(downloadPromise: Promise<Download>, downloadName?: string) {
  const download = await downloadPromise;
  if (downloadName) expect(download.suggestedFilename()).toBe(downloadName);
  const path = await download.path();
  expect(path).toBeTruthy();
  return path!;
}

async function downloadToolLink(
  page: Page,
  locator: ReturnType<Page["getByRole"]>,
  expectedName: string,
) {
  const downloadPromise = page.waitForEvent("download", { timeout: 60_000 });
  await locator.click();
  return downloadSize(downloadPromise, expectedName);
}

test.describe("verified desktop tools", () => {
  test("ZIP Creator returns the exact expected archive and rejects empty input", async ({ page }) => {
    await page.goto("/tools/zip-creator");
    await waitForToolHydration(page);

    const createButton = page.getByRole("button", { name: "Create ZIP" });
    await expect(createButton).toBeDisabled();
    await expect(page.getByText("Download ZIP")).toHaveCount(0);

    const input = page.locator('input[type="file"]');
    await input.setInputFiles([
      { name: "alpha.txt", mimeType: "text/plain", buffer: Buffer.from("alpha") },
      { name: "beta.txt", mimeType: "text/plain", buffer: Buffer.from("beta") },
    ]);
    await expect(createButton).toBeEnabled();
    await createButton.click();

    const downloadLink = page.getByRole("link", { name: "Download ZIP" });
    await expect(downloadLink).toBeVisible();
    await expect(downloadLink).toHaveAttribute("download", "flixo-files.zip");
    const href = await downloadLink.getAttribute("href");
    expect(href).toMatch(/^blob:/);

    const downloadPath = await downloadToolLink(page, downloadLink, "flixo-files.zip");
    const archive = await readFile(downloadPath);
    expect(archive.length).toBeGreaterThan(0);

    const zip = await JSZip.loadAsync(archive);
    expect(Object.keys(zip.files).sort()).toEqual(["alpha.txt", "beta.txt"]);
    expect(await zip.files["alpha.txt"].async("string")).toBe("alpha");
    expect(await zip.files["beta.txt"].async("string")).toBe("beta");

    await createButton.click();
    const secondDownloadLink = page.getByRole("link", { name: "Download ZIP" });
    await expect(secondDownloadLink).toBeVisible();
    const secondDownloadPath = await downloadToolLink(page, secondDownloadLink, "flixo-files.zip");
    const secondZip = await JSZip.loadAsync(await readFile(secondDownloadPath));
    expect(Object.keys(secondZip.files).sort()).toEqual(["alpha.txt", "beta.txt"]);
    expect(await secondZip.files["alpha.txt"].async("string")).toBe("alpha");
    expect(await secondZip.files["beta.txt"].async("string")).toBe("beta");
  });

  test("Archive Extractor returns the exact extracted bytes and rejects invalid archives", async ({ page }) => {
    await page.goto("/tools/archive-extractor");
    await waitForToolHydration(page);
    const input = page.locator('input[type="file"]');

    await input.setInputFiles({
      name: "invalid.zip",
      mimeType: "application/zip",
      buffer: Buffer.from("not a zip archive"),
    });
    await expect(page.getByText("The selected file is not a valid ZIP archive.", { exact: true })).toBeVisible();
    await expect(page.locator("a[download]")).toHaveCount(0);

    const zip = new JSZip();
    zip.file("hello.txt", "hello from Flixo");
    zip.file("nested/world.txt", "exact nested bytes");
    const bytes = await zip.generateAsync({ type: "nodebuffer" });

    await input.setInputFiles({ name: "sample.zip", mimeType: "application/zip", buffer: bytes });
    await expect(page.getByText("hello.txt")).toBeVisible();
    await expect(page.getByText("nested/world.txt")).toBeVisible();

    for (const [name, expected] of [
      ["hello.txt", "hello from Flixo"],
      ["nested/world.txt", "exact nested bytes"],
    ] as const) {
      const link = page.locator(`a[download="${name.split("/").pop()!}"]`).filter({ hasText: name });
      await expect(link).toHaveCount(1);
      const href = await link.getAttribute("href");
      expect(href).toMatch(/^blob:/);
      const downloadPath = await downloadToolLink(page, link, name.split("/").pop()!);
      expect(await readFile(downloadPath, "utf8")).toBe(expected);
    }
  });

  test("File Splitter preserves the exact source bytes and handles a one-byte edge case", async ({ page }) => {
    const source = makeBytes(2 * 1024 * 1024 + 17, 88);
    await page.goto("/tools/file-splitter");
    await waitForToolHydration(page);
    await page.locator('input[type="file"]').setInputFiles({ name: "large.bin", mimeType: "application/octet-stream", buffer: source });
    await page.getByLabel("Chunk size").fill("1");
    await page.getByRole("button", { name: "Split file" }).click();

    const downloadLink = page.getByRole("link", { name: "Download chunks" });
    await expect(downloadLink).toBeVisible();
    await expect(downloadLink).toHaveAttribute("download", "large.bin-parts.zip");
    const href = await downloadLink.getAttribute("href");
    expect(href).toMatch(/^blob:/);

    const downloadPath = await downloadToolLink(page, downloadLink, "large.bin-parts.zip");
    const zip = await JSZip.loadAsync(await readFile(downloadPath));
    const names = Object.keys(zip.files).sort();
    expect(names).toEqual(["large.bin.part-0001", "large.bin.part-0002", "large.bin.part-0003"]);
    const merged = Buffer.concat(await Promise.all(names.map((name) => zip.files[name].async("nodebuffer"))));
    expect(merged.equals(source)).toBe(true);

    await page.reload();
    await waitForToolHydration(page);
    const oneByte = Buffer.from([0xab]);
    await page.locator('input[type="file"]').setInputFiles({ name: "one.bin", mimeType: "application/octet-stream", buffer: oneByte });
    await page.getByLabel("Chunk size").fill("1");
    await page.getByRole("button", { name: "Split file" }).click();

    const oneByteDownloadLink = page.getByRole("link", { name: "Download chunks" });
    await expect(oneByteDownloadLink).toBeVisible();
    const oneByteHref = await oneByteDownloadLink.getAttribute("href");
    expect(oneByteHref).toMatch(/^blob:/);
    const oneBytePath = await downloadToolLink(page, oneByteDownloadLink, "one.bin-parts.zip");
    const oneByteZip = await JSZip.loadAsync(await readFile(oneBytePath));
    expect(Object.keys(oneByteZip.files)).toEqual(["one.bin.part-0001"]);
    expect(Buffer.from(await oneByteZip.files["one.bin.part-0001"].async("nodebuffer")).equals(oneByte)).toBe(true);
  });

  test("Metadata Viewer reports exact metadata and exposes no fabricated values", async ({ page }) => {
    await page.goto("/tools/metadata-viewer");
    await waitForToolHydration(page);
    const input = page.locator('input[type="file"]');
    await input.setInputFiles({ name: "report.txt", mimeType: "text/plain", buffer: Buffer.from("report") });

    await expect(page.getByText("report.txt", { exact: true })).toBeVisible();
    await expect(page.getByText("text/plain", { exact: true })).toBeVisible();
    await expect(page.getByText("6", { exact: true })).toBeVisible();

    const metadataText = await page.locator("body").innerText();
    expect(metadataText).toContain("report.txt");
    expect(metadataText).toContain("text/plain");
    expect(metadataText).toContain("6");
    expect(metadataText).not.toContain("undefined");
    expect(metadataText).not.toContain("NaN");
    expect(metadataText).not.toContain("Unknown");
  });
});
