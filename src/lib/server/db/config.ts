/**
 * Database configuration — SERVER-ONLY.
 *
 * Reads `DATABASE_URL` from `process.env`. Never imported by client code
 * (lives under `src/lib/server/`; reached only inside `createServerFn` handler
 * bodies which TanStack Start stubs out of the client bundle).
 *
 * "Completable later" contract (identical to the GitHub/AI/Admin layers):
 * - When `DATABASE_URL` is missing, `isDbConfigured()` returns false. Every
 *   DB-backed RPC then returns a real `not_configured` failure — never a fake
 *   success, never fabricated data.
 * - Once the operator sets `DATABASE_URL` (a live Postgres connection string),
 *   the same code connects with zero changes.
 *
 * No connection strings are ever logged or serialized into responses.
 */

const REQUIRED_VAR = "DATABASE_URL";

let cachedUrl: string | null | undefined = undefined;

function readEnv(name: string): string | undefined {
  if (typeof process === "undefined") return undefined;
  const value = process.env?.[name];
  return value && value.trim().length > 0 ? value.trim() : undefined;
}

function load(): void {
  if (cachedUrl !== undefined) return;
  cachedUrl = readEnv(REQUIRED_VAR) ?? null;
}

/** True only when a Postgres connection string is configured. */
export function isDbConfigured(): boolean {
  load();
  return cachedUrl !== null;
}

/** Resolved DATABASE_URL. Throws if not configured. */
export function getDatabaseUrl(): string {
  load();
  if (!cachedUrl) {
    throw new Error("Database is not configured. Missing: DATABASE_URL");
  }
  return cachedUrl;
}

/** Drop the cache — tests / hot reload. */
export function resetDbConfigCache(): void {
  cachedUrl = undefined;
}
