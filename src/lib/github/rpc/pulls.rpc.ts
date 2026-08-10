/**
 * Pull request + diff RPCs — client-importable fetchers. Phase 5.
 *
 * - `createPullRequest` POST — open a PR from the write branch into the repo's
 *   default branch (base fetched server-side). NO merge.
 * - `getDiff`           GET  — read-only diff of the write branch vs the
 *   default branch, with secret paths filtered + patches redacted.
 *
 * Both are guarded by `guardConfigured` → `guardAuthenticated` →
 * `guardRepoSelected` → `guardWriteBranch`. The head is always the session's
 * `writeBranch`; the base is always fetched server-side.
 */

import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { githubSessionMiddleware } from "../auth/githubSession";
import {
  compareBranches as runCompare,
  createPullRequest as runCreatePr,
  getDefaultBranch,
} from "../service/pulls";
import {
  asResult,
  guardAuthenticated,
  guardConfigured,
  guardRepoSelected,
  guardWriteBranch,
} from "../server/guards";
import type { GitHubDiffFile, GitHubPullRequest, GitHubResult } from "../types";

const titleValidator = z.string().min(1).max(280);
const bodyValidator = z.string().max(65000);

/** POST — open a PR from the write branch into the repo default branch. */
export const createPullRequest = createServerFn({ method: "POST" })
  .middleware([githubSessionMiddleware])
  .validator(
    z.object({
      title: titleValidator,
      body: bodyValidator.optional().default(""),
    }),
  )
  .handler(
    ({
      context,
      data,
    }): GitHubResult<GitHubPullRequest> | Promise<GitHubResult<GitHubPullRequest>> => {
      const notConfigured = guardConfigured();
      if (notConfigured) return asResult<GitHubPullRequest>(notConfigured);

      const auth = guardAuthenticated(context.githubSession ?? null);
      if (!auth.ok) return auth;

      const session = context.githubSession!;
      const repo = guardRepoSelected(session);
      if (!repo.ok) return repo;

      const wb = guardWriteBranch(session);
      if (!wb.ok) return wb;

      return runCreatePr(auth.sessionId, repo.repo, wb.branch, data.title, data.body);
    },
  );

/** GET — read-only diff of the write branch vs the repo default branch. */
export const getDiff = createServerFn({ method: "GET" })
  .middleware([githubSessionMiddleware])
  .handler(
    ({
      context,
    }):
      | GitHubResult<{ files: GitHubDiffFile[]; base: string; head: string }>
      | Promise<GitHubResult<{ files: GitHubDiffFile[]; base: string; head: string }>> => {
      const notConfigured = guardConfigured();
      if (notConfigured)
        return asResult<{ files: GitHubDiffFile[]; base: string; head: string }>(notConfigured);

      const auth = guardAuthenticated(context.githubSession ?? null);
      if (!auth.ok) return auth;

      const session = context.githubSession!;
      const repo = guardRepoSelected(session);
      if (!repo.ok) return repo;

      const wb = guardWriteBranch(session);
      if (!wb.ok) return wb;

      return (async () => {
        // Base is the repo's default branch — fetched server-side, never client-supplied.
        const baseResult = await getDefaultBranch(auth.sessionId, repo.repo);
        if (!baseResult.ok) return baseResult;
        return runCompare(auth.sessionId, repo.repo, baseResult.data, wb.branch);
      })();
    },
  );
