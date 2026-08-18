import { test, expect, type Download, type Page, type TestInfo } from "playwright/test";
import JSZip from "jszip";
import { createHash } from "node:crypto";
import { readFile, writeFile } from "node:fs/promises";

const makeBytes = (size: number, value = 65) => Buffer.alloc(size, value);

function fingerprint(value: unknown) {
  return createHash("sha256").update(JSON.stringify(value)).digest("hex");
}

async function writeEvidence(testInfo: TestInfo, evidence: {
  toolId: string;
  inputFingerprint: string;
  expectedFingerprint: string;
  actualFingerprint: string;
}) {
  await writeFile(
    testInfo.outputPath("verification-evidence.json"),
    JSON.stringify(
      {
        schemaVersion: 1,
        toolId: evidence.toolId,
        testName: testInfo.title,
        status: evidence.expectedFingerprint === evidence.actualFingerprint ? "passed" : "failed",
        inputFingerprint: evidence.inputFingerprint,
        expectedFingerprint: evidence.expectedFingerprint,
        actualFingerprint: evidence.actualFingerprint,
        timestamp: new Date().toISOString(),
      },
      null,
      2,
    ),
  );
}

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
  test("ZIP Creator returns the exact expected archive and rejects empty input", async ({ page }, testInfo) => {
    await page.goto("/tools/zip-creator");
    await waitForToolHydration(page);

    const createButton = page.getByRole("button", { name: "Create ZIP" });
    await expect(createButton).toBeDisabled();
    await expect(page.getByText("Download ZIP")).toHaveCount(0);

    const alpha = Buffer.from("alpha");
    const beta = Buffer.from("beta");
    const inputFingerprint = fingerprint({ "alpha.txt": alpha.toString("base64"), "beta.txt": beta.toString("base64") });
    const input = page.locator('input[type="file"]');
    await input.setInputFiles([
      { name: "alpha.txt", mimeType: "text/plain", buffer: alpha },
      { name: "beta.txt", mimeType: "text/plain", buffer: beta },
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
    const actualManifest = {
      "alpha.txt": (await zip.files["alpha.txt"].async("nodebuffer")).toString("base64"),
      "beta.txt": (await zip.files["beta.txt"].async("nodebuffer")).toString("base64"),
    };
    const expectedManifest = { "alpha.txt": alpha.toString("base64"), "beta.txt": beta.toString("base64") };
    expect(Object.keys(zip.files).sort()).toEqual(["alpha.txt", "beta.txt"]);
    expect(actualManifest).toEqual(expectedManifest);
    await writeEvidence(testInfo, {
      toolId: "zip-creator",
      inputFingerprint,
      expectedFingerprint: fingerprint(expectedManifest),
      actualFingerprint: fingerprint(actualManifest),
    });

    await createButton.click();
    const secondDownloadLink = page.getByRole("link", { name: "Download ZIP" });
    await expect(secondDownloadLink).toBeVisible();
    const secondDownloadPath = await downloadToolLink(page, secondDownloadLink, "flixo-files.zip");
    const secondZip = await JSZip.loadAsync(await readFile(secondDownloadPath));
    expect(Object.keys(secondZip.files).sort()).toEqual(["alpha.txt", "beta.txt"]);
    expect(await secondZip.files["alpha.txt"].async("string")).toBe("alpha");
    expect(await secondZip.files["beta.txt"].async("string")).toBe("beta");
  });

  test("Archive Extractor returns the exact extracted bytes and rejects invalid archives", async ({ page }, testInfo) => {
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
    const hello = Buffer.from("hello from Flixo");
    const nested = Buffer.from("exact nested bytes");
    zip.file("hello.txt", hello);
    zip.file("nested/world.txt", nested);
    const bytes = await zip.generateAsync({ type: "nodebuffer" });
    const inputFingerprint = fingerprint(bytes.toString("base64"));

    await input.setInputFiles({ name: "sample.zip", mimeType: "application/zip", buffer: bytes });
    await expect(page.getByText("hello.txt")).toBeVisible();
    await expect(page.getByText("nested/world.txt")).toBeVisible();

    const actualManifest: Record<string, string> = {};
    for (const [name] of [["hello.txt"], ["nested/world.txt"]] as const) {
      const filename = name.split("/").pop()!;
      const link = page.locator(`a[download="${filename}"]`).filter({ hasText: name });
      await expect(link).toHaveCount(1);
      const downloadPath = await downloadToolLink(page, link, filename);
      actualManifest[name] = (await readFile(downloadPath)).toString("base64");
    }
    const expectedManifest = {
      "hello.txt": hello.toString("base64"),
      "nested/world.txt": nested.toString("base64"),
    };
    expect(actualManifest).toEqual(expectedManifest);
    await writeEvidence(testInfo, {
      toolId: "archive-extractor",
      inputFingerprint,
      expectedFingerprint: fingerprint(expectedManifest),
      actualFingerprint: fingerprint(actualManifest),
    });
  });

  test("File Splitter preserves the exact source bytes and handles a one-byte edge case", async ({ page }, testInfo) => {
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
    const expectedFingerprint = fingerprint({ sourceSha256: createHash("sha256").update(source).digest("hex"), chunkCount: 3 });
    const actualFingerprint = fingerprint({ sourceSha256: createHash("sha256").update(merged).digest("hex"), chunkCount: names.length });
    expect(actualFingerprint).toBe(expectedFingerprint);
    await writeEvidence(testInfo, {
      toolId: "file-splitter",
      inputFingerprint: createHash("sha256").update(source).digest("hex"),
      expectedFingerprint,
      actualFingerprint,
    });

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
    const actualOneByte = Buffer.from(await oneByteZip.files["one.bin.part-0001"].async("nodebuffer"));
    expect(actualOneByte.equals(oneByte)).toBe(true);
    const oneByteExpectedFingerprint = fingerprint({ fileSha256: createHash("sha256").update(oneByte).digest("hex"), chunkCount: 1 });
    const oneByteActualFingerprint = fingerprint({ fileSha256: createHash("sha256").update(actualOneByte).digest("hex"), chunkCount: Object.keys(oneByteZip.files).length });
    expect(oneByteActualFingerprint).toBe(oneByteExpectedFingerprint);
    expect(oneByteActualFingerprint).toBe(actualOneByte.length === 1 ? fingerprint({ fileSha256: createHash("sha256").update(oneByte).digest("hex"), chunkCount: 1 }) : "");
  });

  test("Metadata Viewer reports exact metadata from the rendered UI and exposes no fabricated values", async ({ page }, testInfo) => {
    await page.goto("/tools/metadata-viewer");
    await waitForToolHydration(page);
    const input = page.locator('input[type="file"]');
    const source = Buffer.from("report");
    await input.setInputFiles({ name: "report.txt", mimeType: "text/plain", buffer: source });

    await expect(page.getByText("report.txt", { exact: true })).toBeVisible();
    await expect(page.getByText("text/plain", { exact: true })).toBeVisible();
    await expect(page.getByText("6", { exact: true })).toBeVisible();

    const cardFor = async (key: string) => page.locator("dl > div").filter({ has: page.locator(`dt:has-text("${key}")`) }).locator("dd").innerText();
    const actual = {
      name: await cardFor("name"),
      type: await cardFor("type"),
      size: Number((await cardFor("size")).replaceAll(",", "")),
    };
    const expected = { name: "report.txt", type: "text/plain", size: source.byteLength };
    expect(actual).toEqual(expected);

    const metadataText = await page.locator("body").innerText();
    expect(metadataText).not.toContain("undefined");
    expect(metadataText).not.toContain("NaN");
    expect(metadataText).not.toContain("Unknown");
    await writeEvidence(testInfo, {
      toolId: "metadata-viewer",
      inputFingerprint: createHash("sha256").update(source).digest("hex"),
      expectedFingerprint: fingerprint(expected),
      actualFingerprint: fingerprint(actual),
    });
  });
});
