/**
 * GitHub branch RPCs — SERVER-ONLY.
 *
 * - `createBranch` POST — create an `ai/<slug>` branch off the selected repo's
 *   base branch AND record it as the session's active write branch. Phase 5:
 *   this is the ONLY way to activate a write branch.
 *
 * Dangerous operations (delete branch, force push) are NOT exposed here. They
 * belong to later phases and will be gated behind explicit user confirmation.
 */

import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { githubSessionMiddleware } from "../auth/githubSession";
import { buildSetCookieHeader, updateSessionSelection } from "../auth/session";
import { createAiBranch } from "../service/branches";
import { asResult, guardAuthenticated, guardConfigured, guardRepoSelected } from "../server/guards";
import type { GitHubResult } from "../types";

const createBranchInput = z.object({
  /** Human slug, e.g. "fix-memory-leak" → branch `ai/fix-memory-leak`. */
  slug: z
    .string()
    .min(2)
    .max(80)
    .regex(/^[a-zA-Z0-9][a-zA-Z0-9._-]*$/, "Use letters, numbers, hyphens, dots, underscores."),
  /** Base branch to branch off (defaults to the repo default branch). */
  baseBranch: z
    .string()
    .min(1)
    .max(200)
    .regex(
      /^(?!.*\.\.)(?!.*\/\/)[A-Za-z0-9][A-Za-z0-9._/-]*[A-Za-z0-9]$/,
      "Invalid base branch name",
    ),
});

/** POST — create an ai/<slug> branch off baseBranch and activate it for writes. */
export const createBranch = createServerFn({ method: "POST" })
  .middleware([githubSessionMiddleware])
  .validator(createBranchInput)
  .handler(({ context, data }) => {
    const notConfigured = guardConfigured();
    if (notConfigured) return asResult<{ ref: string; sha: string; branch: string }>(notConfigured);

    const auth = guardAuthenticated(context.githubSession ?? null);
    if (!auth.ok) return auth;

    const session = context.githubSession!;
    const repo = guardRepoSelected(session);
    if (!repo.ok) return repo;

    return (async () => {
      const created = await createAiBranch(auth.sessionId, repo.repo, data.baseBranch, data.slug);
      if (!created.ok) return created;

      // Record the new branch as the session's active write branch. The ref
      // returned is `refs/heads/ai/<slug>`; store the short name `ai/<slug>`.
      const branchName = created.data.ref.replace(/^refs\/heads\//, "");
      const cookieValue = updateSessionSelection(session, { writeBranch: branchName });
      const remainingMs = Math.max(0, session.expiresAt - Date.now());
      const headers = new Headers({
        "Set-Cookie": buildSetCookieHeader(cookieValue, remainingMs),
        "content-type": "application/json",
      });
      const body: GitHubResult<{ ref: string; sha: string; branch: string }> = {
        ok: true,
        data: { ref: created.data.ref, sha: created.data.sha, branch: branchName },
      };
      return new Response(JSON.stringify(body), { status: 200, headers });
    })();
  });
