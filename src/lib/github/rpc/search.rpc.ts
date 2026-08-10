/**
 * Code search RPC — client-importable fetcher. Phase 4 (read-only).
 *
 * - `searchCode` POST — search the selected repo's code (secrets filtered + redacted server-side)
 *
 * Session-scoped: searches only the session's selected repo. No write operations.
 */

import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { githubSessionMiddleware } from "../auth/githubSession";
import { searchCode as runSearch } from "../service/search";
import { asResult, guardAuthenticated, guardConfigured, guardRepoSelected } from "../server/guards";
import type { GitHubResult, GitHubSearchResult } from "../types";

/** POST — search code within the selected repo. */
export const searchCode = createServerFn({ method: "POST" })
  .middleware([githubSessionMiddleware])
  .validator(z.object({ query: z.string().min(2).max(256) }))
  .handler(
    ({
      context,
      data,
    }): GitHubResult<GitHubSearchResult> | Promise<GitHubResult<GitHubSearchResult>> => {
      const notConfigured = guardConfigured();
      if (notConfigured) return asResult<GitHubSearchResult>(notConfigured);

      const auth = guardAuthenticated(context.githubSession ?? null);
      if (!auth.ok) return auth;

      const session = context.githubSession!;
      const repo = guardRepoSelected(session);
      if (!repo.ok) return repo;

      return runSearch(auth.sessionId, repo.repo, data.query);
    },
  );
