/**
 * GitHub session — SERVER-ONLY.
 *
 * Two concerns kept strictly separate:
 *
 * 1. **Session cookie** — a signed, base64url token stored in the browser.
 *    Contains ONLY: sessionId, login, selectedRepo/branch, issuedAt, expiresAt.
 *    Contains NO access token. Signed with an HMAC derived from the GitHub App
 *    client secret (see `config.ts → getSessionSigningKey`).
 *
 * 2. **Access-token cache** — an in-memory Map keyed by `sessionId`. The GitHub
 *    OAuth access token lives ONLY here, server-side. The cookie references it
 *    only via the opaque random `sessionId`.
 *
 * On server restart (e.g. Render free tier), the in-memory cache is lost. The
 * cookie is still valid, but the token lookup misses → the layer returns
 * `auth_required`, prompting re-auth. This is the documented, safe fallback.
 *
 * Cookie attributes: HttpOnly, Secure (auto-disabled in dev for localhost),
 * SameSite=Lax (so the OAuth redirect back to /developer/callback works),
 * Path=/.
 */

import { createHmac, randomUUID, timingSafeEqual } from "node:crypto";
import { getSessionSigningKey } from "../config";
import type { GitHubSessionPayload, GitHubTokenSet } from "../types";

/**
 * Canonical write-branch pattern: `ai/<slug>` only. The slug is lowercase
 * alphanumerics + hyphens, 1–40 chars, no leading/trailing hyphens. This
 * structurally guarantees writes can NEVER target the default/protected branch
 * (`main`/`master`/`develop` are never `ai/*`).
 *
 * Declared here (not in guards.ts) so both `verifySessionValue` (load-time
 * defense-in-depth) and `guardWriteBranch` (write-time enforcement) share ONE
 * source of truth without a circular import. guards.ts imports this; session.ts
 * does not import guards.ts.
 */
export const WRITE_BRANCH_PATTERN = /^ai\/[a-z0-9](?:[a-z0-9-]{0,38}[a-z0-9])?$/;

const COOKIE_NAME = "flixo_dev_session";
const SESSION_TTL_MS = 1000 * 60 * 60 * 24 * 7; // 7 days
// import.meta.env.DEV is defined by Vite; fall back to NODE_ENV for non-Vite
// runtimes (tests, ad-hoc scripts) so this never throws.
const DEV =
  (import.meta as { env?: { DEV?: boolean } }).env?.DEV ?? process.env.NODE_ENV !== "production";

// ---- token cache (server-side only) ----------------------------------------

const tokenCache = new Map<string, GitHubTokenSet>();

export function cacheToken(sessionId: string, token: GitHubTokenSet): void {
  tokenCache.set(sessionId, token);
}

export function getCachedToken(sessionId: string): GitHubTokenSet | undefined {
  return tokenCache.get(sessionId);
}

export function dropCachedToken(sessionId: string): void {
  tokenCache.delete(sessionId);
}

/** Test-only: wipe the cache. */
export function resetSessionCache(): void {
  tokenCache.clear();
}

// ---- cookie value (signed payload) -----------------------------------------

function b64url(input: Buffer | string): string {
  return Buffer.from(input).toString("base64url");
}

function fromB64url(s: string): Buffer {
  return Buffer.from(s, "base64url");
}

function sign(payloadB64: string): string {
  return createHmac("sha256", getSessionSigningKey()).update(payloadB64).digest("base64url");
}

/** Build the signed cookie value for a new session. */
export function createSessionValue(login: string): {
  value: string;
  payload: GitHubSessionPayload;
} {
  const sessionId = randomUUID();
  const now = Date.now();
  const payload: GitHubSessionPayload = {
    sessionId,
    login,
    selectedRepo: null,
    selectedBranch: null,
    writeBranch: null,
    issuedAt: now,
    expiresAt: now + SESSION_TTL_MS,
  };
  const payloadB64 = b64url(JSON.stringify(payload));
  const value = `${payloadB64}.${sign(payloadB64)}`;
  return { value, payload };
}

/**
 * Verify a cookie value. Returns the payload on success, or `null` if the
 * signature is invalid, the payload is malformed, or the session expired.
 * Uses `timingSafeEqual` for signature comparison.
 */
export function verifySessionValue(raw: string | null | undefined): GitHubSessionPayload | null {
  if (!raw || typeof raw !== "string") return null;
  const dot = raw.lastIndexOf(".");
  if (dot <= 0) return null;
  const payloadB64 = raw.slice(0, dot);
  const sig = raw.slice(dot + 1);

  let expectedSig: string;
  try {
    expectedSig = sign(payloadB64);
  } catch {
    // Signing key unavailable (GitHub not configured) — no session is valid.
    return null;
  }

  // timingSafeEqual requires equal-length buffers.
  const a = Buffer.from(sig);
  const b = Buffer.from(expectedSig);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;

  let payload: GitHubSessionPayload;
  try {
    payload = JSON.parse(fromB64url(payloadB64).toString("utf8")) as GitHubSessionPayload;
  } catch {
    return null;
  }
  if (typeof payload.expiresAt !== "number" || Date.now() > payload.expiresAt) return null;
  if (typeof payload.sessionId !== "string" || typeof payload.login !== "string") return null;
  // Tolerate cookies issued before Phase 5 (no writeBranch field).
  if (payload.writeBranch === undefined) payload.writeBranch = null;
  // Phase 5.1 defense-in-depth: reject cookies whose writeBranch is a non-null
  // string that does NOT match the strict `ai/<slug>` pattern. The cookie is
  // signed so it cannot be client-forged, but this catches any future bug that
  // sets writeBranch to an invalid value (e.g. `main`) at load time — before
  // guardWriteBranch runs. On mismatch, null out the field (forces re-creation)
  // rather than rejecting the whole session (read access is unaffected).
  if (payload.writeBranch !== null && !WRITE_BRANCH_PATTERN.test(payload.writeBranch)) {
    payload.writeBranch = null;
  }
  return payload;
}

// ---- cookie header helpers -------------------------------------------------

export function getCookieName(): string {
  return COOKIE_NAME;
}

/** Build a Set-Cookie header value for the given session cookie value. */
export function buildSetCookieHeader(value: string, maxAgeMs = SESSION_TTL_MS): string {
  const parts = [
    `${COOKIE_NAME}=${value}`,
    "Path=/",
    `Max-Age=${Math.floor(maxAgeMs / 1000)}`,
    "SameSite=Lax",
    "HttpOnly",
  ];
  // Secure only in production (localhost over http would drop the cookie).
  if (!DEV) parts.push("Secure");
  return parts.join("; ");
}

/** Build a Set-Cookie header that clears the session cookie. */
export function buildClearCookieHeader(): string {
  const parts = [`${COOKIE_NAME}=`, "Path=/", "Max-Age=0", "SameSite=Lax", "HttpOnly"];
  if (!DEV) parts.push("Secure");
  return parts.join("; ");
}

/** Read the session cookie value from a Request's Cookie header. */
export function readSessionCookie(request: Request): string | null {
  const header = request.headers.get("cookie");
  if (!header) return null;
  for (const part of header.split(";")) {
    const [k, ...rest] = part.trim().split("=");
    if (k === COOKIE_NAME) return decodeURIComponent(rest.join("="));
  }
  return null;
}

/** Verify the session on a raw Request (convenience for the request middleware). */
export function readSession(request: Request): GitHubSessionPayload | null {
  return verifySessionValue(readSessionCookie(request));
}

/**
 * Produce a new cookie header that updates `selectedRepo` / `selectedBranch`
 * on an existing valid payload, preserving sessionId + login + TTL. The token
 * cache is untouched (still keyed by sessionId).
 */
export function updateSessionSelection(
  payload: GitHubSessionPayload,
  patch: {
    selectedRepo?: string | null;
    selectedBranch?: string | null;
    writeBranch?: string | null;
  },
): string {
  const next: GitHubSessionPayload = { ...payload, ...patch };
  const payloadB64 = b64url(JSON.stringify(next));
  const value = `${payloadB64}.${sign(payloadB64)}`;
  const remainingMs = Math.max(0, payload.expiresAt - Date.now());
  return buildSetCookieHeader(value, remainingMs);
}
