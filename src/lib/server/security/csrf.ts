/**
 * CSRF + rate-limiting helpers — SERVER-ONLY.
 *
 * CSRF: double-submit cookie pattern. A signed CSRF token cookie is issued to
 * the browser; mutating RPCs (login, contact, tool requests) require the
 * `x-csrf-token` header to match the cookie, verified with a constant-time
 * comparison. Cross-site requests cannot read the cookie (SameSite) and thus
 * cannot forge a matching header.
 *
 * Rate limiting: a small in-memory token bucket per identifier (ip or
 * action+ip). Process-scoped; resets on server restart. Suitable for a single
 * serverless function instance; a distributed store can be wired later via the
 * same `RateLimiter` interface (completable-later pattern).
 */

import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";
import { getAdminSessionSecret } from "../../admin/config";

const CSRF_COOKIE_NAME = "flixo_csrf";

let fallbackKey: string | null = null;
function getCsrfKey(): string {
  try {
    return getAdminSessionSecret();
  } catch {
    if (!fallbackKey) {
      fallbackKey = randomBytes(32).toString("hex");
    }
    return fallbackKey;
  }
}

function signToken(payload: string): string {
  return createHmac("sha256", getCsrfKey()).update(payload).digest("base64url");
}

/** Build a fresh signed CSRF token + the Set-Cookie header value for it. */
export function buildCsrfToken(): { token: string; cookieHeader: string } {
  const payload = randomBytes(24).toString("hex");
  const sig = signToken(payload);
  const token = `${payload}.${sig}`;
  const cookieHeader = `${CSRF_COOKIE_NAME}=${token}; Path=/; SameSite=Lax; Max-Age=86400${
    process.env.NODE_ENV === "production" ? "; Secure" : ""
  }`;
  return { token, cookieHeader };
}

/** Read the CSRF cookie value from a Request's Cookie header. */
export function readCsrfCookie(request: Request): string | null {
  const header = request.headers.get("cookie");
  if (!header) return null;
  for (const part of header.split(";")) {
    const [k, ...rest] = part.trim().split("=");
    if (k === CSRF_COOKIE_NAME) return decodeURIComponent(rest.join("="));
  }
  return null;
}

/**
 * Verify a CSRF token (header) against the signed CSRF cookie. Returns true on
 * match. The shared token's signature is re-verified so an attacker cannot
 * supply an arbitrary value that merely equals itself.
 */
export function verifyCsrf(cookieToken: string | null, headerToken: string | null): boolean {
  if (!cookieToken || !headerToken) return false;
  if (cookieToken !== headerToken) return false;
  const dot = cookieToken.lastIndexOf(".");
  if (dot <= 0) return false;
  const payload = cookieToken.slice(0, dot);
  const sig = cookieToken.slice(dot + 1);
  const expected = signToken(payload);
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return false;
  return true;
}

export function getCsrfCookieName(): string {
  return CSRF_COOKIE_NAME;
}

// ---- rate limiting ---------------------------------------------------------

interface Bucket {
  tokens: number;
  lastRefill: number;
}

interface RateLimiterOptions {
  capacity: number;
  refillPerSecond: number;
}

const buckets = new Map<string, Bucket>();

/**
 * Token-bucket rate limiter. Returns true if the request is allowed, false if
 * it exceeded the limit. Keyed by identifier (e.g. `login:${ip}`).
 */
export function rateLimit(
  key: string,
  opts: RateLimiterOptions,
): { allowed: boolean; remaining: number } {
  const now = Date.now();
  let bucket = buckets.get(key);
  if (!bucket) {
    bucket = { tokens: opts.capacity, lastRefill: now };
    buckets.set(key, bucket);
  }
  const elapsed = (now - bucket.lastRefill) / 1000;
  bucket.tokens = Math.min(opts.capacity, bucket.tokens + elapsed * opts.refillPerSecond);
  bucket.lastRefill = now;
  if (bucket.tokens < 1) {
    return { allowed: false, remaining: 0 };
  }
  bucket.tokens -= 1;
  return { allowed: true, remaining: Math.floor(bucket.tokens) };
}

// Presets for protected endpoints.
export const RATE_PRESETS = {
  login: { capacity: 10, refillPerSecond: 1 / 60 },
  contact: { capacity: 20, refillPerSecond: 1 / 10 },
  toolRequest: { capacity: 20, refillPerSecond: 1 / 10 },
  ai: { capacity: 8, refillPerSecond: 1 / 15 },
  // Analytics accepts short batches, so the per-IP budget is intentionally
  // higher while each request is still capped at 50 events by the validator.
  analytics: { capacity: 30, refillPerSecond: 1 / 2 },
} as const;
