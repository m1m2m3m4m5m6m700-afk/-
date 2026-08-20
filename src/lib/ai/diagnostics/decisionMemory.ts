/**
 * Deterministic historical decision lookup over Failure Memory.
 * Advisory only: it never executes fixes or changes the current result.
 */

import type { InternalDiagnosticEvent } from "./internalDiagnosticEvent";
import type { FailureMemoryRecord, FailureMemoryStore } from "./failureMemory";
import { fingerprintEvent } from "./failureCorrelation";

export type DecisionMemoryResult =
  | {
      kind: "hit";
      fingerprint: string;
      occurrences: number;
      resolutionStatus: "fixed" | "accepted";
      resolution?: string;
      record: FailureMemoryRecord;
    }
  | {
      kind: "miss";
      fingerprint: string;
      reason: "not-found" | "not-resolved";
    };

export function lookupDecisionMemory(
  event: InternalDiagnosticEvent,
  store?: FailureMemoryStore,
): DecisionMemoryResult {
  const fingerprint = event.fingerprint || fingerprintEvent(event);
  if (!store) return { kind: "miss", fingerprint, reason: "not-found" };

  const record = store.get(fingerprint);
  if (!record) return { kind: "miss", fingerprint, reason: "not-found" };

  if (record.resolutionStatus !== "fixed" && record.resolutionStatus !== "accepted") {
    return { kind: "miss", fingerprint, reason: "not-resolved" };
  }

  return {
    kind: "hit",
    fingerprint,
    occurrences: record.occurrences,
    resolutionStatus: record.resolutionStatus,
    ...(record.previousResolution ? { resolution: record.previousResolution } : {}),
    record,
  };
}
