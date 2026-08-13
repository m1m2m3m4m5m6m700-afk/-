/**
 * Admin authentication configuration — SERVER-ONLY.
 *
 * Reads admin credentials from `process.env`. Never imported by client code.
 * Reached only transitively through `createServerFn` handler bodies
 * (`src/lib/admin/rpc/auth.rpc.ts`), whose handler code is stubbed out of the
 * client bundle by TanStack Start, so neither this module nor any secret
 * ships to the browser.
 *
 * "Completable later" contract (same pattern as the GitHub layer in
 * `src/lib/github/config.ts`):
 * - When either required credential is missing, `isAdminConfigured()` returns
 *   false. Every admin RPC then returns a real `not_configured` failure —
 *   never a fake success, never a stub treated as production, and the admin
 *   routes render a "not configured" state instead of letting anyone in.
 * - Once the operator sets `ADMIN_PASSWORD_HASH` and `ADMIN_SESSION_SECRET`
 *   (server env / `.env`), the same code starts working with zero changes.
 *
 * No credentials are ever logged or serialized into responses.
 */

export interface AdminConfig {
  /**
   * Password hash to verify the admin password against. Verified with
   * Node's `scrypt` when the value is a hex/base64 raw hash; otherwise a
   * constant-time raw comparison for a pre-hashed secret the operator chose.
   * The plaintext password is NEVER stored.
   */
  passwordHash: string;
  /**
   * HMAC key for signing the admin session cookie. Must be a long random
   * secret, distinct from any other app secret.
   */
  sessionSecret: string;
}

const REQUIRED_VARS = ["ADMIN_PASSWORD_HASH", "ADMIN_SESSION_SECRET"] as const;

let cached: AdminConfig | null = null;
let cachedMissing: string[] | null = null;

function readEnv(name: string): string | undefined {
  if (typeof process === "undefined") return undefined;
  const value = process.env?.[name];
  return value && value.trim().length > 0 ? value.trim() : undefined;
}

function loadConfig(): void {
  if (cached !== null || cachedMissing !== null) return;

  const passwordHash = readEnv("ADMIN_PASSWORD_HASH");
  const sessionSecret = readEnv("ADMIN_SESSION_SECRET");

  const missing: string[] = [];
  if (!passwordHash) missing.push("ADMIN_PASSWORD_HASH");
  if (!sessionSecret) missing.push("ADMIN_SESSION_SECRET");

  if (missing.length > 0) {
    cachedMissing = missing;
    cached = null;
    return;
  }

  cached = { passwordHash: passwordHash!, sessionSecret: sessionSecret! };
  cachedMissing = [];
}

/** True only when both admin credentials are present. */
export function isAdminConfigured(): boolean {
  loadConfig();
  return cached !== null;
}

/** Names of missing required env vars (operator diagnostics; never secrets). */
export function getMissingAdminConfig(): string[] {
  loadConfig();
  return cachedMissing ?? [];
}

/** Resolved config. Throws if not configured — guard with `isAdminConfigured()`. */
export function getAdminConfig(): AdminConfig {
  loadConfig();
  if (!cached) {
    throw new Error("Admin auth is not configured. Missing: " + (cachedMissing ?? []).join(", "));
  }
  return cached;
}

/** HMAC key for signing the admin session cookie. */
export function getAdminSessionSecret(): string {
  return getAdminConfig().sessionSecret;
}

/** Drop the cache — tests / hot reload. */
export function resetAdminConfigCache(): void {
  cached = null;
  cachedMissing = null;
}
