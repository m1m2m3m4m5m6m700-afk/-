/**
 * Security request middleware — SERVER-ONLY.
 *
 * A TanStack Start *request* middleware (same shape as `adminSessionMiddleware`
 * and `githubSessionMiddleware`) that reads the CSRF cookie off the incoming
 * `Request` and injects it + client-IP/country/device hints into downstream
 * server-fn context. This is the only way handler bodies can access the raw
 * request (cookie + headers) — `request` is not part of the handler ctx.
 *
 * Lives OUTSIDE `server/` on purpose: RPC fetchers import it at module
 * top-level for `.middleware([securityRequestMiddleware])`, and the
 * import-protection rule forbids client code from importing `server/*`. The
 * secret-bearing helpers (cookie signing/verifying) stay under `server/` and
 * are only invoked here at request time; nothing secret is serialized.
 */

import { createMiddleware } from "@tanstack/react-start";
import { readCsrfCookie } from "../server/security/csrf";
import { getClientIp, getCountry, getDevice, getReferrer } from "../server/security/request";

export interface SecurityRequestContext {
  csrfCookie: string | null;
  clientIp: string | null;
  country: string | null;
  device: string | null;
  referrer: string | null;
}

export const securityRequestMiddleware = createMiddleware().server(({ request, next }) => {
  return next({
    context: {
      csrfCookie: readCsrfCookie(request),
      clientIp: getClientIp(request),
      country: getCountry(request),
      device: getDevice(request),
      referrer: getReferrer(request),
    },
  });
});
