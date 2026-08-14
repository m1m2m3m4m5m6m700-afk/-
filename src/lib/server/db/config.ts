/**
 * Database configuration — SERVER-ONLY.
 *
 * Reads the Postgres connection string from `DATABASE_URL` (the de-facto
 * standard auto-provisioned by Vercel/Neon/Render). For backward compatibility
 * with earlier docs, `POSTGRES_URL` is also accepted as a fallback alias.
 * Never imported by client code (lives under `src/lib/server/`; reached only
 * inside `createServerFn` handler bodies which TanStack Start stubs out of the
 * client bundle).
 *
 * "Completable later" contract (identical to the GitHub/AI/Admin layers):
 * - When neither env var is set, `isDbConfigured()` returns false. Every
 *   DB-backed RPC then returns a real `not_configured` failure — never a fake
 *   success, never fabricated data.
 * - Once the operator sets `DATABASE_URL` (a live Postgres connection string),
 *   the same code connects with zero changes.
 *
 * No connection strings are ever logged or serialized into responses.
 */

const PRIMARY_VAR = "DATABASE_URL";
const FALLBACK_VAR = "POSTGRES_URL"; // legacy alias (older docs used this name)

let cachedUrl: string | null | undefined = undefined;

function readEnv(name: string): string | undefined {
  if (typeof process === "undefined") return undefined;
  const value = process.env?.[name];
  return value && value.trim().length > 0 ? value.trim() : undefined;
}

function load(): void {
  if (cachedUrl !== undefined) return;
  cachedUrl = readEnv(PRIMARY_VAR) ?? readEnv(FALLBACK_VAR) ?? null;
}

/** True only when a Postgres connection string is configured. */
export function isDbConfigured(): boolean {
  load();
  return cachedUrl !== null;
}

/** Resolved database URL. Throws if not configured. */
export function getDatabaseUrl(): string {
  load();
  if (!cachedUrl) {
    throw new Error("Database is not configured. Set DATABASE_URL.");
  }
  return cachedUrl;
}

/** Optional pool size override (default 10). Reads DATABASE_POOL_MAX_CONNECTIONS. */
export function getDbPoolMax(): number {
  const raw = readEnv("DATABASE_POOL_MAX_CONNECTIONS") ?? readEnv("POSTGRES_POOL_MAX_CONNECTIONS");
  const n = raw ? Number(raw) : NaN;
  return Number.isFinite(n) && n > 0 ? Math.floor(n) : 10;
}

/** Drop the cache — tests / hot reload. */
export function resetDbConfigCache(): void {
  cachedUrl = undefined;
}
