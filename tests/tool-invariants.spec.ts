import { test, expect } from "playwright/test";
import JSZip from "jszip";
import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";

function sha256(bytes: Buffer) {
  return createHash("sha256").update(bytes).digest("hex");
}

test.describe("tool invariants", () => {
  test("ZIP Creator preserves file identity through archive creation", async ({ page }) => {
    await page.goto("/tools/zip-creator");
    await expect(page.locator('[data-hydrated="true"]')).toHaveCount(1);

    const alpha = Buffer.from("alpha invariant fixture");
    const beta = Buffer.from("beta invariant fixture");
    const source = { alpha: sha256(alpha), beta: sha256(beta) };

    await page.locator('input[type="file"]').setInputFiles([
      { name: "alpha.txt", mimeType: "text/plain", buffer: alpha },
      { name: "beta.txt", mimeType: "text/plain", buffer: beta },
    ]);
    await page.getByRole("button", { name: "Create ZIP" }).click();

    const link = page.getByRole("link", { name: "Download ZIP" });
    await expect(link).toBeVisible();
    const downloadPromise = page.waitForEvent("download");
    await link.click();
    const download = await downloadPromise;
    const path = await download.path();
    expect(path).toBeTruthy();

    const zip = await JSZip.loadAsync(await readFile(path!));
    const actual = {
      alpha: sha256(await zip.files["alpha.txt"].async("nodebuffer")),
      beta: sha256(await zip.files["beta.txt"].async("nodebuffer")),
    };
    expect(actual).toEqual(source);
  });

  test("File Splitter is lossless: reconstructing chunks equals the original bytes", async ({ page }) => {
    await page.goto("/tools/file-splitter");
    await expect(page.locator('[data-hydrated="true"]')).toHaveCount(1);

    const source = Buffer.alloc(4097, 0x5a);
    await page.locator('input[type="file"]').setInputFiles({
      name: "invariant.bin",
      mimeType: "application/octet-stream",
      buffer: source,
    });
    await page.getByLabel("Chunk size").fill("2048");
    await page.getByRole("button", { name: "Split file" }).click();

    const link = page.getByRole("link", { name: "Download chunks" });
    await expect(link).toBeVisible();
    const downloadPromise = page.waitForEvent("download");
    await link.click();
    const download = await downloadPromise;
    const path = await download.path();
    expect(path).toBeTruthy();

    const zip = await JSZip.loadAsync(await readFile(path!));
    const names = Object.keys(zip.files).sort();
    expect(names).toHaveLength(3);
    const reconstructed = Buffer.concat(
      await Promise.all(names.map((name) => zip.files[name].async("nodebuffer"))),
    );
    expect(sha256(reconstructed)).toBe(sha256(source));
    expect(reconstructed.equals(source)).toBe(true);
  });

  test("Archive Extractor is lossless for a golden archive fixture", async ({ page }) => {
    await page.goto("/tools/archive-extractor");
    await expect(page.locator('[data-hydrated="true"]')).toHaveCount(1);

    const zip = new JSZip();
    const first = Buffer.from("golden-first");
    const second = Buffer.from("golden-second");
    zip.file("golden/first.txt", first);
    zip.file("golden/second.txt", second);
    const archive = await zip.generateAsync({ type: "nodebuffer" });

    await page.locator('input[type="file"]').setInputFiles({
      name: "golden.zip",
      mimeType: "application/zip",
      buffer: archive,
    });

    for (const [name, expected] of [
      ["first.txt", first],
      ["second.txt", second],
    ] as const) {
      const link = page.locator(`a[download="${name}"]`);
      await expect(link).toHaveCount(1);
      const downloadPromise = page.waitForEvent("download");
      await link.click();
      const download = await downloadPromise;
      const path = await download.path();
      expect(path).toBeTruthy();
      expect(await readFile(path!)).toEqual(expected);
    }
  });
});
