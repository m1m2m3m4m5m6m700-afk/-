/**
 * CSRF + rate-limiting helpers — SERVER-ONLY.
 *
 * CSRF: double-submit cookie pattern. A signed CSRF token cookie is issued to
 * the browser; mutating RPCs require the x-csrf-token header to match it.
 *
 * Rate limiting: process-local token buckets. State is bounded and stale
 * buckets are periodically evicted so attacker-controlled identifiers cannot
 * grow the Map without limit. A distributed limiter can replace this later
 * through the same function contract.
 */

import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";
import { getAdminSessionSecret } from "../../admin/config";

const CSRF_COOKIE_NAME = "flixo_csrf";

let fallbackKey: string | null = null;
function getCsrfKey(): string {
  try {
    return getAdminSessionSecret();
  } catch {
    if (!fallbackKey) fallbackKey = randomBytes(32).toString("hex");
    return fallbackKey;
  }
}

function signToken(payload: string): string {
  return createHmac("sha256", getCsrfKey()).update(payload).digest("base64url");
}

export function buildCsrfToken(): { token: string; cookieHeader: string } {
  const payload = randomBytes(24).toString("hex");
  const sig = signToken(payload);
  const token = `${payload}.${sig}`;
  const cookieHeader = `${CSRF_COOKIE_NAME}=${token}; Path=/; SameSite=Lax; Max-Age=86400${
    process.env.NODE_ENV === "production" ? "; Secure" : ""
  }`;
  return { token, cookieHeader };
}

export function readCsrfCookie(request: Request): string | null {
  const header = request.headers.get("cookie");
  if (!header) return null;
  for (const part of header.split(";")) {
    const [k, ...rest] = part.trim().split("=");
    if (k === CSRF_COOKIE_NAME) return decodeURIComponent(rest.join("="));
  }
  return null;
}

export function verifyCsrf(cookieToken: string | null, headerToken: string | null): boolean {
  if (!cookieToken || !headerToken || cookieToken !== headerToken) return false;
  const dot = cookieToken.lastIndexOf(".");
  if (dot <= 0) return false;
  const payload = cookieToken.slice(0, dot);
  const sig = cookieToken.slice(dot + 1);
  const expected = signToken(payload);
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}

export function getCsrfCookieName(): string {
  return CSRF_COOKIE_NAME;
}

interface Bucket {
  tokens: number;
  lastRefill: number;
  touchedAt: number;
}

interface RateLimiterOptions {
  capacity: number;
  refillPerSecond: number;
}

const buckets = new Map<string, Bucket>();
const MAX_BUCKETS = 5000;
const EVICTION_AGE_MS = 10 * 60 * 1000;
let lastEviction = 0;

function evictStaleBuckets(now: number): void {
  if (now - lastEviction < 60_000 && buckets.size <= MAX_BUCKETS) return;
  lastEviction = now;
  for (const [key, bucket] of buckets) {
    if (now - bucket.touchedAt > EVICTION_AGE_MS) buckets.delete(key);
  }
  if (buckets.size <= MAX_BUCKETS) return;
  const oldest = [...buckets.entries()]
    .sort((a, b) => a[1].touchedAt - b[1].touchedAt)
    .slice(0, Math.ceil(buckets.size - MAX_BUCKETS));
  for (const [key] of oldest) buckets.delete(key);
}

export function rateLimit(
  key: string,
  opts: RateLimiterOptions,
): { allowed: boolean; remaining: number } {
  const now = Date.now();
  evictStaleBuckets(now);

  let bucket = buckets.get(key);
  if (!bucket) {
    bucket = { tokens: opts.capacity, lastRefill: now, touchedAt: now };
    buckets.set(key, bucket);
  }

  const elapsed = (now - bucket.lastRefill) / 1000;
  bucket.tokens = Math.min(opts.capacity, bucket.tokens + elapsed * opts.refillPerSecond);
  bucket.lastRefill = now;
  bucket.touchedAt = now;

  if (bucket.tokens < 1) return { allowed: false, remaining: 0 };
  bucket.tokens -= 1;
  return { allowed: true, remaining: Math.floor(bucket.tokens) };
}

export const RATE_PRESETS = {
  login: { capacity: 10, refillPerSecond: 1 / 60 },
  contact: { capacity: 20, refillPerSecond: 1 / 10 },
  toolRequest: { capacity: 20, refillPerSecond: 1 / 10 },
  ai: { capacity: 8, refillPerSecond: 1 / 15 },
  analytics: { capacity: 30, refillPerSecond: 1 / 2 },
} as const;
