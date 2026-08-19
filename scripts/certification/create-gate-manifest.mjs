import crypto from 'node:crypto';
import fs from 'node:fs/promises';
import path from 'node:path';

const COMMIT = /^[a-f0-9]{40}$/;

export async function computeSha256(filePath) {
  return crypto.createHash('sha256').update(await fs.readFile(filePath)).digest('hex');
}

export async function createGateManifest({ tool, gate, status, commit, runId, evidencePath, durationMs = 0, attempt = 1, repeatCount = 1, baselineId = null, baselineCommit = null, baselineStatus = 'none', expectedCommit = commit, expectedRunId = String(runId), expiresHours = 24, diagnostics = {}, now = new Date() }) {
  if (!COMMIT.test(commit)) throw new Error(`Invalid commit SHA: ${commit}`);
  if (!/^\d+$/.test(String(runId))) throw new Error(`Invalid runId: ${runId}`);
  const evidence = await fs.readFile(evidencePath);
  const stats = await fs.stat(evidencePath);
  const sha256 = crypto.createHash('sha256').update(evidence).digest('hex');
  const createdAt = now.toISOString();
  const expiresAt = new Date(now.getTime() + expiresHours * 3600_000).toISOString();
  const integrity = { commitMatch: !expectedCommit || expectedCommit === commit, runMatch: !expectedRunId || String(expectedRunId) === String(runId), hashMatch: /^[a-f0-9]{64}$/.test(sha256), notExpired: new Date(expiresAt).getTime() > now.getTime() };
  integrity.valid = Object.values(integrity).every(Boolean);
  if (!integrity.valid) throw new Error('Gate manifest integrity validation failed.');
  return {
    schemaVersion: 1,
    manifestId: `${tool}-${gate}-${runId}`,
    tool,
    gate,
    status,
    commit,
    runId: String(runId),
    createdAt,
    expiresAt,
    evidence: { file: path.basename(evidencePath), sha256, sizeBytes: stats.size },
    execution: { durationMs: Math.max(0, Number(durationMs) || 0), attempt: Math.max(1, Number(attempt) || 1), repeatCount: Math.max(1, Number(repeatCount) || 1) },
    quality: { testsPassed: 0, testsFailed: 0, warnings: 0 },
    baseline: { baselineId, baselineCommit, baselineStatus },
    integrity,
    diagnostics,
  };
}

export async function writeGateManifest(manifestPath, manifest) {
  await fs.mkdir(path.dirname(manifestPath), { recursive: true });
  await fs.writeFile(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`, 'utf8');
}
