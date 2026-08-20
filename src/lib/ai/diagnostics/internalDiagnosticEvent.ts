/**
 * Server-only diagnostic event contract.
 *
 * This data is intentionally richer than the client-facing AIGenerateFailure,
 * but contains no secrets, prompts, raw provider payloads, or API keys.
 */

import { createHash } from "node:crypto";
import { createConfiguredFailureMemory } from "./failureMemory";
import { correlateIncident } from "./failureCorrelation";

export type InternalDiagnosticLayer = "rpc" | "aiService" | "provider" | "toolContext" | "ci";

export interface InternalDiagnosticEvent {
  version: 1;
  event: "ai_failure";
  fingerprint: string;
  occurredAt: string;
  taskId: string;
  layer: InternalDiagnosticLayer;
  provider?: string;
  model?: string;
  errorKind: string;
  retryable: boolean;
  attempt: number;
  metadata: {
    toolContextEnabled: boolean;
    inputLength: number;
  };
}

function normalize(value: string | undefined): string {
  return String(value ?? "")
    .toLowerCase()
    .replace(/[0-9a-f]{8,}/gi, "<id>")
    .replace(/\s+/g, " ")
    .trim();
}

export function createInternalDiagnosticEvent(
  input: Omit<InternalDiagnosticEvent, "version" | "event" | "fingerprint">,
): InternalDiagnosticEvent {
  const fingerprintSource = [
    input.layer,
    input.provider,
    input.model,
    input.errorKind,
    input.taskId,
    input.metadata.toolContextEnabled ? "context:on" : "context:off",
  ].map(normalize).join("|");

  return {
    version: 1,
    event: "ai_failure",
    fingerprint: createHash("sha256").update(fingerprintSource).digest("hex"),
    ...input,
  };
}

/**
 * Structured sink. Persistence is opt-in through FLIXO_FAILURE_MEMORY_PATH so
 * local/CI/test runs can use durable memory without forcing filesystem writes
 * in serverless production instances.
 */
export function emitInternalDiagnosticEvent(event: InternalDiagnosticEvent): void {
  console.warn("[FLIXO_AI_DIAGNOSTIC]", JSON.stringify(event));

  const memory = createConfiguredFailureMemory();
  if (!memory) return;

  try {
    const incident = correlateIncident(event, memory.get(event.fingerprint));
    memory.upsert({ schemaVersion: 1, ...incident });
  } catch (error) {
    // Memory must never make an AI request fail; diagnostics stay best-effort.
    console.warn(
      "[FLIXO_AI_DIAGNOSTIC_MEMORY] persistence-failed",
      error instanceof Error ? error.message : String(error),
    );
  }
}
