/**
 * Branch service — SERVER-ONLY.
 *
 * List branches + create an `ai/*` working branch off the selected base. This
 * is the first write operation in the GitHub layer and the foundation of the
 * "AI branch → changes → verification → commit → push → PR" strategy.
 *
 * Branch naming convention (per the brief): `ai/<slug>`. The slug is sanitized
 * to GitHub's ref rules and never reuses random names.
 */

import { githubRequest } from "../client";
import type { GitHubBranch, GitHubResult } from "../types";

interface RawBranch {
  name: string;
  commit: { sha: string };
  protected: boolean;
}

interface RawBranchCreation {
  ref: string;
}

/** List branches for a repo. */
export async function listBranches(
  sessionId: string,
  repo: string,
): Promise<GitHubResult<GitHubBranch[]>> {
  const result = await githubRequest<RawBranch[]>(sessionId, `/repos/${repo}/branches`, {
    query: { per_page: 100 },
  });
  if (!result.ok) return result;
  return {
    ok: true,
    data: result.data.map((b) => ({
      name: b.name,
      commitSha: b.commit.sha,
      protected: b.protected,
    })),
  };
}

/** Get a single branch (used to validate the selected branch + fetch its sha). */
export async function getBranch(
  sessionId: string,
  repo: string,
  branch: string,
): Promise<GitHubResult<GitHubBranch>> {
  const result = await githubRequest<RawBranch>(
    sessionId,
    `/repos/${repo}/branches/${encodeURIComponent(branch)}`,
  );
  if (!result.ok) return result;
  return {
    ok: true,
    data: {
      name: result.data.name,
      commitSha: result.data.commit.sha,
      protected: result.data.protected,
    },
  };
}

/**
 * Sanitize a human slug into a valid git ref component.
 * Rules: lowercase, [a-z0-9-], no leading/trailing/consecutive hyphens.
 */
export function sanitizeBranchSlug(raw: string): string {
  return raw
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40);
}

/**
 * Create an `ai/<slug>` branch off `baseBranch`. Returns the new branch ref.
 * If the branch already exists, GitHub returns 422 → mapped to `unknown` with
 * a clear "already exists" message.
 */
export async function createAiBranch(
  sessionId: string,
  repo: string,
  baseBranch: string,
  slug: string,
): Promise<GitHubResult<{ ref: string; sha: string }>> {
  const base = await getBranch(sessionId, repo, baseBranch);
  if (!base.ok) return base;

  const cleanSlug = sanitizeBranchSlug(slug);
  if (!cleanSlug) {
    return {
      ok: false,
      kind: "validation",
      message: "Branch name is empty after sanitization.",
      retryable: false,
    };
  }
  const ref = `refs/heads/ai/${cleanSlug}`;

  const result = await githubRequest<RawBranchCreation>(sessionId, `/repos/${repo}/git/refs`, {
    method: "POST",
    body: { ref, sha: base.data.commitSha },
  });

  if (result.ok) {
    return { ok: true, data: { ref: result.data.ref, sha: base.data.commitSha } };
  }

  // 422 typically means the branch already exists — refine the message.
  if (result.kind === "unknown") {
    return {
      ok: false,
      kind: result.kind,
      message: `Branch ${ref} may already exist, or the base branch is invalid.`,
      retryable: false,
    };
  }
  return result;
}
