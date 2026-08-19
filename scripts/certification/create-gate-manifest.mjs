import crypto from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";

const SHA256 = /^[a-f0-9]{64}$/;
const COMMIT = /^[a-f0-9]{40}$/;

export async function computeSha256(filePath) {
  const buffer = await fs.readFile(filePath);
  return crypto.createHash("sha256").update(buffer).digest("hex");
}

export async function createGateManifest({
  tool,
  gate,
  status,
  commit,
  runId,
  evidencePath,
  durationMs = 0,
  attempt = 1,
  repeatCount = 1,
  testsPassed = 0,
  testsFailed = 0,
  warnings = 0,
  baselineId = null,
  baselineCommit = null,
  baselineStatus = "none",
  expectedCommit = commit,
  expectedRunId = String(runId),
  expiresHours = 24,
  diagnostics = {},
  now = new Date(),
}) {
  if (!COMMIT.test(commit)) throw new Error(`Invalid commit SHA: ${commit}`);
  if (!/^\d+$/.test(String(runId))) throw new Error(`Invalid runId: ${runId}`);
  const evidenceBuffer = await fs.readFile(evidencePath);
  const stats = await fs.stat(evidencePath);
  const evidenceSha256 = crypto.createHash("sha256").update(evidenceBuffer).digest("hex");
  const createdAt = now.toISOString();
  const expiresAt = new Date(now.getTime() + expiresHours * 60 * 60 * 1000).toISOString();
  const hashMatch = SHA256.test(evidenceSha256);
  const commitMatch = !expectedCommit || expectedCommit === commit;
  const runMatch = !expectedRunId || String(expectedRunId) === String(runId);
  const notExpired = new Date(expiresAt).getTime() > now.getTime();

  const manifest = {
    schemaVersion: 1,
    manifestId: `${tool}-${gate}-${runId}`,
    tool,
    gate,
    status,
    commit,
    runId: String(runId),
    createdAt,
    expiresAt,
    evidence: {
      file: path.basename(evidencePath),
      sha256: evidenceSha256,
      sizeBytes: stats.size,
    },
    execution: {
      durationMs: Math.max(0, Number(durationMs) || 0),
      attempt: Math.max(1, Number(attempt) || 1),
      repeatCount: Math.max(1, Number(repeatCount) || 1),
    },
    quality: {
      testsPassed: Math.max(0, Number(testsPassed) || 0),
      testsFailed: Math.max(0, Number(testsFailed) || 0),
      warnings: Math.max(0, Number(warnings) || 0),
    },
    baseline: {
      baselineId: baselineId || null,
      baselineCommit: baselineCommit || null,
      baselineStatus,
    },
    integrity: {
      commitMatch,
      runMatch,
      hashMatch,
      notExpired,
      valid: commitMatch && runMatch && hashMatch && notExpired,
    },
    diagnostics,
  };

  if (!manifest.integrity.valid) throw new Error("Gate manifest integrity validation failed.");
  return manifest;
}

export async function writeGateManifest(manifestPath, manifest) {
  await fs.mkdir(path.dirname(manifestPath), { recursive: true });
  await fs.writeFile(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`, "utf8");
  return manifestPath;
}
