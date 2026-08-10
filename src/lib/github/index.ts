/**
 * GitHub layer public surface.
 *
 * Import paths:
 * - Client code (hooks, future Developer UI): import from "@/lib/github/useGitHub"
 *   and "@/lib/github/types" only. Safe for the client bundle — no tokens, no
 *   config, no provider code.
 * - Server-only code: import config / auth / client / service directly from
 *   their modules (never re-exported here, so the client can't pull them in).
 *
 * See AGENTS.md → "GitHub layer" for the full architecture.
 */

export type {
  GitHubRepository,
  GitHubBranch,
  GitHubFileTreeNode,
  GitHubFileContent,
  GitHubSearchMatch,
  GitHubSearchResult,
  GitHubRepoSummary,
  GitHubRepoResult,
  GitHubResult,
  GitHubFailure,
  GitHubSuccess,
  GitHubErrorKind,
  GitHubAuthStatus,
  GitHubMutationResult,
  GitHubPullRequest,
  GitHubDiffFile,
} from "./types";

// Client hook — safe for the client bundle (imports only RPC fetcher stubs +
// public types). Re-exported here for ergonomic `import { useGitHub }`.
export { useGitHub } from "./useGitHub";
export type { UseGitHubApi, UseGitHubState } from "./useGitHub";
