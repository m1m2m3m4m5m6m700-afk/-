/**
 * Admin auth RPCs — fetchers (client-importable).
 *
 * Endpoints the client calls to manage the admin session:
 *   - `getAdminAuthStatus`  GET   — { configured, authenticated, role }
 *   - `adminLogin`          POST  — verify password, set the signed HttpOnly
 *                                    admin session cookie
 *   - `adminLogout`        POST  — clear the admin session cookie
 *
 * These are `createServerFn` fetchers. Per the project's import-protection
 * rule (files under a server/ directory cannot be imported by client
 * code), this module lives in rpc/ (NOT server/) and exports ONLY fetchers.
 * The server-only helpers (config and modules under server/) are imported
 * inside handler bodies, which TanStack Start stubs out of the client bundle — so no secrets, no `process.env`, no
 * `scrypt`/`createHmac` reach the browser (same pattern as the GitHub RPCs in
 * `src/lib/github/rpc/auth.rpc.ts`).
 *
 * The session cookie is set via a `Response` with `Set-Cookie` (HttpOnly,
 * SameSite=Lax, Secure in prod). The password is verified server-side and
 * NEVER returned to the client; no hash or secret is ever serialized.
 */

import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { isAdminConfigured } from "../config";
import { guardAdminConfigured } from "../server/guards";
import { verifyAdminPassword } from "../server/password";
import {
  buildAdminClearCookieHeader,
  buildAdminSetCookieHeader,
  createAdminSessionValue,
} from "../server/session";
import { adminSessionMiddleware } from "../auth/adminSession";
import type { AdminAuthStatus, AdminLoginResult } from "../types";

/** GET — public admin auth status (no secrets). */
export const getAdminAuthStatus = createServerFn({ method: "GET" })
  .middleware([adminSessionMiddleware])
  .handler(({ context }): AdminAuthStatus => {
    const session = context.adminSession ?? null;
    return {
      configured: isAdminConfigured(),
      authenticated: session !== null,
      role: session?.role ?? null,
    };
  });

/** POST — verify the admin password and set the signed HttpOnly session cookie. */
export const adminLogin = createServerFn({ method: "POST" })
  .validator(
    z.object({
      password: z.string().min(1).max(1024),
    }),
  )
  .handler(({ data }): AdminLoginResult => {
    const notConfigured = guardAdminConfigured();
    if (notConfigured) return notConfigured;

    if (!verifyAdminPassword(data.password)) {
      return {
        ok: false,
        kind: "invalid_credentials",
        message: "Invalid admin credentials.",
      };
    }

    const { value } = createAdminSessionValue();
    // Return a Response that sets the cookie. A 200 (not a redirect) lets the
    // client decide where to navigate next; the cookie lands on the response.
    const headers = new Headers();
    headers.append("Set-Cookie", buildAdminSetCookieHeader(value));
    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: {
        ...Object.fromEntries(headers.entries()),
        "content-type": "application/json",
      },
    }) as unknown as AdminLoginResult;
  });

/** POST — clear the admin session cookie. */
export const adminLogout = createServerFn({ method: "POST" })
  .middleware([adminSessionMiddleware])
  .handler(() => {
    // Works regardless of config (clearing is always safe).
    const headers = new Headers();
    headers.append("Set-Cookie", buildAdminClearCookieHeader());
    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: {
        ...Object.fromEntries(headers.entries()),
        "content-type": "application/json",
      },
    }) as unknown as { ok: true };
  });
