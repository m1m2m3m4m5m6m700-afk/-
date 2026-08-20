import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import assert from "node:assert/strict";

import { JsonFailureMemoryStore } from "../lib/ai/diagnostics/failureMemory.js";

const dir = mkdtempSync(join(tmpdir(), "flixo-failure-memory-"));
const file = join(dir, "memory.json");

try {
  const store = new JsonFailureMemoryStore(file, 2);
  const base = {
    schemaVersion: 1,
    id: "incident-a",
    rootCause: "provider-timeout",
    affectedLayer: "provider",
    aiProvider: "gemini",
    firstSeen: "2026-08-20T20:00:00.000Z",
    lastSeen: "2026-08-20T20:01:00.000Z",
    occurrences: 3,
    metadata: { taskId: "summarizer", model: "gemini-2.5-flash-lite" },
    resolutionStatus: "unknown",
  };

  store.upsert(base);
  assert.deepEqual(store.get("incident-a"), base);

  store.upsert({ ...base, occurrences: 4, lastSeen: "2026-08-20T20:02:00.000Z" });
  assert.equal(store.get("incident-a")?.occurrences, 4);

  store.updateResolution("incident-a", "fixed", "Retry policy corrected");
  assert.equal(store.get("incident-a")?.resolutionStatus, "fixed");
  assert.equal(store.get("incident-a")?.previousResolution, "Retry policy corrected");

  store.upsert({ ...base, id: "incident-b", firstSeen: "2026-08-20T20:03:00.000Z", lastSeen: "2026-08-20T20:03:00.000Z" });
  store.upsert({ ...base, id: "incident-c", firstSeen: "2026-08-20T20:04:00.000Z", lastSeen: "2026-08-20T20:04:00.000Z" });
  assert.equal(store.recent(10).length, 2);
  assert.ok(readFileSync(file, "utf8").includes('"schemaVersion": 1'));

  console.log("FAILURE MEMORY: PASS");
} finally {
  rmSync(dir, { recursive: true, force: true });
}
