/**
 * GitHub auth RPCs — SERVER-ONLY.
 *
 * Endpoints the client calls to manage the GitHub connection:
 *   - `getAuthStatus`  GET  — { configured, authenticated, login, selectedRepo/branch }
 *   - `startLogin`     GET  — returns the GitHub authorization URL (client redirects)
 *   - `finishCallback` GET  — OAuth callback: exchanges ?code, sets the session cookie
 *   - `logout`         POST — clears the session cookie + drops the cached token
 *
 * The session cookie is set via a `Response` with `Set-Cookie` (HttpOnly,
 * SameSite=Lax, Secure in prod). The access token NEVER leaves the server.
 */

import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { isGitHubAppConfigured } from "../config";
import {
  buildClearCookieHeader,
  buildSetCookieHeader,
  createSessionValue,
  dropCachedToken,
} from "../auth/session";
import {
  buildAuthorizationUrl,
  completeOAuthFlow,
  createState,
  storeTokenForSession,
  verifyState,
} from "../auth/oauthFlow";
import { githubSessionMiddleware } from "../auth/githubSession";
import type { GitHubAuthStatus } from "../types";

/** GET — public auth status (no secrets). */
export const getAuthStatus = createServerFn({ method: "GET" })
  .middleware([githubSessionMiddleware])
  .handler(({ context }) => {
    const session = context.githubSession ?? null;
    const status: GitHubAuthStatus = {
      configured: isGitHubAppConfigured(),
      authenticated: session !== null,
      login: session?.login ?? null,
      selectedRepo: session?.selectedRepo ?? null,
      selectedBranch: session?.selectedBranch ?? null,
      writeBranch: session?.writeBranch ?? null,
    };
    return status;
  });

/** GET — returns the GitHub authorization URL (or a not_configured failure). */
export const startLogin = createServerFn({ method: "GET" }).handler(() => {
  if (!isGitHubAppConfigured()) {
    return {
      ok: false as const,
      kind: "not_configured" as const,
      message:
        "GitHub is not configured on this server. Ask the operator to set up the GitHub App.",
      retryable: false,
    };
  }
  const state = createState();
  const url = buildAuthorizationUrl(state);
  // NOTE: the `state` is stateless+signed, so we don't need to store it; GitHub
  // echoes it back and `finishCallback` verifies the signature.
  return { ok: true as const, data: { url } };
});

/** GET — OAuth callback. Exchanges the code and sets the session cookie. */
export const finishCallback = createServerFn({ method: "GET" })
  .validator(
    z.object({
      code: z.string().min(1),
      state: z.string().min(1),
    }),
  )
  .handler(async ({ data }) => {
    if (!isGitHubAppConfigured()) {
      return {
        ok: false as const,
        kind: "not_configured" as const,
        message: "GitHub is not configured on this server.",
        retryable: false,
      };
    }
    if (!verifyState(data.state)) {
      return {
        ok: false as const,
        kind: "validation" as const,
        message: "OAuth state mismatch (possible CSRF). Please retry login.",
        retryable: false,
      };
    }

    let tokenSet;
    try {
      tokenSet = await completeOAuthFlow(data.code);
    } catch {
      return {
        ok: false as const,
        kind: "provider_unreachable" as const,
        message: "GitHub rejected the authorization code. Please retry login.",
        retryable: true,
      };
    }

    const { value, payload } = createSessionValue(tokenSet.login);
    storeTokenForSession(payload.sessionId, tokenSet);

    // Return a Response that sets the cookie + redirects to the developer UI.
    const headers = new Headers({ Location: "/developer" });
    headers.append("Set-Cookie", buildSetCookieHeader(value));
    return new Response(null, { status: 302, headers });
  });

/** POST — clears the session cookie and drops the cached token. */
export const logout = createServerFn({ method: "POST" })
  .middleware([githubSessionMiddleware])
  .handler(({ context }) => {
    const session = context.githubSession ?? null;
    if (session) {
      dropCachedToken(session.sessionId);
    }
    const headers = new Headers({ Location: "/developer" });
    headers.append("Set-Cookie", buildClearCookieHeader());
    return new Response(null, { status: 303, headers });
  });
