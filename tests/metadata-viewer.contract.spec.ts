import { test, expect, type Page, type TestInfo } from "playwright/test";
import { createHash } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

function fingerprint(value: unknown) {
  return createHash("sha256").update(JSON.stringify(value)).digest("hex");
}

async function writeEvidence(testInfo: TestInfo, evidence: {
  toolId: string;
  inputFingerprint: string;
  expectedFingerprint: string;
  actualFingerprint: string;
}) {
  const evidenceDir = path.resolve("test-results", "evidence");
  await mkdir(evidenceDir, { recursive: true });
  await writeFile(
    path.join(evidenceDir, `${evidence.toolId}.json`),
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

test.describe("Metadata Viewer contract", () => {
  test("reports exact browser-provided metadata without fabricated values", async ({ page }, testInfo) => {
    await page.goto("/tools/metadata-viewer");
    await waitForToolHydration(page);

    const input = page.locator('input[type="file"]');
    await expect(page.locator("dl")).toHaveCount(0);

    const source = Buffer.from("report");
    await input.setInputFiles({
      name: "REPORT.TXT",
      mimeType: "text/plain",
      buffer: source,
    });

    const cardFor = async (key: string) =>
      page.locator("dl > div").filter({ has: page.locator(`dt:has-text("${key}")`) }).locator("dd").innerText();

    const actual = {
      name: await cardFor("name"),
      type: await cardFor("type"),
      size: Number((await cardFor("size")).replaceAll(",", "")),
      extension: await cardFor("extension"),
      modified: await cardFor("modified"),
    };

    const expectedShape = {
      name: "REPORT.TXT",
      type: "text/plain",
      size: source.byteLength,
      extension: ".txt",
    };

    expect(actual.name).toBe(expectedShape.name);
    expect(actual.type).toBe(expectedShape.type);
    expect(actual.size).toBe(expectedShape.size);
    expect(actual.extension).toBe(expectedShape.extension);
    expect(Number.isNaN(Date.parse(actual.modified))).toBe(false);

    const metadataText = await page.locator("body").innerText();
    expect(metadataText).not.toContain("undefined");
    expect(metadataText).not.toContain("NaN");
    expect(metadataText).not.toContain("Unknown");

    const expected = {
      ...expectedShape,
      modifiedIsValidDate: true,
    };
    const actualFingerprint = fingerprint({
      ...actual,
      modifiedIsValidDate: Number.isNaN(Date.parse(actual.modified)) === false,
    });
    await writeEvidence(testInfo, {
      toolId: "metadata-viewer",
      inputFingerprint: createHash("sha256").update(source).digest("hex"),
      expectedFingerprint: fingerprint(expected),
      actualFingerprint,
    });

    expect(actualFingerprint).toBe(fingerprint(expected));
  });
});
