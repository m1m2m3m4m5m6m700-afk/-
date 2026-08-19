import { createHash } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import type { TestInfo } from "playwright/test";

export const sha256 = (value: Uint8Array | string): string =>
  createHash("sha256").update(value).digest("hex");

export const fingerprint = (value: unknown): string => sha256(JSON.stringify(value));

export const assertExactBytes = (actual: Uint8Array, expected: Uint8Array): void => {
  if (Buffer.from(actual).compare(Buffer.from(expected)) !== 0) {
    throw new Error(`Exact-byte invariant failed: expected ${expected.byteLength} bytes, received ${actual.byteLength}.`);
  }
};

export async function writeEvidence(
  testInfo: TestInfo,
  evidence: {
    toolId: string;
    inputFingerprint: string;
    expectedFingerprint: string;
    actualFingerprint: string;
  },
): Promise<void> {
  const evidenceDir = path.resolve(".artifacts", "verification-evidence");
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
        commitSha: process.env.GITHUB_SHA ?? "local",
        environment: process.env.CI ? "ci" : "local",
        timestamp: new Date().toISOString(),
      },
      null,
      2,
    ),
  );
}
