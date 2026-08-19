import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { createGateManifest, writeGateManifest } from "../create-gate-manifest.mjs";
import { evaluateRelease } from "../release-decision.mjs";

async function writeGate(root, gate, status, commit, runId) {
  const dir = path.join(root, gate);
  await fs.mkdir(dir, { recursive: true });
  const evidencePath = path.join(dir, "gate-evidence.json");
  await fs.writeFile(evidencePath, JSON.stringify({ gate, status }));
  const manifest = await createGateManifest({ tool: "pdf-merge", gate, status, commit, runId, evidencePath });
  await writeGateManifest(path.join(dir, "gate-manifest.json"), manifest);
}

test("evaluateRelease rejects root failures and reports skipped cascades", async () => {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), "flixo-release-"));
  const commit = "d".repeat(40);
  const runId = "789";
  await writeGate(root, "fast", "failure", commit, runId);
  const decision = await evaluateRelease("pdf-merge", {
    root,
    requiredGates: ["fast", "medium"],
    expectedCommit: commit,
    expectedRunId: runId,
  });
  assert.equal(decision.releaseStatus, "REJECTED");
  assert.deepEqual(decision.summary.rootFailures, ["fast", "medium"]);
});
