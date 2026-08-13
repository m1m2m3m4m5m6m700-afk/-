/**
 * CSRF RPC fetchers — client-importable.
 *
 * `getCsrfToken` issues a signed CSRF cookie (double-submit pattern) and
 * returns the token to the client, which must echo it back as `x-csrf-token`
 * on every mutating RPC (login, contact, tool request). The server helper
 * (`buildCsrfToken`) lives under `server/` and is imported inside the handler
 * body (stubbed out of the client bundle).
 */

import { createServerFn } from "@tanstack/react-start";
import { buildCsrfToken } from "../../server/security/csrf";

export const getCsrfToken = createServerFn({ method: "GET" }).handler((): { token: string } => {
  const { token, cookieHeader } = buildCsrfToken();
  const headers = new Headers();
  headers.append("Set-Cookie", cookieHeader);
  return new Response(JSON.stringify({ token }), {
    status: 200,
    headers: { ...Object.fromEntries(headers.entries()), "content-type": "application/json" },
  }) as unknown as { token: string };
});
