/**
 * Admin session — SERVER-ONLY.
 *
 * A single concern: a signed, base64url cookie value holding ONLY a session id
 * and an issued/expiry timestamp. It carries NO password, NO hash, NO secret.
 * Signed with an HMAC derived from `ADMIN_SESSION_SECRET` (see `config.ts`).
 *
 * This mirrors the GitHub session pattern (`src/lib/github/auth/session.ts`)
 * but is deliberately separate: the admin session cookie is its own name and
 * signing key, so an admin session and a GitHub session can never be confused.
 *
 * Cookie attributes: HttpOnly (never readable by JS), SameSite=Lax, Secure in
 * production (auto-disabled for localhost dev over http), Path=/.
 *
 * On an unconfigured server (`isAdminConfigured() === false`) the signing key
 * is unavailable, so no cookie is ever treated as valid — every admin RPC then
 * returns `not_configured` (see `guards.ts`).
 */

import { createHmac, randomUUID, timingSafeEqual } from "node:crypto";
import { getAdminSessionSecret } from "../config";
import type { AdminSessionPayload } from "../types";

const COOKIE_NAME = "flixo_admin_session";
const SESSION_TTL_MS = 1000 * 60 * 60 * 12; // 12 hours (admin is short-lived)
// import.meta.env.DEV is defined by Vite; fall back to NODE_ENV for non-Vite
// runtimes (tests, ad-hoc scripts) so this never throws.
const DEV =
  (import.meta as { env?: { DEV?: boolean } }).env?.DEV ?? process.env.NODE_ENV !== "production";

// ---- cookie value (signed payload) -----------------------------------------

function b64url(input: Buffer | string): string {
  return Buffer.from(input).toString("base64url");
}

function fromB64url(s: string): Buffer {
  return Buffer.from(s, "base64url");
}

function sign(payloadB64: string): string {
  return createHmac("sha256", getAdminSessionSecret()).update(payloadB64).digest("base64url");
}

/** Build the signed cookie value for a new admin session. */
export function createAdminSessionValue(): { value: string; payload: AdminSessionPayload } {
  const sessionId = randomUUID();
  const now = Date.now();
  const payload: AdminSessionPayload = {
    sessionId,
    role: "admin",
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
export function verifyAdminSessionValue(
  raw: string | null | undefined,
): AdminSessionPayload | null {
  if (!raw || typeof raw !== "string") return null;
  const dot = raw.lastIndexOf(".");
  if (dot <= 0) return null;
  const payloadB64 = raw.slice(0, dot);
  const sig = raw.slice(dot + 1);

  let expectedSig: string;
  try {
    expectedSig = sign(payloadB64);
  } catch {
    // Signing key unavailable (admin not configured) — no session is valid.
    return null;
  }

  const a = Buffer.from(sig);
  const b = Buffer.from(expectedSig);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;

  let payload: AdminSessionPayload;
  try {
    payload = JSON.parse(fromB64url(payloadB64).toString("utf8")) as AdminSessionPayload;
  } catch {
    return null;
  }
  if (typeof payload.expiresAt !== "number" || Date.now() > payload.expiresAt) return null;
  if (typeof payload.sessionId !== "string" || payload.role !== "admin") return null;
  return payload;
}

// ---- cookie header helpers -------------------------------------------------

export function getAdminCookieName(): string {
  return COOKIE_NAME;
}

/** Build a Set-Cookie header value for the given admin session cookie value. */
export function buildAdminSetCookieHeader(value: string, maxAgeMs = SESSION_TTL_MS): string {
  const parts = [
    `${COOKIE_NAME}=${value}`,
    "Path=/",
    `Max-Age=${Math.floor(maxAgeMs / 1000)}`,
    "SameSite=Lax",
    "HttpOnly",
  ];
  if (!DEV) parts.push("Secure");
  return parts.join("; ");
}

/** Build a Set-Cookie header that clears the admin session cookie. */
export function buildAdminClearCookieHeader(): string {
  const parts = [`${COOKIE_NAME}=`, "Path=/", "Max-Age=0", "SameSite=Lax", "HttpOnly"];
  if (!DEV) parts.push("Secure");
  return parts.join("; ");
}

/** Read the admin session cookie value from a Request's Cookie header. */
export function readAdminSessionCookie(request: Request): string | null {
  const header = request.headers.get("cookie");
  if (!header) return null;
  for (const part of header.split(";")) {
    const [k, ...rest] = part.trim().split("=");
    if (k === COOKIE_NAME) return decodeURIComponent(rest.join("="));
  }
  return null;
}

/** Verify the admin session on a raw Request (convenience for middleware). */
export function readAdminSession(request: Request): AdminSessionPayload | null {
  return verifyAdminSessionValue(readAdminSessionCookie(request));
}
