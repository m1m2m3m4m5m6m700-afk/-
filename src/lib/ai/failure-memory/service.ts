import type { AITaskId, AIErrorKind } from "../types";
import { buildFailureSignature } from "./signature";
import { InMemoryFailureMemoryStore } from "./store";
import type {
  DecisionMemoryResult,
  FailureMemoryEntry,
  FailureMemoryInput,
  FailureMemoryStore,
  FailureOutcome,
} from "./types";

export interface FailureRecordOptions extends FailureMemoryInput {
  diagnosis?: string;
  recommendation?: string;
}

export interface ResolutionOptions {
  diagnosis?: string;
  recommendation?: string;
  successful: boolean;
}

function confidence(entry: FailureMemoryEntry): number {
  const total = entry.successfulResolutionCount + entry.failedResolutionCount;
  if (entry.outcome === "unresolved" || total === 0) return 0;
  return Math.round((entry.successfulResolutionCount / total) * 100) / 100;
}

export class FailureMemory {
  constructor(private readonly store: FailureMemoryStore = new InMemoryFailureMemoryStore()) {}

  recordFailure(options: FailureRecordOptions): FailureMemoryEntry {
    const signature = buildFailureSignature(options);
    const previous = this.store.get(signature);
    const now = new Date().toISOString();

    const entry: FailureMemoryEntry = {
      taskId: options.taskId,
      kind: options.kind,
      retryable: options.retryable,
      diagnosticCode: options.diagnosticCode,
      signature,
      firstSeenAt: previous?.firstSeenAt ?? now,
      lastSeenAt: now,
      occurrences: (previous?.occurrences ?? 0) + 1,
      outcome: previous?.outcome ?? "unresolved",
      successfulResolutionCount: previous?.successfulResolutionCount ?? 0,
      failedResolutionCount: previous?.failedResolutionCount ?? 0,
      diagnosis: options.diagnosis ?? previous?.diagnosis,
      recommendation: options.recommendation ?? previous?.recommendation,
    };

    this.store.set(entry);
    return entry;
  }

  find(options: FailureMemoryInput): DecisionMemoryResult {
    const signature = buildFailureSignature(options);
    const entry = this.store.get(signature);
    if (!entry) return { hit: false, signature };

    return {
      hit: true,
      signature,
      occurrences: entry.occurrences,
      outcome: entry.outcome,
      diagnosis: entry.diagnosis,
      recommendation: entry.recommendation,
      confidence: confidence(entry),
    };
  }

  resolve(signature: string, options: ResolutionOptions): FailureMemoryEntry | undefined {
    const previous = this.store.get(signature);
    if (!previous) return undefined;

    const updated: FailureMemoryEntry = {
      ...previous,
      lastSeenAt: new Date().toISOString(),
      outcome: options.successful ? "resolved" : "regressed",
      successfulResolutionCount: previous.successfulResolutionCount + (options.successful ? 1 : 0),
      failedResolutionCount: previous.failedResolutionCount + (options.successful ? 0 : 1),
      diagnosis: options.diagnosis ?? previous.diagnosis,
      recommendation: options.recommendation ?? previous.recommendation,
    };

    this.store.set(updated);
    return updated;
  }

  list(): readonly FailureMemoryEntry[] {
    return this.store.values();
  }
}

export const failureMemory = new FailureMemory();

export type FailureTaskRef = {
  taskId: AITaskId;
  kind: AIErrorKind;
};

export type FailureMemoryOutcome = FailureOutcome;
