import type { AITaskId, AIErrorKind } from "../types";

export type FailureOutcome = "unresolved" | "resolved" | "regressed";

export interface FailureMemoryInput {
  readonly taskId: AITaskId;
  readonly kind: AIErrorKind;
  readonly retryable: boolean;
  /** Safe diagnostic code only; never raw user/provider payloads. */
  readonly diagnosticCode?: string;
}

export interface FailureMemoryEntry extends FailureMemoryInput {
  readonly signature: string;
  readonly firstSeenAt: string;
  readonly lastSeenAt: string;
  readonly occurrences: number;
  readonly outcome: FailureOutcome;
  readonly successfulResolutionCount: number;
  readonly failedResolutionCount: number;
  readonly diagnosis?: string;
  readonly recommendation?: string;
}

export interface DecisionMemoryHit {
  readonly hit: true;
  readonly signature: string;
  readonly occurrences: number;
  readonly outcome: FailureOutcome;
  readonly diagnosis?: string;
  readonly recommendation?: string;
  readonly confidence: number;
}

export interface DecisionMemoryMiss {
  readonly hit: false;
  readonly signature: string;
}

export type DecisionMemoryResult = DecisionMemoryHit | DecisionMemoryMiss;

export interface FailureMemoryStore {
  get(signature: string): FailureMemoryEntry | undefined;
  set(entry: FailureMemoryEntry): void;
  values(): readonly FailureMemoryEntry[];
}
