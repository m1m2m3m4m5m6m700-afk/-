/** Server-only signed admin session helpers. */

import { createHmac, randomUUID, timingSafeEqual } from "node:crypto";
import { getAdminConfigAsync } from "../config";
import type { AdminSessionPayload } from "../types";

const COOKIE_NAME = "flixo_admin_session";
const SESSION_TTL_MS = 1000 * 60 * 60 * 12;
const DEV = (import.meta as { env?: { DEV?: boolean } }).env?.DEV ?? process.env.NODE_ENV !== "production";

function b64url(input: Buffer | string): string { return Buffer.from(input).toString("base64url"); }
function fromB64url(s: string): Buffer { return Buffer.from(s, "base64url"); }

async function sign(payloadB64: string): Promise<string | null> {
  const config = await getAdminConfigAsync();
  if (!config) return null;
  return createHmac("sha256", config.sessionSecret).update(payloadB64).digest("base64url");
}

export async function createAdminSessionValue(): Promise<{ value: string; payload: AdminSessionPayload } | null> {
  const sessionId = randomUUID();
  const now = Date.now();
  const payload: AdminSessionPayload = { sessionId, role: "admin", issuedAt: now, expiresAt: now + SESSION_TTL_MS };
  const payloadB64 = b64url(JSON.stringify(payload));
  const signature = await sign(payloadB64);
  if (!signature) return null;
  return { value: `${payloadB64}.${signature}`, payload };
}

export async function verifyAdminSessionValue(raw: string | null | undefined): Promise<AdminSessionPayload | null> {
  if (!raw || typeof raw !== "string") return null;
  const dot = raw.lastIndexOf(".");
  if (dot <= 0) return null;
  const payloadB64 = raw.slice(0, dot);
  const signature = raw.slice(dot + 1);
  const expectedSignature = await sign(payloadB64);
  if (!expectedSignature) return null;
  const a = Buffer.from(signature);
  const b = Buffer.from(expectedSignature);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  try {
    const payload = JSON.parse(fromB64url(payloadB64).toString("utf8")) as AdminSessionPayload;
    if (typeof payload.expiresAt !== "number" || Date.now() > payload.expiresAt) return null;
    if (typeof payload.sessionId !== "string" || payload.role !== "admin") return null;
    return payload;
  } catch {
    return null;
  }
}

export function getAdminCookieName(): string { return COOKIE_NAME; }

export function buildAdminSetCookieHeader(value: string, maxAgeMs = SESSION_TTL_MS): string {
  const parts = [`${COOKIE_NAME}=${value}`, "Path=/", `Max-Age=${Math.floor(maxAgeMs / 1000)}`, "SameSite=Lax", "HttpOnly"];
  if (!DEV) parts.push("Secure");
  return parts.join("; ");
}

export function buildAdminClearCookieHeader(): string {
  const parts = [`${COOKIE_NAME}=`, "Path=/", "Max-Age=0", "SameSite=Lax", "HttpOnly"];
  if (!DEV) parts.push("Secure");
  return parts.join("; ");
}

export function readAdminSessionCookie(request: Request): string | null {
  const header = request.headers.get("cookie");
  if (!header) return null;
  for (const part of header.split(";")) {
    const [key, ...rest] = part.trim().split("=");
    if (key === COOKIE_NAME) return decodeURIComponent(rest.join("="));
  }
  return null;
}

export async function readAdminSession(request: Request): Promise<AdminSessionPayload | null> {
  return verifyAdminSessionValue(readAdminSessionCookie(request));
}
