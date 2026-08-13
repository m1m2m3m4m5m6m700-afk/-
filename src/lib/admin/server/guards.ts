/**
 * Shared helpers for admin RPC handlers — SERVER-ONLY.
 *
 * Keeps each RPC handler tiny: they read `context.adminSession` (injected by
 * `adminSessionMiddleware`) and either proceed or return a typed failure.
 *
 * Mirrors `src/lib/github/server/guards.ts` — same discriminated-result shape,
 * same guard ordering (configured → authenticated → authorized), but for the
 * admin session.
 */

import { isAdminConfigured } from "../config";
import type { AdminAuthFailure, AdminSessionPayload } from "../types";

export function fail(kind: AdminAuthFailure["kind"], message: string): AdminAuthFailure {
  return { ok: false, kind, message };
}

/**
 * Guard that the server has admin credentials configured. Returns a failure
 * when missing, or null when configured (caller proceeds).
 */
export function guardAdminConfigured(): AdminAuthFailure | null {
  if (!isAdminConfigured()) {
    return fail(
      "not_configured",
      "Admin authentication is not configured on this server. Ask the operator to set ADMIN_PASSWORD_HASH and ADMIN_SESSION_SECRET.",
    );
  }
  return null;
}

/**
 * Guard that the request carries a valid, unexpired admin session. Returns the
 * authenticated session payload or a `not_authenticated` failure.
 *
 * This is the AUTHORIZATION gate: every admin-data RPC MUST call this (after
 * `guardAdminConfigured`) and refuse when it fails. `role === "admin"` is the
 * authorization role, set at login and verified in the signed cookie.
 */
export function guardAuthenticatedAdmin(
  session: AdminSessionPayload | null,
): AdminSessionPayload | AdminAuthFailure {
  if (!session) {
    return fail("not_authenticated", "You are not signed in as an admin.");
  }
  // The cookie is signed; `role` is verified in `verifyAdminSessionValue`.
  if (session.role !== "admin") {
    return fail("not_authenticated", "Your session is not an admin session.");
  }
  return session;
}
