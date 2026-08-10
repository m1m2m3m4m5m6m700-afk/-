/**
 * File RPCs — client-importable fetchers. Phase 4 (read-only).
 *
 * - `listFiles`  GET  — file tree of the selected repo/branch
 * - `readFile`   POST — read a single text file (secrets-guarded server-side)
 *
 * Session-scoped: every call is guarded by `guardConfigured` +
 * `guardAuthenticated` + `guardRepoSelected`, and reads only the session's
 * selected repo/branch. No write operations live here.
 */

import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { githubSessionMiddleware } from "../auth/githubSession";
import { listTree, readFile as readRemoteFile } from "../service/files";
import { asResult, guardAuthenticated, guardConfigured, guardRepoSelected } from "../server/guards";
import type { GitHubFileContent, GitHubFileTreeNode, GitHubResult } from "../types";

/** GET — file tree for the selected repo/branch. */
export const listFiles = createServerFn({ method: "GET" })
  .middleware([githubSessionMiddleware])
  .handler(
    ({
      context,
    }):
      | GitHubResult<{ nodes: GitHubFileTreeNode[]; truncated: boolean }>
      | Promise<GitHubResult<{ nodes: GitHubFileTreeNode[]; truncated: boolean }>> => {
      const notConfigured = guardConfigured();
      if (notConfigured)
        return asResult<{ nodes: GitHubFileTreeNode[]; truncated: boolean }>(notConfigured);

      const auth = guardAuthenticated(context.githubSession ?? null);
      if (!auth.ok) return auth;

      const session = context.githubSession!;
      const repo = guardRepoSelected(session);
      if (!repo.ok) return repo;

      const branch = session.selectedBranch ?? "main";
      return listTree(auth.sessionId, repo.repo, branch);
    },
  );

/** POST — read a single file (secrets-guarded). */
export const readFile = createServerFn({ method: "POST" })
  .middleware([githubSessionMiddleware])
  .validator(z.object({ path: z.string().min(1).max(500) }))
  .handler(
    ({
      context,
      data,
    }): GitHubResult<GitHubFileContent> | Promise<GitHubResult<GitHubFileContent>> => {
      const notConfigured = guardConfigured();
      if (notConfigured) return asResult<GitHubFileContent>(notConfigured);

      const auth = guardAuthenticated(context.githubSession ?? null);
      if (!auth.ok) return auth;

      const session = context.githubSession!;
      const repo = guardRepoSelected(session);
      if (!repo.ok) return repo;

      const branch = session.selectedBranch ?? "main";
      return readRemoteFile(auth.sessionId, repo.repo, branch, data.path);
    },
  );
