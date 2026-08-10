/**
 * Repository service — SERVER-ONLY.
 *
 * Read-only repository operations: list repos the authenticated user can
 * access, get the default branch, and a last-commit + status summary for the
 * repo panel. No writes here (Phase 2 is foundation only).
 */

import { githubRequest } from "../client";
import type { GitHubRepository, GitHubRepoSummary, GitHubResult } from "../types";

interface RawRepo {
  id: number;
  full_name: string;
  name: string;
  owner: { login: string };
  permissions?: { admin?: boolean; maintain?: boolean; push?: boolean; pull?: boolean };
  default_branch: string;
  private: boolean;
  description: string | null;
  updated_at: string;
}

interface RawCommit {
  sha: string;
  commit: {
    message: string;
    author: { name: string; date: string };
  };
}

/** Repositories the user can push to, most-recently-updated first. */
export async function listRepositories(
  sessionId: string,
): Promise<GitHubResult<GitHubRepository[]>> {
  const result = await githubRequest<RawRepo[]>(sessionId, "/user/repos", {
    query: {
      affiliation: "owner,collaborator,organization_member",
      sort: "updated",
      direction: "desc",
      per_page: 100,
    },
  });
  if (!result.ok) return result;

  const repos: GitHubRepository[] = result.data.map((r) => ({
    id: r.id,
    fullName: r.full_name,
    name: r.name,
    ownerLogin: r.owner.login,
    permissions: {
      admin: r.permissions?.admin ?? false,
      maintain: r.permissions?.maintain ?? false,
      push: r.permissions?.push ?? false,
      pull: r.permissions?.pull ?? true,
    },
    defaultBranch: r.default_branch,
    private: r.private,
    description: r.description,
    updatedAt: r.updated_at,
  }));
  // Surface repos the user can actually push to first (most useful for dev work).
  repos.sort((a, b) => Number(b.permissions.push) - Number(a.permissions.push));
  return { ok: true, data: repos };
}

/** Last commit on a branch (defaults to the repo default branch). */
export async function getLastCommit(
  sessionId: string,
  repo: string,
  branch: string,
): Promise<GitHubResult<GitHubRepoSummary["lastCommit"]>> {
  const result = await githubRequest<RawCommit>(
    sessionId,
    `/repos/${repo}/commits/${encodeURIComponent(branch)}`,
  );
  if (!result.ok) return result;
  const c = result.data;
  return {
    ok: true,
    data: {
      sha: c.sha,
      message: c.commit.message,
      author: c.commit.author.name,
      date: c.commit.author.date,
    },
  };
}

/** Whether the selected branch is protected. */
export async function isBranchProtected(
  sessionId: string,
  repo: string,
  branch: string,
): Promise<GitHubResult<boolean>> {
  // 404 → not protected (return false); other failures bubble up.
  const result = await githubRequest<unknown>(
    sessionId,
    `/repos/${repo}/branches/${encodeURIComponent(branch)}/protection`,
  );
  if (result.ok) return { ok: true, data: true };
  if (result.kind === "not_found") return { ok: true, data: false };
  return result;
}

/** Combined summary for the repo panel. */
export async function getRepoSummary(
  sessionId: string,
  repo: string,
  branch: string,
): Promise<GitHubResult<GitHubRepoSummary>> {
  const commit = await getLastCommit(sessionId, repo, branch);
  if (!commit.ok) return commit;
  const protectedRes = await isBranchProtected(sessionId, repo, branch);
  if (!protectedRes.ok) return protectedRes;
  return {
    ok: true,
    data: {
      fullName: repo,
      defaultBranch: branch, // caller passes the relevant branch
      selectedBranch: branch,
      lastCommit: commit.data,
      branchProtected: protectedRes.data,
    },
  };
}
