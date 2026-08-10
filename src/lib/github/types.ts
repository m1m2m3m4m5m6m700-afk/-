/**
 * GitHub layer — shared types.
 *
 * These types are safe for client import: they contain NO tokens, NO secrets,
 * NO installation access tokens. The client only ever sees the public shape of
 * results (repo names, branch names, status). All credentials and access tokens
 * stay server-side (see `client.ts` / `auth/session.ts`).
 *
 * Server-only modules (`config.ts`, `auth/*`, `client.ts`, `service/*`) import
 * additional private types locally and never re-export them here.
 */

/** A repository the authenticated installation can access. */
export interface GitHubRepository {
  id: number;
  /** `owner/name`. */
  fullName: string;
  name: string;
  ownerLogin: string;
  /** True when the token can push to this repo. */
  permissions: {
    admin: boolean;
    maintain: boolean;
    push: boolean;
    pull: boolean;
  };
  defaultBranch: string;
  private: boolean;
  description: string | null;
  updatedAt: string;
}

/** Minimal branch descriptor. */
export interface GitHubBranch {
  name: string;
  commitSha: string;
  protected: boolean;
}

/** A node in a repository file tree (Phase 4 — read-only). */
export interface GitHubFileTreeNode {
  /** Full path from the repo root, e.g. `src/lib/client.ts`. */
  path: string;
  /** `"blob"` = file, `"tree"` = directory. */
  type: "blob" | "tree";
  /** File size in bytes (0 for trees). */
  size: number;
  /** Git mode, e.g. `100644` (file) or `040000` (tree). */
  mode: string;
}

/** Result of reading a single text file (Phase 4 — read-only). */
export interface GitHubFileContent {
  path: string;
  /** File contents as UTF-8 text. Never set for binary/truncated files. */
  content: string | null;
  /** True when the file is not text (binary) — content is omitted. */
  binary: boolean;
  /** True when the file exceeded the read size cap — content is omitted. */
  truncated: boolean;
  /** File size in bytes. */
  size: number;
  /** Git blob sha. */
  sha: string;
  /** Line count when content is present, else 0. */
  lineCount: number;
}

/** A single code-search match (Phase 4 — read-only). */
export interface GitHubSearchMatch {
  /** Full path of the matching file. */
  path: string;
  /** Matching text fragment (one line, GitHub-supplied). Secrets are redacted. */
  fragment: string | null;
}

/** Result of a code search (Phase 4 — read-only). */
export interface GitHubSearchResult {
  /** Total matches GitHub reports (may exceed the returned matches). */
  totalCount: number;
  /** Returned matches (capped). */
  matches: GitHubSearchMatch[];
  /** True when `totalCount` exceeds the returned matches. */
  truncated: boolean;
}

/** Last-commit + status summary for the repo panel. */
export interface GitHubRepoSummary {
  fullName: string;
  defaultBranch: string;
  selectedBranch: string;
  lastCommit: GitHubRepoResult["lastCommit"];
  /** Branch protection flag for the selected branch. */
  branchProtected: boolean;
}

/** Shared last-commit shape (used by summary + standalone commit fetch). */
export interface GitHubRepoResult {
  lastCommit: {
    sha: string;
    message: string;
    author: string;
    date: string;
  } | null;
}

/**
 * Discriminated result used by every GitHub RPC. Mirrors the AI layer pattern:
 * the client maps `ok` / `not ok` onto UI states. Failures carry a `kind` so
 * the UI can render specific messaging (auth required, rate limited, etc.).
 */
export interface GitHubFailure {
  ok: false;
  kind: GitHubErrorKind;
  message: string;
  retryable: boolean;
}

export interface GitHubSuccess<T> {
  ok: true;
  data: T;
}

export type GitHubResult<T> = GitHubSuccess<T> | GitHubFailure;

export type GitHubErrorKind =
  | "not_configured" // GitHub App creds missing on the server.
  | "not_authenticated" // No valid session.
  | "auth_required" // Session present but token lost (e.g. server restart).
  | "repo_not_selected" // Action needs a selected repo but none chosen.
  | "not_found"
  | "forbidden"
  | "rate_limited"
  | "provider_unreachable"
  | "validation"
  | "conflict" // Write rejected because the file SHA is stale (Phase 5).
  | "unknown";

/** Public auth status returned to the client (never includes tokens). */
export interface GitHubAuthStatus {
  configured: boolean;
  authenticated: boolean;
  login: string | null;
  selectedRepo: string | null;
  selectedBranch: string | null;
  /** Active `ai/<slug>` write branch, or null if none is set (Phase 5). */
  writeBranch: string | null;
}

/** Result of the OAuth code exchange — server-only, never sent to client. */
export interface GitHubTokenSet {
  accessToken: string;
  tokenType: string;
  scope: string;
  /** GitHub user login (from `/user`). */
  login: string;
  /** ISO expiry if GitHub provided one, else undefined (tokens don't expire). */
  expiresAt?: string;
}

/** Server-side session payload stored in the signed cookie (no token). */
export interface GitHubSessionPayload {
  /** Random session id; the access token is cached server-side under this key. */
  sessionId: string;
  login: string;
  /** Optional selected repo `owner/name` set after the user picks one. */
  selectedRepo: string | null;
  /** Read branch (may be the default branch). */
  selectedBranch: string | null;
  /**
   * Active write branch for Phase 5 mutations. Always `ai/<slug>` — enforced
   * server-side. `null` means no write branch is active; writes are refused
   * until the user creates one. Distinct from `selectedBranch` (read branch)
   * so reads can target `main` while writes target an AI branch.
   */
  writeBranch: string | null;
  issuedAt: number;
  expiresAt: number;
}

/** Result of a file mutation (create/update/delete). Phase 5 — write. */
export interface GitHubMutationResult {
  /** The path that was changed. */
  path: string;
  /** The new blob sha (create/update) or null (delete). */
  sha: string | null;
  /** The commit sha of the mutation. */
  commitSha: string;
  /** The branch the mutation landed on (always an `ai/*` branch). */
  branch: string;
}

/** A created pull request. Phase 5 — no merge. */
export interface GitHubPullRequest {
  number: number;
  url: string;
  title: string;
  state: "open" | "closed";
  head: string;
  base: string;
}

/** A single changed file in a branch comparison (read-only diff). Phase 5. */
export interface GitHubDiffFile {
  path: string;
  status: "added" | "removed" | "modified" | "renamed";
  additions: number;
  deletions: number;
  /** Redacted unified-diff patch (secret-looking lines masked). */
  patch: string | null;
}
