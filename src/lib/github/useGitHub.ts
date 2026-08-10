/**
 * Client hook for the GitHub Developer layer.
 *
 * Thin wrapper around the server RPCs. Imports ONLY types + RPC fetchers — no
 * config, no tokens, no provider code. Safe for the client bundle.
 *
 * The hook exposes the states every Developer UI panel needs:
 *   - `status`   — { configured, authenticated, login, selectedRepo, selectedBranch }
 *   - `connect()`   — start OAuth login (returns the URL to redirect to)
 *   - `disconnect()` — clear the session
 *   - `repos`    — list + refresh
 *   - `selectRepo(repo, branch?)` — record selection (sets the session cookie)
 *
 * State is local React state; no tokens are stored client-side. The session
 * lives in an HttpOnly cookie the client cannot read.
 */

import { useCallback, useEffect, useState } from "react";
import { getAuthStatus, startLogin, logout } from "./rpc/auth.rpc";
import { createBranch } from "./rpc/branches.rpc";
import { getRepoStatus, listRepoBranches, listRepos, selectRepo } from "./rpc/repos.rpc";
import { listFiles, readFile } from "./rpc/files.rpc";
import { searchCode } from "./rpc/search.rpc";
import { createFile, deleteFile, updateFile } from "./rpc/writes.rpc";
import { createPullRequest, getDiff } from "./rpc/pulls.rpc";
import type {
  GitHubAuthStatus,
  GitHubBranch,
  GitHubDiffFile,
  GitHubFailure,
  GitHubFileContent,
  GitHubFileTreeNode,
  GitHubMutationResult,
  GitHubPullRequest,
  GitHubRepoSummary,
  GitHubRepository,
  GitHubSearchResult,
} from "./types";

/** Return type of `startLogin` (success URL or failure). */
type StartLoginResult = { ok: true; data: { url: string } } | GitHubFailure;

export interface UseGitHubState {
  loading: boolean;
  status: GitHubAuthStatus | null;
  repos: GitHubRepository[];
  reposLoading: boolean;
  /** Branches for the currently selected repo (loaded on demand). */
  branches: GitHubBranch[];
  branchesLoading: boolean;
  /** Last-commit + protection summary for the selected branch. */
  repoSummary: GitHubRepoSummary | null;
  repoSummaryLoading: boolean;
  /** File tree for the selected repo/branch (Phase 4 — read-only). */
  files: GitHubFileTreeNode[];
  filesTruncated: boolean;
  filesLoading: boolean;
  /** Content of the most recently read file (Phase 4 — read-only). */
  fileContent: GitHubFileContent | null;
  fileLoading: boolean;
  /** Last code-search result (Phase 4 — read-only). */
  searchResult: GitHubSearchResult | null;
  searchLoading: boolean;
  /** Phase 5 — last mutation result (create/update/delete). Null until a write succeeds. */
  lastMutation: GitHubMutationResult | null;
  writeLoading: boolean;
  /** Phase 5 — created PR. Null until a PR is opened. */
  pullRequest: GitHubPullRequest | null;
  prLoading: boolean;
  /** Phase 5 — diff of write branch vs default branch (read-only). */
  diffFiles: GitHubDiffFile[];
  diffBase: string | null;
  diffHead: string | null;
  diffLoading: boolean;
  error: string | null;
}

export interface UseGitHubApi extends UseGitHubState {
  refreshStatus: () => Promise<void>;
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
  refreshRepos: () => Promise<void>;
  /** Load branches for a repo (defaults to the session's selected repo). */
  refreshBranches: (repo?: string) => Promise<void>;
  /** Load the repo summary for a branch (defaults to the selected repo/branch). */
  refreshRepoSummary: (repo?: string, branch?: string) => Promise<void>;
  /** Load the file tree for the selected repo/branch (Phase 4). */
  refreshFiles: () => Promise<void>;
  /** Read a single file from the selected repo/branch (Phase 4, secrets-guarded). */
  readFile: (path: string) => Promise<void>;
  /** Search code in the selected repo (Phase 4). */
  searchCode: (query: string) => Promise<void>;
  selectRepo: (repo: string, branch?: string) => Promise<void>;
  /** Phase 5 — create an ai/<slug> branch and activate it for writes. */
  createWriteBranch: (slug: string, baseBranch: string) => Promise<boolean>;
  /** Phase 5 — create a new file on the write branch. */
  createFile: (path: string, content: string, message: string) => Promise<boolean>;
  /** Phase 5 — update a file (SHA-gated). */
  updateFile: (path: string, content: string, message: string, sha: string) => Promise<boolean>;
  /** Phase 5 — delete a file (SHA-gated). */
  deleteFile: (path: string, message: string, sha: string) => Promise<boolean>;
  /** Phase 5 — open a PR from the write branch into the default branch (no merge). */
  createPullRequest: (title: string, body: string) => Promise<boolean>;
  /** Phase 5 — refresh the diff of the write branch vs the default branch. */
  refreshDiff: () => Promise<void>;
}

export function useGitHub(): UseGitHubApi {
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState<GitHubAuthStatus | null>(null);
  const [repos, setRepos] = useState<GitHubRepository[]>([]);
  const [reposLoading, setReposLoading] = useState(false);
  const [branches, setBranches] = useState<GitHubBranch[]>([]);
  const [branchesLoading, setBranchesLoading] = useState(false);
  const [repoSummary, setRepoSummary] = useState<GitHubRepoSummary | null>(null);
  const [repoSummaryLoading, setRepoSummaryLoading] = useState(false);
  const [files, setFiles] = useState<GitHubFileTreeNode[]>([]);
  const [filesTruncated, setFilesTruncated] = useState(false);
  const [filesLoading, setFilesLoading] = useState(false);
  const [fileContent, setFileContent] = useState<GitHubFileContent | null>(null);
  const [fileLoading, setFileLoading] = useState(false);
  const [searchResult, setSearchResult] = useState<GitHubSearchResult | null>(null);
  const [searchLoading, setSearchLoading] = useState(false);
  const [lastMutation, setLastMutation] = useState<GitHubMutationResult | null>(null);
  const [writeLoading, setWriteLoading] = useState(false);
  const [pullRequest, setPullRequest] = useState<GitHubPullRequest | null>(null);
  const [prLoading, setPrLoading] = useState(false);
  const [diffFiles, setDiffFiles] = useState<GitHubDiffFile[]>([]);
  const [diffBase, setDiffBase] = useState<string | null>(null);
  const [diffHead, setDiffHead] = useState<string | null>(null);
  const [diffLoading, setDiffLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refreshStatus = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const s = await getAuthStatus();
      setStatus(s);
    } catch {
      setError("Could not reach the Flixo server.");
    } finally {
      setLoading(false);
    }
  }, []);

  const connect = useCallback(async () => {
    setError(null);
    try {
      const res = (await startLogin()) as StartLoginResult;
      if (res.ok) {
        window.location.href = res.data.url;
        return;
      }
      setError(res.message);
    } catch {
      setError("Could not start GitHub login.");
    }
  }, []);

  const disconnect = useCallback(async () => {
    setError(null);
    try {
      await logout();
      setStatus({
        configured: true,
        authenticated: false,
        login: null,
        selectedRepo: null,
        selectedBranch: null,
        writeBranch: null,
      });
      setRepos([]);
      setBranches([]);
      setRepoSummary(null);
      setFiles([]);
      setFilesTruncated(false);
      setFileContent(null);
      setSearchResult(null);
      setLastMutation(null);
      setPullRequest(null);
      setDiffFiles([]);
      setDiffBase(null);
      setDiffHead(null);
    } catch {
      setError("Could not disconnect.");
    }
  }, []);

  const refreshRepos = useCallback(async () => {
    setReposLoading(true);
    setError(null);
    try {
      const res = await listRepos();
      if (res.ok) {
        setRepos(res.data);
      } else {
        setError(res.message);
        setRepos([]);
      }
    } catch {
      setError("Could not load repositories.");
      setRepos([]);
    } finally {
      setReposLoading(false);
    }
  }, []);

  const refreshBranches = useCallback(async (repo?: string) => {
    setBranchesLoading(true);
    setError(null);
    try {
      const res = await listRepoBranches();
      if (res.ok) {
        setBranches(res.data);
      } else {
        setError(res.message);
        setBranches([]);
      }
    } catch {
      setError(repo ? "Could not load branches." : "Could not load branches.");
      setBranches([]);
    } finally {
      setBranchesLoading(false);
    }
  }, []);

  const refreshRepoSummary = useCallback(async (repo?: string, branch?: string) => {
    setRepoSummaryLoading(true);
    setError(null);
    try {
      const res = await getRepoStatus();
      if (res.ok) {
        setRepoSummary(res.data);
      } else {
        setError(res.message);
        setRepoSummary(null);
      }
    } catch {
      setError("Could not load repository status.");
      setRepoSummary(null);
    } finally {
      setRepoSummaryLoading(false);
    }
  }, []);

  const refreshFiles = useCallback(async () => {
    setFilesLoading(true);
    setError(null);
    try {
      const res = await listFiles();
      if (res.ok) {
        setFiles(res.data.nodes);
        setFilesTruncated(res.data.truncated);
      } else {
        setError(res.message);
        setFiles([]);
        setFilesTruncated(false);
      }
    } catch {
      setError("Could not load the file tree.");
      setFiles([]);
      setFilesTruncated(false);
    } finally {
      setFilesLoading(false);
    }
  }, []);

  const readFileFn = useCallback(async (path: string) => {
    setFileLoading(true);
    setError(null);
    try {
      const res = await readFile({ data: { path } });
      if (res.ok) {
        setFileContent(res.data);
      } else {
        setError(res.message);
        setFileContent(null);
      }
    } catch {
      setError("Could not read the file.");
      setFileContent(null);
    } finally {
      setFileLoading(false);
    }
  }, []);

  const searchCodeFn = useCallback(async (query: string) => {
    setSearchLoading(true);
    setError(null);
    try {
      const res = await searchCode({ data: { query } });
      if (res.ok) {
        setSearchResult(res.data);
      } else {
        setError(res.message);
        setSearchResult(null);
      }
    } catch {
      setError("Could not run the search.");
      setSearchResult(null);
    } finally {
      setSearchLoading(false);
    }
  }, []);

  // selectRepo returns a Response with Set-Cookie; the fetcher resolves it
  // transparently. We refresh status after selecting.
  const selectRepoFn = useCallback(
    async (repo: string, branch?: string) => {
      setError(null);
      try {
        await selectRepo({ data: { repo, branch } });
        await refreshStatus();
      } catch {
        setError("Could not select repository.");
      }
    },
    [refreshStatus],
  );

  // Phase 5 — create an ai/<slug> branch and activate it for writes.
  // Returns true on success. The RPC sets writeBranch in the session cookie;
  // we refresh status so the client sees the new writeBranch.
  const createWriteBranchFn = useCallback(
    async (slug: string, baseBranch: string): Promise<boolean> => {
      setWriteLoading(true);
      setError(null);
      try {
        // createBranch returns a Response (Set-Cookie) on success; the TanStack
        // client resolves it. Parse the JSON body to detect success/failure.
        const res = (await createBranch({ data: { slug, baseBranch } })) as
          { ok: true; data: unknown } | GitHubFailure;
        if (res.ok) {
          await refreshStatus();
          return true;
        }
        setError(res.message);
        return false;
      } catch {
        setError("Could not create the write branch.");
        return false;
      } finally {
        setWriteLoading(false);
      }
    },
    [refreshStatus],
  );

  // Phase 5 — create a new file on the write branch. After success, reload the
  // real tree so the UI reflects the new file (no fake state).
  const createFileFn = useCallback(
    async (path: string, content: string, message: string): Promise<boolean> => {
      setWriteLoading(true);
      setError(null);
      try {
        const res = await createFile({ data: { path, content, message } });
        if (res.ok) {
          setLastMutation(res.data);
          await refreshFiles();
          return true;
        }
        setError(res.message);
        return false;
      } catch {
        setError("Could not create the file.");
        return false;
      } finally {
        setWriteLoading(false);
      }
    },
    [refreshFiles],
  );

  // Phase 5 — update a file (SHA-gated). After success, reload the file content
  // so the UI holds the fresh SHA (prevents a stale-SHA conflict on next edit).
  const updateFileFn = useCallback(
    async (path: string, content: string, message: string, sha: string): Promise<boolean> => {
      setWriteLoading(true);
      setError(null);
      try {
        const res = await updateFile({ data: { path, content, message, sha } });
        if (res.ok) {
          setLastMutation(res.data);
          await readFileFn(path);
          return true;
        }
        setError(res.message);
        return false;
      } catch {
        setError("Could not update the file.");
        return false;
      } finally {
        setWriteLoading(false);
      }
    },
    [readFileFn],
  );

  // Phase 5 — delete a file (SHA-gated). After success, reload the tree.
  const deleteFileFn = useCallback(
    async (path: string, message: string, sha: string): Promise<boolean> => {
      setWriteLoading(true);
      setError(null);
      try {
        const res = await deleteFile({ data: { path, message, sha } });
        if (res.ok) {
          setLastMutation(res.data);
          setFileContent(null);
          await refreshFiles();
          return true;
        }
        setError(res.message);
        return false;
      } catch {
        setError("Could not delete the file.");
        return false;
      } finally {
        setWriteLoading(false);
      }
    },
    [refreshFiles],
  );

  // Phase 5 — open a PR from the write branch into the default branch.
  // No merge. Returns true on success.
  const createPullRequestFn = useCallback(async (title: string, body: string): Promise<boolean> => {
    setPrLoading(true);
    setError(null);
    try {
      const res = await createPullRequest({ data: { title, body } });
      if (res.ok) {
        setPullRequest(res.data);
        return true;
      }
      setError(res.message);
      return false;
    } catch {
      setError("Could not open the pull request.");
      return false;
    } finally {
      setPrLoading(false);
    }
  }, []);

  // Phase 5 — refresh the read-only diff of the write branch vs default branch.
  const refreshDiffFn = useCallback(async () => {
    setDiffLoading(true);
    setError(null);
    try {
      const res = await getDiff();
      if (res.ok) {
        setDiffFiles(res.data.files);
        setDiffBase(res.data.base);
        setDiffHead(res.data.head);
      } else {
        setError(res.message);
        setDiffFiles([]);
        setDiffBase(null);
        setDiffHead(null);
      }
    } catch {
      setError("Could not load the diff.");
      setDiffFiles([]);
      setDiffBase(null);
      setDiffHead(null);
    } finally {
      setDiffLoading(false);
    }
  }, []);

  // Initial status fetch on mount.
  useEffect(() => {
    refreshStatus();
  }, [refreshStatus]);

  return {
    loading,
    status,
    repos,
    reposLoading,
    branches,
    branchesLoading,
    repoSummary,
    repoSummaryLoading,
    files,
    filesTruncated,
    filesLoading,
    fileContent,
    fileLoading,
    searchResult,
    searchLoading,
    lastMutation,
    writeLoading,
    pullRequest,
    prLoading,
    diffFiles,
    diffBase,
    diffHead,
    diffLoading,
    error,
    refreshStatus,
    connect,
    disconnect,
    refreshRepos,
    refreshBranches,
    refreshRepoSummary,
    refreshFiles,
    readFile: readFileFn,
    searchCode: searchCodeFn,
    selectRepo: selectRepoFn,
    createWriteBranch: createWriteBranchFn,
    createFile: createFileFn,
    updateFile: updateFileFn,
    deleteFile: deleteFileFn,
    createPullRequest: createPullRequestFn,
    refreshDiff: refreshDiffFn,
  };
}
