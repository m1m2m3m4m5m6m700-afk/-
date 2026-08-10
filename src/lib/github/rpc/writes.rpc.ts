/**
 * Write RPCs — client-importable fetchers. Phase 5 (controlled writes).
 *
 * - `createFile` POST — create a new text file on the write branch.
 * - `updateFile` POST — update a file (SHA-gated; stale SHA → conflict).
 * - `deleteFile` POST — delete a file (SHA-gated; protected paths refused).
 *
 * Every op is guarded by `guardConfigured` → `guardAuthenticated` →
 * `guardRepoSelected` → `guardWriteBranch`. The branch is ALWAYS the session's
 * `writeBranch` (verified `ai/<slug>`); the client never supplies a branch. No
 * force push, no branch/repo deletion, no merge.
 */

import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { githubSessionMiddleware } from "../auth/githubSession";
import {
  createFile as createRemoteFile,
  deleteFile as deleteRemoteFile,
  updateFile as updateRemoteFile,
} from "../service/writes";
import {
  asResult,
  guardAuthenticated,
  guardConfigured,
  guardRepoSelected,
  guardWriteBranch,
} from "../server/guards";
import type { GitHubMutationResult, GitHubResult } from "../types";

const pathValidator = z.string().min(1).max(500);
const messageValidator = z.string().min(1).max(280);
const contentValidator = z.string().max(1_000_000);
const shaValidator = z.string().min(1).max(100);

/** POST — create a new file on the write branch. */
export const createFile = createServerFn({ method: "POST" })
  .middleware([githubSessionMiddleware])
  .validator(
    z.object({
      path: pathValidator,
      content: contentValidator,
      message: messageValidator,
    }),
  )
  .handler(
    ({
      context,
      data,
    }): GitHubResult<GitHubMutationResult> | Promise<GitHubResult<GitHubMutationResult>> => {
      const notConfigured = guardConfigured();
      if (notConfigured) return asResult<GitHubMutationResult>(notConfigured);

      const auth = guardAuthenticated(context.githubSession ?? null);
      if (!auth.ok) return auth;

      const session = context.githubSession!;
      const repo = guardRepoSelected(session);
      if (!repo.ok) return repo;

      const wb = guardWriteBranch(session);
      if (!wb.ok) return wb;

      return createRemoteFile(
        auth.sessionId,
        repo.repo,
        wb.branch,
        data.path,
        data.content,
        data.message,
      );
    },
  );

/** POST — update an existing file (SHA-gated). */
export const updateFile = createServerFn({ method: "POST" })
  .middleware([githubSessionMiddleware])
  .validator(
    z.object({
      path: pathValidator,
      content: contentValidator,
      message: messageValidator,
      sha: shaValidator,
    }),
  )
  .handler(
    ({
      context,
      data,
    }): GitHubResult<GitHubMutationResult> | Promise<GitHubResult<GitHubMutationResult>> => {
      const notConfigured = guardConfigured();
      if (notConfigured) return asResult<GitHubMutationResult>(notConfigured);

      const auth = guardAuthenticated(context.githubSession ?? null);
      if (!auth.ok) return auth;

      const session = context.githubSession!;
      const repo = guardRepoSelected(session);
      if (!repo.ok) return repo;

      const wb = guardWriteBranch(session);
      if (!wb.ok) return wb;

      return updateRemoteFile(
        auth.sessionId,
        repo.repo,
        wb.branch,
        data.path,
        data.content,
        data.message,
        data.sha,
      );
    },
  );

/** POST — delete a file (SHA-gated; protected paths refused). */
export const deleteFile = createServerFn({ method: "POST" })
  .middleware([githubSessionMiddleware])
  .validator(
    z.object({
      path: pathValidator,
      message: messageValidator,
      sha: shaValidator,
    }),
  )
  .handler(
    ({
      context,
      data,
    }): GitHubResult<GitHubMutationResult> | Promise<GitHubResult<GitHubMutationResult>> => {
      const notConfigured = guardConfigured();
      if (notConfigured) return asResult<GitHubMutationResult>(notConfigured);

      const auth = guardAuthenticated(context.githubSession ?? null);
      if (!auth.ok) return auth;

      const session = context.githubSession!;
      const repo = guardRepoSelected(session);
      if (!repo.ok) return repo;

      const wb = guardWriteBranch(session);
      if (!wb.ok) return wb;

      return deleteRemoteFile(
        auth.sessionId,
        repo.repo,
        wb.branch,
        data.path,
        data.message,
        data.sha,
      );
    },
  );
