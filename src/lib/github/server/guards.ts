/**
 * Shared helpers for GitHub RPC handlers — SERVER-ONLY.
 *
 * Keeps each RPC handler tiny: they read `context.githubSession` (injected by
 * `githubSessionMiddleware`) and either proceed or return a typed failure.
 */

import { isGitHubAppConfigured } from "../config";
import { getCachedToken, WRITE_BRANCH_PATTERN } from "../auth/session";
import type { GitHubFailure, GitHubResult } from "../types";

export function fail(
  kind: GitHubFailure["kind"],
  message: string,
  retryable: boolean,
): GitHubFailure {
  return { ok: false, kind, message, retryable };
}

/**
 * Guard that the server has GitHub App credentials. Returns a failure when
 * missing, or null when configured (caller proceeds).
 */
export function guardConfigured(): GitHubFailure | null {
  if (!isGitHubAppConfigured()) {
    return fail(
      "not_configured",
      "GitHub is not configured on this server. Ask the operator to set up the GitHub App.",
      false,
    );
  }
  return null;
}

export interface AuthenticatedSession {
  ok: true;
  sessionId: string;
  login: string;
}

/**
 * Guard that the request carries a valid session AND its token is still cached.
 * Returns either the authenticated session or a failure.
 */
export function guardAuthenticated(
  session: { sessionId: string; login: string } | null,
): AuthenticatedSession | GitHubFailure {
  if (!session) {
    return fail("not_authenticated", "You are not connected to GitHub. Please reconnect.", false);
  }
  if (!getCachedToken(session.sessionId)) {
    return fail(
      "auth_required",
      "Your GitHub session expired (server restarted). Please reconnect GitHub.",
      false,
    );
  }
  return { ok: true, sessionId: session.sessionId, login: session.login };
}

export interface SelectedRepo {
  ok: true;
  repo: string;
}

/** Guard that a repo has been selected in the session. */
export function guardRepoSelected(
  session: { selectedRepo: string | null } | null,
): SelectedRepo | GitHubFailure {
  if (!session?.selectedRepo) {
    return fail("repo_not_selected", "Select a repository first.", false);
  }
  return { ok: true, repo: session.selectedRepo };
}

export interface WriteBranch {
  ok: true;
  branch: string;
}

/**
 * Strict pattern for write branches: `ai/<slug>` only. Re-exported from
 * `auth/session` so load-time (verifySessionValue) and write-time
 * (guardWriteBranch) share one source of truth.
 */
export { WRITE_BRANCH_PATTERN } from "../auth/session";

/**
 * Guard that a write branch is active in the session AND matches the strict
 * `ai/<slug>` pattern. Writes are refused until the user creates one.
 */
export function guardWriteBranch(
  session: { writeBranch: string | null } | null,
): WriteBranch | GitHubFailure {
  const branch = session?.writeBranch;
  if (!branch) {
    return fail("validation", "No write branch is active. Create an AI branch first.", false);
  }
  if (!WRITE_BRANCH_PATTERN.test(branch)) {
    // Should never happen (set server-side + validated at cookie load), but
    // defend in depth.
    return fail("forbidden", "The active write branch is invalid. Create a new AI branch.", false);
  }
  return { ok: true, branch };
}

/** Convenience: wrap a guard's failure as a GitHubResult<T> (for typed RPCs). */
export function asResult<T>(failure: GitHubFailure): GitHubResult<T> {
  return failure;
}
