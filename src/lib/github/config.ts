/**
 * GitHub App configuration — SERVER-ONLY.
 *
 * Reads GitHub App / OAuth credentials from `process.env`. Never imported by
 * client code (only by `auth/*`, `client.ts`, `service/*`, `server/*.rpc.ts`,
 * all of which run inside `createServerFn` handlers on the server).
 *
 * "Completable later" contract (per Phase 2 brief):
 * - When any required credential is missing, `isGitHubAppConfigured()` returns
 *   false. Every GitHub RPC then returns a real `not_configured` failure —
 *   never a fake success, never a stub treated as production.
 * - Once the operator sets the env vars (GitHub App created + secrets added to
 *   the host / `.env`), the same code starts working with zero changes.
 *
 * No credentials are ever logged or serialized into responses.
 */

export interface GitHubAppConfig {
  /** GitHub App id (numeric) or OAuth App client id. */
  clientId: string;
  /** GitHub App / OAuth App client secret. */
  clientSecret: string;
  /** Full redirect URL registered on the GitHub App (e.g. https://host/developer/callback). */
  callbackUrl: string;
  /**
   * Optional GitHub App id (numeric string) for app-level server calls (listing
   * installations, revoking, etc.). Not required for the user OAuth web flow.
   */
  appId?: string;
  /** Optional PEM private key for app-JWT calls. Phase 2 does not use it. */
  privateKey?: string;
  /** Optional webhook secret — unused in Phase 2 (no inbound webhooks yet). */
  webhookSecret?: string;
  /** Scopes requested during the OAuth web flow. */
  scopes: readonly string[];
}

/** Required vars for the OAuth web flow used in Phase 2. */
const REQUIRED_VARS = [
  "GITHUB_CLIENT_ID",
  "GITHUB_CLIENT_SECRET",
  "GITHUB_APP_CALLBACK_URL",
] as const;

let cached: GitHubAppConfig | null = null;
let cachedMissing: string[] | null = null;

function readEnv(name: string): string | undefined {
  // process.env is only available server-side; this module is server-only.
  const value = process.env[name];
  return value && value.length > 0 ? value : undefined;
}

function loadConfig(): void {
  if (cached !== null || cachedMissing !== null) return;

  const clientId = readEnv("GITHUB_CLIENT_ID");
  const clientSecret = readEnv("GITHUB_CLIENT_SECRET");
  const callbackUrl = readEnv("GITHUB_APP_CALLBACK_URL");

  const missing: string[] = [];
  if (!clientId) missing.push("GITHUB_CLIENT_ID");
  if (!clientSecret) missing.push("GITHUB_CLIENT_SECRET");
  if (!callbackUrl) missing.push("GITHUB_APP_CALLBACK_URL");

  if (missing.length > 0) {
    cachedMissing = missing;
    cached = null;
    return;
  }

  cached = {
    clientId: clientId!,
    clientSecret: clientSecret!,
    callbackUrl: callbackUrl!,
    appId: readEnv("GITHUB_APP_ID"),
    privateKey: readEnv("GITHUB_PRIVATE_KEY"),
    webhookSecret: readEnv("GITHUB_WEBHOOK_SECRET"),
    // repo + workflow (for verification runs) + read:org (to list org repos).
    // Kept minimal; expand later when the agent needs more.
    scopes: ["repo", "workflow", "read:org"],
  };
  cachedMissing = [];
}

/** True only when every required GitHub credential is present. */
export function isGitHubAppConfigured(): boolean {
  loadConfig();
  return cached !== null;
}

/** Names of missing required env vars (for operator diagnostics; never secrets). */
export function getMissingGitHubConfig(): string[] {
  loadConfig();
  return cachedMissing ?? [];
}

/**
 * Returns the resolved config. Throws if not configured — callers must guard
 * with `isGitHubAppConfigured()` first and surface `not_configured` to the user.
 */
export function getGitHubAppConfig(): GitHubAppConfig {
  loadConfig();
  if (!cached) {
    throw new Error("GitHub App is not configured. Missing: " + (cachedMissing ?? []).join(", "));
  }
  return cached;
}

/** HMAC key for signing the session cookie. Derived from client secret + salt. */
export function getSessionSigningKey(): string {
  const cfg = getGitHubAppConfig();
  // Derive a distinct key from the client secret so no extra env var is needed.
  // (HMAC over cookie payload; the client secret itself is never stored in the
  // cookie — only this HMAC signature is.)
  return `flixo-session::${cfg.clientId}::${cfg.clientSecret}`;
}

/** Drop the cache — used by tests after injecting env vars. */
export function resetGitHubConfigCache(): void {
  cached = null;
  cachedMissing = null;
}
