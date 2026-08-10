/**
 * GitHub OAuth web-application flow — SERVER-ONLY.
 *
 * Standard GitHub OAuth flow (works for GitHub Apps and OAuth Apps):
 *   1. `buildAuthorizationUrl(state)` — redirect the user to GitHub.
 *   2. GitHub calls back `GITHUB_APP_CALLBACK_URL` with `?code=...`.
 *   3. `exchangeCodeForToken(code)` — POST to GitHub, receive an access token.
 *   4. `fetchAuthenticatedUser(token)` — GET `/user` for the login.
 *
 * No fake implementation: when GitHub App credentials are missing, every step
 * throws a `not_configured` error that the RPC layer maps to a real failure.
 *
 * Security:
 * - `state` is a signed random value to prevent CSRF on the redirect.
 * - The access token is NEVER returned to the client; it goes straight into the
 *   server-side token cache via `session.cacheToken`.
 * - No credentials or tokens are logged.
 */

import { randomUUID, createHmac, timingSafeEqual } from "node:crypto";
import { getGitHubAppConfig, getSessionSigningKey } from "../config";
import { cacheToken } from "./session";
import type { GitHubTokenSet } from "../types";

const GITHUB_OAUTH_AUTHORIZE = "https://github.com/login/oauth/authorize";
const GITHUB_OAUTH_ACCESS_TOKEN = "https://github.com/login/oauth/access_token";
const GITHUB_API = "https://api.github.com";

/** A signed CSRF `state` value + its id, separated by `.`. */
export function createState(): string {
  const id = randomUUID();
  const sig = createHmac("sha256", getSessionSigningKey()).update(id).digest("base64url");
  return `${id}.${sig}`;
}

/** Verify a `state` returned by GitHub matches one we issued. */
export function verifyState(state: string | null | undefined): boolean {
  if (!state || typeof state !== "string") return false;
  const dot = state.lastIndexOf(".");
  if (dot <= 0) return false;
  const id = state.slice(0, dot);
  const sig = state.slice(dot + 1);
  let expected: string;
  try {
    expected = createHmac("sha256", getSessionSigningKey()).update(id).digest("base64url");
  } catch {
    return false;
  }
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}

/** Build the GitHub authorization URL to redirect the user to. */
export function buildAuthorizationUrl(state: string): string {
  const cfg = getGitHubAppConfig();
  const params = new URLSearchParams({
    client_id: cfg.clientId,
    redirect_uri: cfg.callbackUrl,
    scope: cfg.scopes.join(" "),
    state,
    allow_signup: "false",
  });
  return `${GITHUB_OAUTH_AUTHORIZE}?${params.toString()}`;
}

interface RawAccessTokenResponse {
  access_token?: string;
  token_type?: string;
  scope?: string;
  error?: string;
  error_description?: string;
  expires_in?: number;
}

/** Exchange the OAuth `code` for an access token (server-to-server). */
export async function exchangeCodeForToken(code: string): Promise<GitHubTokenSet> {
  const cfg = getGitHubAppConfig();
  const body = new URLSearchParams({
    client_id: cfg.clientId,
    client_secret: cfg.clientSecret,
    code,
    redirect_uri: cfg.callbackUrl,
  });

  const res = await fetch(GITHUB_OAUTH_ACCESS_TOKEN, {
    method: "POST",
    headers: { Accept: "application/json", "Content-Type": "application/x-www-form-urlencoded" },
    body: body.toString(),
  });

  if (!res.ok) {
    throw Object.assign(new Error(`GitHub token exchange failed: HTTP ${res.status}`), {
      code: "GITHUB_TOKEN_EXCHANGE_FAILED",
      httpStatus: res.status,
    });
  }

  const json = (await res.json()) as RawAccessTokenResponse;
  if (!json.access_token) {
    throw Object.assign(
      new Error(`GitHub did not return an access token: ${json.error ?? "unknown error"}`),
      { code: "GITHUB_NO_TOKEN", githubError: json.error },
    );
  }

  const accessToken = json.access_token;
  const login = await fetchAuthenticatedLogin(accessToken);
  const tokenSet: GitHubTokenSet = {
    accessToken,
    tokenType: json.token_type ?? "bearer",
    scope: json.scope ?? "",
    login,
    expiresAt: json.expires_in
      ? new Date(Date.now() + json.expires_in * 1000).toISOString()
      : undefined,
  };
  return tokenSet;
}

/** GET /user with the new token — establishes the login name. */
async function fetchAuthenticatedLogin(accessToken: string): Promise<string> {
  const res = await fetch(`${GITHUB_API}/user`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
    },
  });
  if (!res.ok) {
    throw Object.assign(new Error(`GitHub /user failed: HTTP ${res.status}`), {
      code: "GITHUB_USER_FAILED",
      httpStatus: res.status,
    });
  }
  const user = (await res.json()) as { login?: string };
  if (!user.login) throw new Error("GitHub /user response missing login");
  return user.login;
}

/**
 * Complete the flow: exchange code, fetch login, cache the token under a new
 * session id, and return both the session id and login. The caller issues the
 * signed cookie from these.
 */
export async function completeOAuthFlow(code: string): Promise<GitHubTokenSet> {
  const tokenSet = await exchangeCodeForToken(code);
  // The session id is generated in `session.createSessionValue`; but the token
  // cache must be keyed by that same id. To keep the cache and cookie in sync,
  // the RPC handler calls createSessionValue first, then re-caches under the
  // returned sessionId. This helper therefore only returns the token set; the
  // handler wires the sessionId.
  return tokenSet;
}

/** Cache a token under a given sessionId (called by the RPC handler). */
export function storeTokenForSession(sessionId: string, token: GitHubTokenSet): void {
  cacheToken(sessionId, token);
}
