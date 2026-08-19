import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { createGateManifest } from "../create-gate-manifest.mjs";

test("createGateManifest binds evidence to commit and run", async () => {
  const dir = await fs.mkdtemp(path.join(os.tmpdir(), "flixo-gate-"));
  const evidencePath = path.join(dir, "gate-evidence.json");
  await fs.writeFile(evidencePath, JSON.stringify({ ok: true }));
  const commit = "a".repeat(40);
  const manifest = await createGateManifest({
    tool: "pdf-merge",
    gate: "fast",
    status: "success",
    commit,
    runId: "123",
    evidencePath,
    expectedCommit: commit,
    expectedRunId: "123",
    now: new Date("2026-08-19T00:00:00Z"),
  });
  assert.equal(manifest.integrity.valid, true);
  assert.equal(manifest.evidence.sizeBytes > 0, true);
  assert.equal(manifest.manifestId, "pdf-merge-fast-123");
});
