import { test, expect, type Download } from "playwright/test";
import JSZip from "jszip";
import { readFile } from "node:fs/promises";

async function readDownloadedZip(downloadPromise: Promise<Download>, expectedName: string) {
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toBe(expectedName);
  const path = await download.path();
  expect(path).toBeTruthy();
  return readFile(path!);
}

test.describe("verified desktop tools", () => {
  test("ZIP Creator creates a valid archive from selected files", async ({ page }) => {
    await page.goto("/tools/zip-creator");

    const input = page.locator('input[type="file"][multiple]');
    await input.setInputFiles([
      { name: "alpha.txt", mimeType: "text/plain", buffer: Buffer.from("alpha") },
      { name: "beta.txt", mimeType: "text/plain", buffer: Buffer.from("beta") },
    ]);

    await expect(page.getByText("2 file(s) selected.")).toBeVisible();
    await page.getByRole("button", { name: "Create ZIP" }).click();
    await expect(page.getByRole("link", { name: /Download ZIP/ })).toBeVisible({ timeout: 30_000 });

    const downloadPromise = page.waitForEvent("download", { timeout: 30_000 });
    await page.getByRole("link", { name: /Download ZIP/ }).click();
    const archive = await readDownloadedZip(downloadPromise, "flixo-files.zip");

    expect(archive.length).toBeGreaterThan(0);
    const zip = await JSZip.loadAsync(archive);
    expect(Object.keys(zip.files).sort()).toEqual(["alpha.txt", "beta.txt"]);
    expect(await zip.files["alpha.txt"].async("string")).toBe("alpha");
    expect(await zip.files["beta.txt"].async("string")).toBe("beta");
  });
});
