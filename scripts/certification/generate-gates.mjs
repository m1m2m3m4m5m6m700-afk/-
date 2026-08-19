import fs from "node:fs/promises";
import path from "node:path";
import { createGateManifest, writeGateManifest } from "./create-gate-manifest.mjs";

const tool = process.env.TOOL;
const gate = process.env.GATE;
const commit = process.env.GITHUB_SHA;
const runId = process.env.GITHUB_RUN_ID;
const evidencePath = process.env.EVIDENCE_PATH ?? `.artifacts/${tool}/${gate}/gate-evidence.json`;
const manifestPath = process.env.MANIFEST_PATH ?? `.artifacts/${tool}/${gate}/gate-manifest.json`;

if (!tool || !gate || !commit || !runId) throw new Error("TOOL, GATE, GITHUB_SHA and GITHUB_RUN_ID are required.");

const manifest = await createGateManifest({
  tool,
  gate,
  status: process.env.GATE_STATUS ?? "success",
  commit,
  runId,
  evidencePath,
  durationMs: Number(process.env.DURATION_MS ?? 0),
  attempt: Number(process.env.ATTEMPT ?? 1),
  repeatCount: Number(process.env.REPEAT_COUNT ?? 1),
  testsPassed: Number(process.env.TESTS_PASSED ?? 0),
  testsFailed: Number(process.env.TESTS_FAILED ?? 0),
  warnings: Number(process.env.WARNINGS ?? 0),
  baselineId: process.env.BASELINE_ID || null,
  baselineCommit: process.env.BASELINE_COMMIT || null,
  baselineStatus: process.env.BASELINE_STATUS || "none",
  expectedCommit: process.env.EXPECTED_COMMIT || commit,
  expectedRunId: process.env.EXPECTED_RUN_ID || runId,
  diagnostics: {
    failureKind: process.env.FAILURE_KIND || null,
    rootFailure: process.env.ROOT_FAILURE || null,
  },
});

await fs.mkdir(path.dirname(manifestPath), { recursive: true });
await writeGateManifest(manifestPath, manifest);
console.log(`Gate manifest created: ${manifest.manifestId}`);
