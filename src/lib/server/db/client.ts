/**
 * Postgres connection pool — SERVER-ONLY.
 *
 * Lazily creates a single `postgres` (postgres.js) connection pool on first use,
 * bound to `DATABASE_URL`. The pool is created ONLY when a DB-backed RPC
 * actually runs (and only after `isDbConfigured()`), so the app builds, type
 * checks, and runs without a database — the completable-later contract.
 *
 * `drizzle(dbPool)` wraps the postgres.js pool in the Drizzle query builder so
 * all reads/writes go through typed schema tables. The pool is never exposed
 * to client code (this module lives under `src/lib/server/`).
 */

import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { isDbConfigured, getDatabaseUrl, getDbPoolMax } from "./config";
import * as schema from "./schema";

export type Database = ReturnType<typeof drizzle<typeof schema>>;

let dbInstance: Database | null = null;
let sqlInstance: ReturnType<typeof postgres> | null = null;

/**
 * Get the typed Drizzle database handle. Throws if not configured — callers
 * MUST guard with `isDbConfigured()` first and return a `not_configured`
 * failure rather than calling this.
 */
export function getDb(): Database {
  if (!isDbConfigured()) {
    throw new Error("Database is not configured. Call isDbConfigured() first.");
  }
  if (!dbInstance) {
    // postgres.js pool: prepared statements disabled (safe with pgbouncer /
    // serverless-style transient runtimes); max connections configurable via
    // DATABASE_POOL_MAX_CONNECTIONS (default 10).
    sqlInstance = postgres(getDatabaseUrl(), {
      max: getDbPoolMax(),
      prepare: false,
    });
    dbInstance = drizzle(sqlInstance, { schema });
  }
  return dbInstance;
}

/** Close the pool — tests / graceful shutdown. */
export async function closeDb(): Promise<void> {
  if (sqlInstance) {
    await sqlInstance.end({ timeout: 5 });
    sqlInstance = null;
    dbInstance = null;
  }
}

export { schema };
