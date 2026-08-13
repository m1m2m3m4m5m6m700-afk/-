/**
 * Admin session request middleware — SERVER-ONLY.
 *
 * A TanStack Start *request* middleware that reads the `flixo_admin_session`
 * cookie off the incoming `Request`, verifies it, and injects the payload
 * into downstream server-fn context as `context.adminSession`.
 *
 * Server fns that need an authenticated admin session declare
 * `.middleware([adminSessionMiddleware])` and read `context.adminSession` —
 * which is `AdminSessionPayload | null` (null = not authenticated).
 *
 * Mirrors `src/lib/github/auth/githubSession.ts`. This module lives OUTSIDE the
 * `server/` directory on purpose: the RPC fetchers import it at module
 * top-level (`.middleware([...])`), and the project's import-protection plugin
 * forbids client code from importing anything under `server/`. The actual
 * secret-bearing helpers (session signing, password verify, guards) stay under
 * `server/` and are only imported inside handler bodies, which TanStack Start
 * stubs out of the client bundle.
 */

import { createMiddleware } from "@tanstack/react-start";
import { readAdminSession } from "../server/session";
import type { AdminSessionPayload } from "../types";

/**
 * The admin session is injected into downstream server-fn context as
 * `context.adminSession`. The GitHub layer already augments TanStack Start's
 * global `Register.serverContext` (declaring `githubSession`); rather than
 * re-declare that global property (which TS rejects as a conflicting property
 * type), this middleware types its own context locally so admin RPC handlers
 * that use `.middleware([adminSessionMiddleware])` read a typed
 * `context.adminSession` without touching the GitHub declaration.
 */
export const adminSessionMiddleware = createMiddleware().server(({ request, next }) => {
  const session = readAdminSession(request);
  return next({ context: { adminSession: session } });
});

export type AdminMiddlewareContext = { adminSession: AdminSessionPayload | null };
