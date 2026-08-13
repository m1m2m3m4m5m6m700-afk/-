/**
 * Shared DB guards — SERVER-ONLY.
 *
 * Mirrors the admin/github guard pattern: every DB-backed RPC calls
 * `guardDbConfigured()` first, then (for admin data surfaces)
 * `guardAdminConfigured()` + `guardAuthenticatedAdmin()`. When the database is
 * not configured, a real `db_not_configured` failure is returned — never a
 * fake success, never fabricated data.
 */

import { isDbConfigured } from "./config";
import type { DbFailure } from "./types";

export function dbFail(kind: DbFailure["kind"], message: string): DbFailure {
  return { ok: false, kind, message };
}

/**
 * Guard that the server has a database configured. Returns a failure when
 * missing, or null when configured (caller proceeds).
 */
export function guardDbConfigured(): DbFailure | null {
  if (!isDbConfigured()) {
    return dbFail(
      "db_not_configured",
      "The database is not configured on this server. Ask the operator to set DATABASE_URL. No data is available.",
    );
  }
  return null;
}
