/**
 * Code search service — SERVER-ONLY. Phase 4 (read-only).
 *
 * Searches the selected repository's code via GitHub's code-search endpoint.
 * Secret paths are filtered OUT of the results, and secret-looking fragments
 * are redacted before they ever reach the client.
 *
 * Read-only: this module never modifies any file or ref.
 */

import { githubRequest } from "../client";
import { isSecretPath } from "../secrets-guard";
import type { GitHubFailure, GitHubResult, GitHubSearchMatch, GitHubSearchResult } from "../types";

/** Cap returned matches (GitHub allows up to 100 per page). */
const MAX_MATCHES = 100;

/** Minimum/maximum query length. */
const MIN_QUERY = 2;
const MAX_QUERY = 256;

interface RawSearchItem {
  name: string;
  path: string;
  sha: string;
  text_matches?: Array<{ fragment: string }>;
}

interface RawSearchResponse {
  total_count: number;
  incomplete_results?: boolean;
  items: RawSearchItem[];
}

function fail(kind: GitHubFailure["kind"], message: string, retryable: boolean): GitHubFailure {
  return { ok: false, kind, message, retryable };
}

/** Patterns to redact from search fragments so a snippet never leaks a token. */
const SECRET_SNIPPET_RE =
  /(ghp_[A-Za-z0-9]{36,}|github_pat_[A-Za-z0-9_]{22,}|gho_[A-Za-z0-9]{36,}|ghu_[A-Za-z0-9]{36,}|ghs_[A-Za-z0-9]{36,}|ghr_[A-Za-z0-9]{36,}|AKIA[0-9A-Z]{16}|glpt-[A-Za-z0-9_-]{20,}|xox[baprs]-[A-Za-z0-9-]{10,}|-----BEGIN [A-Z ]*PRIVATE KEY-----[^\n]*)/g;

/** Mask any secret-looking substring in a fragment. */
function redactFragment(fragment: string): string {
  return fragment.replace(SECRET_SNIPPET_RE, "‹redacted›");
}

/**
 * Search `query` within `repo` (owner/name). The query is scoped to the repo
 * via GitHub's `repo:` qualifier so it never crosses repository boundaries.
 */
export async function searchCode(
  sessionId: string,
  repo: string,
  rawQuery: string,
): Promise<GitHubResult<GitHubSearchResult>> {
  const query = rawQuery.trim();
  if (query.length < MIN_QUERY || query.length > MAX_QUERY) {
    return fail("validation", `Search query must be ${MIN_QUERY}-${MAX_QUERY} characters.`, false);
  }

  // Scope the search to the selected repo and request text-match fragments.
  const scopedQuery = `${query} repo:${repo}`;
  const result = await githubRequest<RawSearchResponse>(sessionId, "/search/code", {
    query: { q: scopedQuery, per_page: MAX_MATCHES },
    accept: "application/vnd.github.v3.text-match+json",
  });
  if (!result.ok) return result;

  const matches: GitHubSearchMatch[] = [];
  for (const item of result.data.items) {
    // Never surface secret paths in search results.
    if (isSecretPath(item.path)) continue;
    const fragment =
      item.text_matches && item.text_matches.length > 0
        ? redactFragment(item.text_matches[0].fragment)
        : null;
    matches.push({ path: item.path, fragment });
  }

  return {
    ok: true,
    data: {
      totalCount: result.data.total_count,
      matches,
      truncated:
        Boolean(result.data.incomplete_results) || result.data.total_count > matches.length,
    },
  };
}
