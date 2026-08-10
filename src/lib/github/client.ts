/**
 * GitHub API client — SERVER-ONLY.
 *
 * Thin `fetch` wrapper (no SDK dependency — keeps the bundle minimal and avoids
 * supply-chain surface, consistent with the AI provider layer). Handles:
 * - injecting the cached access token for the current session,
 * - GitHub API version + media-type headers,
 * - rate-limit / 5xx retry with backoff (single retry),
 * - mapping HTTP failures to safe `GitHubResult` failures (never includes the
 *   token or response body secrets in the surfaced message).
 *
 * The access token is NEVER returned to callers; only the parsed JSON body.
 */

import { getCachedToken } from "./auth/session";
import { isGitHubAppConfigured, getGitHubAppConfig } from "./config";
import type { GitHubErrorKind, GitHubFailure, GitHubResult } from "./types";

const GITHUB_API = "https://api.github.com";

export interface GitHubRequestOptions {
  method?: "GET" | "POST" | "PATCH" | "PUT" | "DELETE";
  body?: unknown;
  /** Override the Accept header. */
  accept?: string;
  /** Query params. */
  query?: Record<string, string | number | boolean | undefined>;
  /** Max retries on 5xx / rate-limit (default 1). */
  maxRetries?: number;
}

function fail(kind: GitHubErrorKind, message: string, retryable: boolean): GitHubFailure {
  return { ok: false, kind, message, retryable };
}

/** Resolve the access token for a session id, with a graceful failure. */
function resolveToken(sessionId: string): { ok: true; token: string } | GitHubFailure {
  const cached = getCachedToken(sessionId);
  if (!cached) {
    return fail(
      "auth_required",
      "Your GitHub session expired (server restarted). Please reconnect GitHub.",
      false,
    );
  }
  return { ok: true, token: cached.accessToken };
}

/** Map a non-ok HTTP response to a safe GitHubResult failure. */
async function mapHttpError<T>(
  status: number,
  retryAfter: string | null,
): Promise<GitHubResult<T>> {
  if (status === 401 || status === 403) {
    // 403 can be rate-limit OR forbidden; distinguish by X-RateLimit-Remaining.
    if (status === 403 && retryAfter) {
      return fail("rate_limited", "GitHub API rate limit reached. Try again in a moment.", true);
    }
    return fail("forbidden", "GitHub refused access to this resource.", false);
  }
  if (status === 404) return fail("not_found", "GitHub resource not found.", false);
  if (status === 409) {
    // Stale SHA on a Contents API update/delete — the file changed since read.
    return fail("conflict", "This file changed since you last read it. Reload and retry.", false);
  }
  if (status === 429 || (status === 403 && retryAfter)) {
    return fail("rate_limited", "GitHub API rate limit reached.", true);
  }
  if (status >= 500) {
    return fail("provider_unreachable", "GitHub is unavailable. Try again shortly.", true);
  }
  return fail("unknown", `GitHub request failed (HTTP ${status}).`, false);
}

/** Sleep helper for backoff. */
function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

/**
 * Perform an authenticated GitHub API request for the given session.
 * Returns a discriminated `GitHubResult<T>`.
 */
export async function githubRequest<T>(
  sessionId: string,
  path: string,
  options: GitHubRequestOptions = {},
): Promise<GitHubResult<T>> {
  if (!isGitHubAppConfigured()) {
    return fail(
      "not_configured",
      "GitHub is not configured on this server. Ask the operator to set up the GitHub App.",
      false,
    );
  }
  // Reference config to ensure env is loaded (throws if mis-configured, but the
  // guard above already returned).
  void getGitHubAppConfig();

  const tokenResult = resolveToken(sessionId);
  if (!tokenResult.ok) return tokenResult;

  const url = new URL(path.startsWith("http") ? path : `${GITHUB_API}${path}`);
  if (options.query) {
    for (const [k, v] of Object.entries(options.query)) {
      if (v !== undefined) url.searchParams.set(k, String(v));
    }
  }

  const headers: Record<string, string> = {
    Authorization: `Bearer ${tokenResult.token}`,
    Accept: options.accept ?? "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
  };
  if (options.body !== undefined) headers["Content-Type"] = "application/json";

  const maxRetries = options.maxRetries ?? 1;
  let lastResult: GitHubResult<T> | null = null;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    let res: Response;
    try {
      res = await fetch(url, {
        method: options.method ?? "GET",
        headers,
        body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
      });
    } catch {
      return fail(
        "provider_unreachable",
        "Could not reach GitHub. Check the network and try again.",
        true,
      );
    }

    if (res.status === 204 || res.status === 205) {
      return { ok: true, data: undefined as T };
    }

    if (!res.ok) {
      const retryAfter = res.headers.get("retry-after");
      const isRateLimited = res.status === 429 || (res.status === 403 && retryAfter);
      const isServerError = res.status >= 500;
      lastResult = await mapHttpError<T>(res.status, retryAfter);
      if ((isRateLimited || isServerError) && attempt < maxRetries) {
        // Exponential-ish backoff: 500ms then 1000ms.
        await sleep(500 * (attempt + 1));
        continue;
      }
      // Drain the body to free the connection, then return the mapped failure.
      try {
        await res.text();
      } catch {
        /* ignore */
      }
      return lastResult;
    }

    // Success — parse JSON (GitHub always returns JSON for these endpoints).
    const text = await res.text();
    try {
      const data = text.length > 0 ? (JSON.parse(text) as T) : (undefined as T);
      return { ok: true, data };
    } catch {
      return fail("unknown", "GitHub returned a malformed response.", false);
    }
  }

  return lastResult ?? fail("unknown", "GitHub request failed.", false);
}
