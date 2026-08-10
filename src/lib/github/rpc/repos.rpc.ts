/**
 * GitHub repository RPCs — SERVER-ONLY.
 *
 * - `listRepos`      GET  — repositories the user can access
 * - `selectRepo`     POST — record the selected repo in the session cookie
 * - `getRepoStatus`  GET  — last commit + branch protection for the panel
 *
 * Repo isolation: every read is scoped to the session's selected repo or the
 * `repo` arg validated against the session. Writes go through the session cookie
 * (signed), never to localStorage.
 */

import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { githubSessionMiddleware } from "../auth/githubSession";
import { buildSetCookieHeader, updateSessionSelection } from "../auth/session";
import { getRepoSummary, listRepositories } from "../service/repos";
import { listBranches } from "../service/branches";
import { asResult, guardAuthenticated, guardConfigured, guardRepoSelected } from "../server/guards";
import type { GitHubBranch, GitHubRepository, GitHubRepoSummary, GitHubResult } from "../types";

/** GET — list repositories the authenticated user can access. */
export const listRepos = createServerFn({ method: "GET" })
  .middleware([githubSessionMiddleware])
  .handler(
    ({ context }): GitHubResult<GitHubRepository[]> | Promise<GitHubResult<GitHubRepository[]>> => {
      const notConfigured = guardConfigured();
      if (notConfigured) return asResult<GitHubRepository[]>(notConfigured);

      const auth = guardAuthenticated(context.githubSession ?? null);
      if (!auth.ok) return auth;

      return listRepositories(auth.sessionId);
    },
  );

/** POST — record the selected repo (+ optionally branch) in the session cookie. */
export const selectRepo = createServerFn({ method: "POST" })
  .middleware([githubSessionMiddleware])
  .validator(
    z.object({
      repo: z.string().regex(/^[A-Za-z0-9._-]+\/[A-Za-z0-9._-]+$/, "Must be owner/name"),
      // Git-ref-safe charset: reject '..', leading/trailing slashes, and any
      // char that could inject into a ref path. Guards ref/branch use in both
      // Phase 4 reads and Phase 5 writes (refs/heads/<branch>).
      branch: z
        .string()
        .min(1)
        .max(200)
        .regex(
          /^(?!.*\.\.)(?!.*\/\/)[A-Za-z0-9][A-Za-z0-9._/-]*[A-Za-z0-9]$/,
          "Invalid branch name",
        )
        .optional(),
    }),
  )
  .handler(({ context, data }) => {
    const session = context.githubSession ?? null;
    if (!session) {
      return asResult<{ repo: string; branch: string | null }>({
        ok: false,
        kind: "not_authenticated",
        message: "You are not connected to GitHub.",
        retryable: false,
      });
    }
    // Phase 5.1 hardening: a write branch is scoped to a specific repo. When
    // the selected repo CHANGES, the stale writeBranch must be cleared so a
    // branch created on repo A can never silently apply to repo B. Re-selecting
    // the SAME repo (e.g. just changing the read branch) preserves writeBranch.
    const repoChanged = session.selectedRepo !== data.repo;
    const cookieValue = updateSessionSelection(session, {
      selectedRepo: data.repo,
      selectedBranch: data.branch ?? null,
      writeBranch: repoChanged ? null : session.writeBranch,
    });
    // Return a Response so the browser stores the updated cookie. The body
    // carries the public selection for the client to update its UI.
    const remainingMs = Math.max(0, session.expiresAt - Date.now());
    const headers = new Headers({
      "Set-Cookie": buildSetCookieHeader(cookieValue, remainingMs),
      "content-type": "application/json",
    });
    const body: GitHubResult<{ repo: string; branch: string | null }> = {
      ok: true,
      data: { repo: data.repo, branch: data.branch ?? null },
    };
    return new Response(JSON.stringify(body), { status: 200, headers });
  });

/** GET — repo panel summary (last commit + protection for the selected branch). */
export const getRepoStatus = createServerFn({ method: "GET" })
  .middleware([githubSessionMiddleware])
  .handler(
    ({ context }): GitHubResult<GitHubRepoSummary> | Promise<GitHubResult<GitHubRepoSummary>> => {
      const notConfigured = guardConfigured();
      if (notConfigured) return asResult<GitHubRepoSummary>(notConfigured);

      const auth = guardAuthenticated(context.githubSession ?? null);
      if (!auth.ok) return auth;

      const session = context.githubSession!;
      const repo = guardRepoSelected(session);
      if (!repo.ok) return repo;

      const branch = session.selectedBranch ?? "main";
      return getRepoSummary(auth.sessionId, repo.repo, branch);
    },
  );

/** GET — list branches for the selected repo (used by the branch picker). */
export const listRepoBranches = createServerFn({ method: "GET" })
  .middleware([githubSessionMiddleware])
  .handler(({ context }): GitHubResult<GitHubBranch[]> | Promise<GitHubResult<GitHubBranch[]>> => {
    const auth = guardAuthenticated(context.githubSession ?? null);
    if (!auth.ok) return auth;

    const session = context.githubSession!;
    const repo = guardRepoSelected(session);
    if (!repo.ok) return repo;

    return listBranches(auth.sessionId, repo.repo);
  });
