import fs from 'node:fs/promises';
import path from 'node:path';
import { createGateManifest, writeGateManifest } from './create-gate-manifest.mjs';
import { assertGateManifestSchema } from './validate-gate-manifest-schema.mjs';

const tool = process.env.TOOL;
const gate = process.env.GATE;
const commit = process.env.GITHUB_SHA;
const runId = process.env.GITHUB_RUN_ID;
const evidencePath = process.env.EVIDENCE_PATH;
const manifestPath = process.env.MANIFEST_PATH ?? `.artifacts/${tool}/${gate}/gate-manifest.json`;

if (!tool || !gate || !commit || !runId || !evidencePath) {
  throw new Error('TOOL, GATE, GITHUB_SHA, GITHUB_RUN_ID and EVIDENCE_PATH are required.');
}

const manifest = await createGateManifest({
  tool,
  gate,
  status: process.env.GATE_STATUS ?? 'success',
  commit,
  runId,
  evidencePath,
  durationMs: Number(process.env.DURATION_MS ?? 0),
  attempt: Number(process.env.ATTEMPT ?? 1),
  repeatCount: Number(process.env.REPEAT_COUNT ?? 1),
  baselineId: process.env.BASELINE_ID || null,
  baselineCommit: process.env.BASELINE_COMMIT || null,
  baselineStatus: process.env.BASELINE_STATUS || 'none',
  expectedCommit: commit,
  expectedRunId: runId,
});

await assertGateManifestSchema(manifest, `${tool}/${gate}`);
await fs.mkdir(path.dirname(manifestPath), { recursive: true });
await writeGateManifest(manifestPath, manifest);
console.log(`Gate manifest created and schema-validated: ${manifest.manifestId}`);
