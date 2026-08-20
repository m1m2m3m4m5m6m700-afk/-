/**
 * Deterministic correlation for internal AI diagnostic events.
 * No AI, network calls, or execution authority.
 */

import { createHash } from "node:crypto";
import type { InternalDiagnosticEvent } from "./internalDiagnosticEvent";

export type IncidentResolutionStatus =
  | "unknown"
  | "fixed"
  | "false-positive"
  | "wont-fix"
  | "accepted";

export interface IncidentFingerprint {
  id: string;
  rootCause: string;
  affectedLayer: "rpc" | "aiService" | "provider" | "toolContext" | "ci";
  aiProvider?: string;
  firstSeen: string;
  lastSeen: string;
  occurrences: number;
  metadata: {
    taskId?: string;
    model?: string;
    attempt?: number;
    toolContextEnabled?: boolean;
  };
  previousResolution?: string;
  resolutionStatus: IncidentResolutionStatus;
}

function normalize(value: unknown): string {
  return String(value ?? "")
    .trim()
    .toLowerCase()
    .replace(/[\r\n\t]+/g, " ")
    .replace(/\s+/g, " ")
    .replace(/\b(?:request|trace|correlation|incident)[-_ ]?id[:= ]+[a-z0-9-]+\b/gi, "")
    .replace(/\b\d{10,}\b/g, "#")
    .trim();
}

/**
 * The InternalDiagnosticEvent fingerprint is the canonical ID.
 * Keep this fallback only for compatibility with legacy events that predate
 * the fingerprint field.
 */
export function fingerprintEvent(event: InternalDiagnosticEvent): string {
  if (event.fingerprint) return event.fingerprint;

  const stable = [
    normalize(event.layer),
    normalize(event.provider),
    normalize(event.model),
    normalize(event.taskId),
    normalize(event.errorKind),
    normalize(event.metadata?.toolContextEnabled),
  ].join("|");
  return createHash("sha256").update(stable).digest("hex");
}

export function correlateIncident(
  event: InternalDiagnosticEvent,
  previous?: IncidentFingerprint,
): IncidentFingerprint {
  const now = event.occurredAt;
  const id = fingerprintEvent(event);

  if (!previous || previous.id !== id) {
    return {
      id,
      rootCause: normalize(event.errorKind),
      affectedLayer: event.layer,
      ...(event.provider ? { aiProvider: event.provider } : {}),
      firstSeen: now,
      lastSeen: now,
      occurrences: 1,
      metadata: {
        ...(event.taskId ? { taskId: event.taskId } : {}),
        ...(event.model ? { model: event.model } : {}),
        ...(event.attempt ? { attempt: event.attempt } : {}),
        ...(event.metadata?.toolContextEnabled !== undefined
          ? { toolContextEnabled: event.metadata.toolContextEnabled }
          : {}),
      },
      resolutionStatus: "unknown",
    };
  }

  return {
    ...previous,
    lastSeen: now,
    occurrences: previous.occurrences + 1,
  };
}

export function updateResolution(
  incident: IncidentFingerprint,
  status: IncidentResolutionStatus,
  resolution?: string,
): IncidentFingerprint {
  return {
    ...incident,
    resolutionStatus: status,
    ...(resolution ? { previousResolution: resolution } : {}),
  };
}
