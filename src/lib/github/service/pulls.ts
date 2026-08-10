/**
 * Pull request + diff service — SERVER-ONLY. Phase 5.
 *
 * - `createPullRequest` — open a PR from the write branch → the repo's default
 *   branch. The base is ALWAYS fetched server-side; the client cannot force a
 *   target. NO merge is exposed or performed.
 * - `compareBranches`    — read-only diff between two branches. Patches are
 *   redacted so secret-looking lines never reach the client.
 *
 * Read-only on the comparison; write-only on PR creation (open, never merge).
 */

import { githubRequest } from "../client";
import { isSecretPath } from "../secrets-guard";
import type { GitHubDiffFile, GitHubFailure, GitHubPullRequest, GitHubResult } from "../types";

/** Cap the number of files shown in a diff (GitHub caps compare at 300). */
const MAX_DIFF_FILES = 100;

function fail(kind: GitHubFailure["kind"], message: string, retryable: boolean): GitHubFailure {
  return { ok: false, kind, message, retryable };
}

interface RawRepo {
  default_branch: string;
}

interface RawPullRequest {
  number: number;
  html_url: string;
  title: string;
  state: "open" | "closed";
  head: { ref: string };
  base: { ref: string };
}

interface RawCompareFile {
  filename: string;
  status: "added" | "removed" | "modified" | "renamed";
  additions: number;
  deletions: number;
  patch?: string;
}

interface RawCompare {
  files?: RawCompareFile[];
}

/**
 * Patterns to redact from diff patches so a secret line never leaks.
 *
 * The PEM pattern captures the FULL block (header → body → END line) across
 * newlines — `[^\n]*` would only mask the `-----BEGIN` header and leave the key
 * body visible. `[\s\S]*?` matches any char (incl. newlines), non-greedily up
 * to the END marker.
 */
const SECRET_PATCH_RE =
  /(ghp_[A-Za-z0-9]{36,}|github_pat_[A-Za-z0-9_]{22,}|gho_[A-Za-z0-9]{36,}|ghu_[A-Za-z0-9]{36,}|ghs_[A-Za-z0-9]{36,}|ghr_[A-Za-z0-9]{36,}|AKIA[0-9A-Z]{16}|glpt-[A-Za-z0-9_-]{20,}|xox[baprs]-[A-Za-z0-9-]{10,}|-----BEGIN [A-Z ]*PRIVATE KEY-----[\s\S]*?-----END [A-Z ]*PRIVATE KEY-----)/g;

/** Mask secret-looking substrings in a patch. */
function redactPatch(patch: string): string {
  return patch.replace(SECRET_PATCH_RE, "‹redacted›");
}

/** Fetch the repo's default branch server-side. */
export async function getDefaultBranch(
  sessionId: string,
  repo: string,
): Promise<GitHubResult<string>> {
  const result = await githubRequest<RawRepo>(sessionId, `/repos/${repo}`);
  if (!result.ok) return result;
  return { ok: true, data: result.data.default_branch };
}

/**
 * Open a pull request from `headBranch` (the write branch) into the repo's
 * default branch. The base is fetched server-side — the client cannot override
 * it. Returns the new PR's public metadata. Does NOT merge.
 */
export async function createPullRequest(
  sessionId: string,
  repo: string,
  headBranch: string,
  title: string,
  body: string,
): Promise<GitHubResult<GitHubPullRequest>> {
  const baseResult = await getDefaultBranch(sessionId, repo);
  if (!baseResult.ok) return baseResult;
  const base = baseResult.data;

  // Refuse opening a PR where head == base (would be a no-op / error).
  if (headBranch === base) {
    return fail("validation", "Cannot open a PR from the default branch into itself.", false);
  }

  const result = await githubRequest<RawPullRequest>(sessionId, `/repos/${repo}/pulls`, {
    method: "POST",
    body: {
      title: title.trim(),
      body: body.trim(),
      head: headBranch,
      base,
    },
  });
  if (!result.ok) return result;

  const pr = result.data;
  return {
    ok: true,
    data: {
      number: pr.number,
      url: pr.html_url,
      title: pr.title,
      state: pr.state,
      head: pr.head.ref,
      base: pr.base.ref,
    },
  };
}

/**
 * Read-only comparison of `headBranch` against `baseBranch`. Returns the
 * changed files with redacted patches. Secret paths are filtered out so the
 * diff never advertises a protected file.
 */
export async function compareBranches(
  sessionId: string,
  repo: string,
  baseBranch: string,
  headBranch: string,
): Promise<GitHubResult<{ files: GitHubDiffFile[]; base: string; head: string }>> {
  const result = await githubRequest<RawCompare>(
    sessionId,
    `/repos/${repo}/compare/${encodeURIComponent(baseBranch)}...${encodeURIComponent(headBranch)}`,
  );
  if (!result.ok) return result;

  const files: GitHubDiffFile[] = [];
  for (const f of result.data.files ?? []) {
    if (isSecretPath(f.filename)) continue;
    if (files.length >= MAX_DIFF_FILES) break;
    files.push({
      path: f.filename,
      status: f.status,
      additions: f.additions,
      deletions: f.deletions,
      patch: f.patch ? redactPatch(f.patch) : null,
    });
  }

  return { ok: true, data: { files, base: baseBranch, head: headBranch } };
}
