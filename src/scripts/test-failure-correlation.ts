import assert from "node:assert/strict";
import { createInternalDiagnosticEvent } from "../lib/ai/diagnostics/internalDiagnosticEvent";
import {
  correlateIncident,
  fingerprintEvent,
  updateResolution,
} from "../lib/ai/diagnostics/failureCorrelation";

function event(errorKind: string, requestId: string) {
  return createInternalDiagnosticEvent({
    occurredAt: "2026-08-20T20:00:00.000Z",
    taskId: "summarizer",
    layer: "provider",
    provider: "gemini",
    model: "gemini-2.5-flash-lite",
    errorKind,
    retryable: true,
    attempt: 1,
    metadata: {
      toolContextEnabled: true,
      inputLength: 120,
    },
    // Deliberately unused by the fingerprint contract; this models a volatile
    // request identifier that must not fragment incident identity.
    ...(requestId ? { volatileRequestId: requestId } : {}),
  } as never);
}

const first = event("timeout", "req-aaa-1234567890");
const second = event("timeout", "req-bbb-9876543210");
const different = event("rate_limited", "req-ccc-1111111111");

assert.equal(fingerprintEvent(first), first.fingerprint);
assert.equal(fingerprintEvent(second), second.fingerprint);
assert.equal(first.fingerprint, second.fingerprint);
assert.notEqual(first.fingerprint, different.fingerprint);

const incident = correlateIncident(first);
const repeated = correlateIncident(second, incident);
assert.equal(repeated.id, incident.id);
assert.equal(repeated.occurrences, 2);
assert.equal(repeated.firstSeen, incident.firstSeen);
assert.equal(repeated.lastSeen, second.occurredAt);

const resolved = updateResolution(repeated, "fixed", "Provider timeout retry policy corrected");
assert.equal(resolved.resolutionStatus, "fixed");
assert.equal(resolved.previousResolution, "Provider timeout retry policy corrected");
assert.equal(resolved.id, repeated.id);

const reopened = correlateIncident(different, resolved);
assert.notEqual(reopened.id, resolved.id);
assert.equal(reopened.occurrences, 1);

console.log("Failure Correlation contract: PASS");
