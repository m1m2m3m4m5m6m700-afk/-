import type { InternalDiagnosticEvent } from "./internalDiagnosticEvent";
import { correlateIncident } from "./failureCorrelation";
import { createConfiguredFailureMemory } from "./failureMemory";

/**
 * Best-effort persistence bridge for diagnostic events.
 *
 * The memory store is opt-in and must never make the AI request fail.
 */
export function persistInternalDiagnosticEvent(event: InternalDiagnosticEvent): void {
  const store = createConfiguredFailureMemory();
  if (!store) return;

  try {
    const previous = store.get(event.fingerprint);
    const incident = correlateIncident(event, previous);
    store.upsert({ ...incident, schemaVersion: 1 });
  } catch (error) {
    console.warn("[FLIXO_AI_DIAGNOSTIC_PERSISTENCE_SKIPPED]", error instanceof Error ? error.message : "unknown error");
  }
}
