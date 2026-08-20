import assert from "node:assert/strict";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const { createInternalDiagnosticEvent } = await import("../lib/ai/diagnostics/internalDiagnosticEvent.ts");
const { JsonFailureMemoryStore } = await import("../lib/ai/diagnostics/failureMemory.ts");
const { correlateIncident, updateResolution } = await import("../lib/ai/diagnostics/failureCorrelation.ts");
const { lookupDecisionMemory } = await import("../lib/ai/diagnostics/decisionMemory.ts");

const dir = mkdtempSync(join(tmpdir(), "flixo-decision-memory-"));
const file = join(dir, "memory.json");

try {
  const store = new JsonFailureMemoryStore(file, 20);
  const event = createInternalDiagnosticEvent({
    occurredAt: "2026-08-20T20:00:00.000Z",
    taskId: "summarizer",
    layer: "provider",
    provider: "gemini",
    model: "gemini-2.5-flash-lite",
    errorKind: "timeout",
    retryable: true,
    attempt: 1,
    metadata: { toolContextEnabled: true, inputLength: 100 },
  });

  const incident = correlateIncident(event);
  store.upsert({ ...incident, schemaVersion: 1 });

  assert.deepEqual(lookupDecisionMemory(event, store), {
    kind: "miss",
    fingerprint: event.fingerprint,
    reason: "not-resolved",
  });

  store.updateResolution(event.fingerprint, "fixed", "reduce provider timeout and retry once");
  const fixed = lookupDecisionMemory(event, store);
  assert.equal(fixed.kind, "hit");
  assert.equal(fixed.resolutionStatus, "fixed");
  assert.equal(fixed.resolution, "reduce provider timeout and retry once");
  assert.equal(fixed.occurrences, 1);

  store.updateResolution(event.fingerprint, "false-positive", "noise");
  const cleared = lookupDecisionMemory(event, store);
  assert.deepEqual(cleared, {
    kind: "miss",
    fingerprint: event.fingerprint,
    reason: "not-resolved",
  });

  store.updateResolution(event.fingerprint, "accepted", "known provider incident");
  const accepted = lookupDecisionMemory(event, store);
  assert.equal(accepted.kind, "hit");
  assert.equal(accepted.resolutionStatus, "accepted");

  const withoutStore = lookupDecisionMemory(event);
  assert.deepEqual(withoutStore, {
    kind: "miss",
    fingerprint: event.fingerprint,
    reason: "not-found",
  });

  console.log("DecisionMemory contract: PASS");
} finally {
  rmSync(dir, { recursive: true, force: true });
}
