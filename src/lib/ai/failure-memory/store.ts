import type { FailureMemoryEntry, FailureMemoryStore } from "./types";

export class InMemoryFailureMemoryStore implements FailureMemoryStore {
  private readonly entries = new Map<string, FailureMemoryEntry>();

  get(signature: string): FailureMemoryEntry | undefined {
    return this.entries.get(signature);
  }

  set(entry: FailureMemoryEntry): void {
    this.entries.set(entry.signature, entry);
  }

  values(): readonly FailureMemoryEntry[] {
    return [...this.entries.values()];
  }
}
