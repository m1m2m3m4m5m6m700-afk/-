/**
 * Write service — SERVER-ONLY. Phase 5 (controlled writes).
 *
 * - `createFile`  — create a new text file on the write branch.
 * - `updateFile`  — update an existing file (SHA-gated; stale SHA → conflict).
 * - `deleteFile`  — delete a file (SHA-gated; more restricted than reads).
 *
 * GitHub's Contents API commits atomically: each call creates a commit on the
 * target branch's ref. So "commit" and "push" are the same operation here —
 * the write lands on the remote AI branch directly. No separate push step, no
 * force push, no branch deletion.
 *
 * Security (enforced BEFORE any GitHub call):
 * - `assertNotSecret(path)` + `hasTraversalSegments` refusal.
 * - Content size cap (1 MB) + text-only (reject null bytes / non-UTF-8).
 * - Branch is ALWAYS the session's `writeBranch` (verified `ai/<slug>` by
 *   `guardWriteBranch` before this service is reached). The default/protected
 *   branch can never be written by construction (`ai/*` ≠ `main`/`master`).
 * - Update/delete require the current file SHA (conflict protection).
 */

import { githubRequest } from "../client";
import {
  assertNotSecret,
  hasTraversalSegments,
  isSecretPath,
  normalizePath,
} from "../secrets-guard";
import type { GitHubFailure, GitHubMutationResult, GitHubResult } from "../types";

/** Max content size (1 MB) — matches the read cap. */
const MAX_CONTENT_BYTES = 1_000_000;

/** Max commit message length. */
const MAX_MESSAGE = 280;

/** Cap branch + path segments so URLs stay bounded. */
const MAX_PATH = 500;

function fail(kind: GitHubFailure["kind"], message: string, retryable: boolean): GitHubFailure {
  return { ok: false, kind, message, retryable };
}

interface RawContentMutation {
  content?: { sha?: string };
  commit?: { sha?: string };
}

/** Encode UTF-8 text to base64 (GitHub Contents API expects base64 content). */
function encodeBase64(text: string): string {
  const bytes = new TextEncoder().encode(text);
  let binary = "";
  for (const b of bytes) binary += String.fromCharCode(b);
  return typeof btoa === "function" ? btoa(binary) : Buffer.from(bytes).toString("base64");
}

/**
 * Shared pre-flight validation for every write op. Returns the normalized path
 * on success, or a failure. Run BEFORE any GitHub fetch.
 */
function validateWritePath(rawPath: string): GitHubResult<string> {
  const path = normalizePath(rawPath);

  // 1. Secrets guard — refuses protected paths before any fetch.
  try {
    assertNotSecret(path);
  } catch {
    return fail(
      "forbidden",
      "Refused to write a protected path. Secrets and configuration files are not editable here.",
      false,
    );
  }

  // 2. Traversal rejection — no `..` segments.
  if (hasTraversalSegments(path)) {
    return fail("validation", "Paths with `..` segments are not allowed.", false);
  }

  if (!path) {
    return fail("validation", "A file path is required.", false);
  }
  if (path.length > MAX_PATH) {
    return fail("validation", `Path is too long (max ${MAX_PATH} chars).`, false);
  }
  return { ok: true, data: path };
}

/** Validate a commit message: bounded length, no control chars. */
function validateMessage(message: string): GitHubResult<string> {
  const msg = message.trim();
  if (!msg) {
    return fail("validation", "A commit message is required.", false);
  }
  if (msg.length > MAX_MESSAGE) {
    return fail("validation", `Commit message is too long (max ${MAX_MESSAGE} chars).`, false);
  }
  // Reject control characters (tabs/newlines allowed in bodies, but keep it simple).
  // eslint-disable-next-line no-control-regex -- intentional: block control chars in commit messages
  if (/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/.test(msg)) {
    return fail("validation", "Commit message contains invalid characters.", false);
  }
  return { ok: true, data: msg };
}

/**
 * Validate file content: size cap + text-only. Rejects content with null bytes
 * (binary) or content exceeding the byte cap.
 */
function validateContent(content: string): GitHubResult<string> {
  if (content.includes("\0")) {
    return fail(
      "validation",
      "Binary content is not supported. Only text files can be written here.",
      false,
    );
  }
  const byteLength = new TextEncoder().encode(content).length;
  if (byteLength > MAX_CONTENT_BYTES) {
    return fail(
      "validation",
      `Content is too large (${byteLength} bytes; max ${MAX_CONTENT_BYTES}).`,
      false,
    );
  }
  return { ok: true, data: content };
}

/** Parse the Contents API mutation response into a public result. */
function parseMutation(
  raw: RawContentMutation,
  path: string,
  branch: string,
): GitHubResult<GitHubMutationResult> {
  const sha = raw.content?.sha ?? null;
  const commitSha = raw.commit?.sha ?? "";
  if (!commitSha) {
    return fail("unknown", "GitHub accepted the write but returned no commit sha.", false);
  }
  return { ok: true, data: { path, sha, commitSha, branch } };
}

/**
 * Create a NEW file on `branch`. Refuses if the file already exists (GitHub
 * returns 422 → mapped to validation). Content is text-only + size-capped.
 */
export async function createFile(
  sessionId: string,
  repo: string,
  branch: string,
  rawPath: string,
  content: string,
  message: string,
): Promise<GitHubResult<GitHubMutationResult>> {
  const pathOk = validateWritePath(rawPath);
  if (!pathOk.ok) return pathOk;
  const path = pathOk.data;

  const msgOk = validateMessage(message);
  if (!msgOk.ok) return msgOk;

  const contentOk = validateContent(content);
  if (!contentOk.ok) return contentOk;

  const result = await githubRequest<RawContentMutation>(
    sessionId,
    `/repos/${repo}/contents/${encodeURIComponent(path)}`,
    {
      method: "PUT",
      body: {
        message: msgOk.data,
        content: encodeBase64(contentOk.data),
        branch,
      },
    },
  );
  if (!result.ok) {
    // 422 from GitHub on PUT = file already exists.
    if (result.kind === "unknown") {
      return fail("validation", "This file already exists. Use update instead.", false);
    }
    return result;
  }
  return parseMutation(result.data, path, branch);
}

/**
 * Update an EXISTING file on `branch`. Requires the current `sha` — if it is
 * stale (file changed since read), GitHub returns 409 → `conflict`. Never
 * overwrites blindly.
 */
export async function updateFile(
  sessionId: string,
  repo: string,
  branch: string,
  rawPath: string,
  content: string,
  message: string,
  sha: string,
): Promise<GitHubResult<GitHubMutationResult>> {
  const pathOk = validateWritePath(rawPath);
  if (!pathOk.ok) return pathOk;
  const path = pathOk.data;

  const msgOk = validateMessage(message);
  if (!msgOk.ok) return msgOk;

  const contentOk = validateContent(content);
  if (!contentOk.ok) return contentOk;

  if (!sha || typeof sha !== "string") {
    return fail("validation", "The current file SHA is required to update.", false);
  }

  const result = await githubRequest<RawContentMutation>(
    sessionId,
    `/repos/${repo}/contents/${encodeURIComponent(path)}`,
    {
      method: "PUT",
      body: {
        message: msgOk.data,
        content: encodeBase64(contentOk.data),
        sha,
        branch,
      },
    },
  );
  if (!result.ok) return result;
  return parseMutation(result.data, path, branch);
}

/**
 * Delete a file on `branch`. More restricted than reads:
 * - secret paths refused (assertNotSecret + isSecretPath double-check),
 * - repo configuration files (`.github/`, `CODEOWNERS`, workflow files) refused,
 * - requires the current SHA (conflict protection).
 * Never deletes branches or the repository — that's not possible via this API.
 */
const PROTECTED_DELETE_PATTERNS = [
  /^\.github\//, // workflow + settings
  /^\.gitlab-ci/,
  /^CODEOWNERS$/,
  /^\.circleci\//,
  /^\.travis\.yml$/,
  /^renovate\.json/,
  /^\.renovaterc/,
];

function isProtectedForDelete(path: string): boolean {
  return PROTECTED_DELETE_PATTERNS.some((re) => re.test(path));
}

export async function deleteFile(
  sessionId: string,
  repo: string,
  branch: string,
  rawPath: string,
  message: string,
  sha: string,
): Promise<GitHubResult<GitHubMutationResult>> {
  const pathOk = validateWritePath(rawPath);
  if (!pathOk.ok) return pathOk;
  const path = pathOk.data;

  // Extra delete-time guard: refuse repo configuration files.
  if (isProtectedForDelete(path) || isSecretPath(path)) {
    return fail(
      "forbidden",
      "This file is protected from deletion (repository configuration or secret).",
      false,
    );
  }

  const msgOk = validateMessage(message);
  if (!msgOk.ok) return msgOk;

  if (!sha || typeof sha !== "string") {
    return fail("validation", "The current file SHA is required to delete.", false);
  }

  const result = await githubRequest<RawContentMutation>(
    sessionId,
    `/repos/${repo}/contents/${encodeURIComponent(path)}`,
    {
      method: "DELETE",
      body: { message: msgOk.data, sha, branch },
    },
  );
  if (!result.ok) return result;
  return {
    ok: true,
    data: { path, sha: null, commitSha: result.data.commit?.sha ?? "", branch },
  };
}
