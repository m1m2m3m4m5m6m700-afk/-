export interface RateLimitPolicy {
  limit: number;
  windowMs: number;
}

export interface RateLimitDecision {
  allowed: boolean;
  remaining: number;
  retryAfterMs: number;
}

interface Bucket {
  count: number;
  resetAt: number;
}

/** In-memory limiter for a single process/edge isolate. Use a shared store adapter for multi-instance deployments. */
export class RateLimiter {
  private readonly buckets = new Map<string, Bucket>();

  constructor(private readonly policy: RateLimitPolicy) {
    if (!Number.isInteger(policy.limit) || policy.limit <= 0) {
      throw new Error("Rate limit must be a positive integer");
    }
    if (!Number.isFinite(policy.windowMs) || policy.windowMs <= 0) {
      throw new Error("Rate-limit window must be positive");
    }
  }

  check(key: string, now = Date.now()): RateLimitDecision {
    const current = this.buckets.get(key);
    if (!current || current.resetAt <= now) {
      this.buckets.set(key, { count: 1, resetAt: now + this.policy.windowMs });
      return { allowed: true, remaining: this.policy.limit - 1, retryAfterMs: 0 };
    }

    if (current.count >= this.policy.limit) {
      return {
        allowed: false,
        remaining: 0,
        retryAfterMs: Math.max(0, current.resetAt - now),
      };
    }

    current.count += 1;
    return { allowed: true, remaining: this.policy.limit - current.count, retryAfterMs: 0 };
  }

  reset(key: string): void {
    this.buckets.delete(key);
  }

  clear(): void {
    this.buckets.clear();
  }
}
