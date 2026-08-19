import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { createGateManifest, writeGateManifest } from "../create-gate-manifest.mjs";
import { readAndVerifyGateManifest } from "../verify-gate-manifest.mjs";

test("verifyGateManifest rejects stale evidence bound to another commit", async () => {
  const dir = await fs.mkdtemp(path.join(os.tmpdir(), "flixo-manifest-"));
  const evidencePath = path.join(dir, "gate-evidence.json");
  const manifestPath = path.join(dir, "gate-manifest.json");
  await fs.writeFile(evidencePath, "evidence-v1\n");
  const manifest = await createGateManifest({
    tool: "pdf-merge",
    gate: "browser",
    status: "success",
    commit: "b".repeat(40),
    runId: "456",
    evidencePath,
  });
  await writeGateManifest(manifestPath, manifest);
  const result = await readAndVerifyGateManifest(manifestPath, {
    evidencePath,
    expectedCommit: "c".repeat(40),
    expectedRunId: "456",
  });
  assert.equal(result.valid, false);
  assert.equal(result.integrity.commitMatch, false);
  assert.ok(result.errors.includes("commit mismatch"));
});
