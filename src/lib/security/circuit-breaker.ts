export type CircuitState = "closed" | "open" | "half-open";

export interface CircuitBreakerOptions {
  failureThreshold: number;
  resetTimeoutMs: number;
}

export interface CircuitSnapshot {
  state: CircuitState;
  failures: number;
  openedAt: number | null;
}

/** Small dependency-free circuit breaker suitable for server or edge adapters. */
export class CircuitBreaker {
  private state: CircuitState = "closed";
  private failures = 0;
  private openedAt: number | null = null;

  constructor(private readonly options: CircuitBreakerOptions) {
    if (!Number.isInteger(options.failureThreshold) || options.failureThreshold <= 0) {
      throw new Error("failureThreshold must be a positive integer");
    }
    if (!Number.isFinite(options.resetTimeoutMs) || options.resetTimeoutMs <= 0) {
      throw new Error("resetTimeoutMs must be positive");
    }
  }

  getSnapshot(now = Date.now()): CircuitSnapshot {
    if (this.state === "open" && this.openedAt !== null && now - this.openedAt >= this.options.resetTimeoutMs) {
      this.state = "half-open";
    }
    return { state: this.state, failures: this.failures, openedAt: this.openedAt };
  }

  canExecute(now = Date.now()): boolean {
    return this.getSnapshot(now).state !== "open";
  }

  recordSuccess(): void {
    this.state = "closed";
    this.failures = 0;
    this.openedAt = null;
  }

  recordFailure(now = Date.now()): void {
    this.failures += 1;
    if (this.failures >= this.options.failureThreshold) {
      this.state = "open";
      this.openedAt = now;
    }
  }
}
