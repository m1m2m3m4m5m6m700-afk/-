/**
 * File service — SERVER-ONLY. Phase 4 (read-only).
 *
 * - `listTree`   — list the file tree of the selected repo/branch.
 * - `readFile`   — read a single text file's contents.
 *
 * Security (enforced BEFORE any GitHub fetch):
 * - Every path passes through `assertNotSecret` (the canonical secrets-guard).
 *   `.env`, `*.pem`, `.ssh/`, `credentials.json`, … are refused with
 *   `forbidden` and their contents are never fetched or returned.
 * - Defense-in-depth: even if a file passes the path check, its decoded text
 *   is scanned for obvious secret patterns (private-key blocks, known token
 *   prefixes). If found, the file is refused as `forbidden` and the content is
 *   NOT returned — so an oddly-named file (e.g. `notes.txt` holding a key)
 *   cannot leak.
 *
 * Read-only: this module never creates, updates, deletes, commits, or pushes.
 */

import { githubRequest } from "../client";
import {
  assertNotSecret,
  hasTraversalSegments,
  isSecretPath,
  normalizePath,
} from "../secrets-guard";
import type { GitHubFailure, GitHubFileContent, GitHubFileTreeNode, GitHubResult } from "../types";

/** Refuse files larger than this (1 MB) — keeps responses small and safe. */
const MAX_READ_BYTES = 1_000_000;

/** Cap the tree listing so a monorepo cannot flood the UI. */
const MAX_TREE_NODES = 2000;

interface RawTree {
  truncated?: boolean;
  tree: RawTreeNode[];
}

interface RawTreeNode {
  path: string;
  type: "blob" | "tree" | "commit";
  size?: number;
  sha: string;
  mode: string;
}

interface RawContent {
  name: string;
  path: string;
  sha: string;
  size: number;
  type: "file" | "dir" | "submodule" | "symlink";
  encoding?: "base64" | "none";
  content?: string;
  target?: string;
}

function fail(kind: GitHubFailure["kind"], message: string, retryable: boolean): GitHubFailure {
  return { ok: false, kind, message, retryable };
}

/**
 * Patterns that indicate a file's *content* is a secret, even if the path
 * passed the path-based guard. Matched defensively on decoded text only.
 */
const SECRET_CONTENT_RE =
  /-----BEGIN (?:RSA |EC |OPENSSH |PGP |DSA )?PRIVATE KEY-----|ghp_[A-Za-z0-9]{36,}|github_pat_[A-Za-z0-9_]{22,}|AKIA[0-9A-Z]{16}|-----BEGIN PRIVATE KEY-----/;

/** Returns true if decoded text looks like it contains a secret. */
function contentLooksSecret(text: string): boolean {
  return SECRET_CONTENT_RE.test(text);
}

/** Decode a base64 content string to UTF-8, tolerating GitHub's line wrapping. */
function decodeBase64Content(raw: string): string {
  // GitHub inserts newlines into base64 content every 76 chars; strip them.
  const clean = raw.replace(/\s/g, "");
  try {
    // Browser-safe atob is available in the Node server runtime.
    const binary =
      typeof atob === "function" ? atob(clean) : Buffer.from(clean, "base64").toString("binary");
    // Convert binary string to UTF-8 without mangling multibyte chars.
    const bytes = Uint8Array.from(binary, (c) => c.charCodeAt(0));
    return new TextDecoder("utf-8", { fatal: false }).decode(bytes);
  } catch {
    return "";
  }
}

/**
 * List the file tree of `repo` at `branch` (recursive). Secret paths are
 * filtered OUT of the result so the UI never advertises them.
 */
export async function listTree(
  sessionId: string,
  repo: string,
  branch: string,
): Promise<GitHubResult<{ nodes: GitHubFileTreeNode[]; truncated: boolean }>> {
  const result = await githubRequest<RawTree>(
    sessionId,
    `/repos/${repo}/git/trees/${encodeURIComponent(branch)}`,
    { query: { recursive: 1 } },
  );
  if (!result.ok) return result;

  const raw = result.data;
  const nodes: GitHubFileTreeNode[] = [];
  for (const t of raw.tree) {
    // Submodules/commits are not navigable files — skip them.
    if (t.type !== "blob" && t.type !== "tree") continue;
    // Never surface secret paths in the tree.
    if (isSecretPath(t.path)) continue;
    nodes.push({
      path: t.path,
      type: t.type === "tree" ? "tree" : "blob",
      size: t.size ?? 0,
      mode: t.mode,
    });
    if (nodes.length >= MAX_TREE_NODES) break;
  }

  return {
    ok: true,
    data: {
      nodes,
      // Truncated when either GitHub truncated the tree OR we hit our cap.
      truncated: Boolean(raw.truncated) || nodes.length >= MAX_TREE_NODES,
    },
  };
}

/**
 * Read a single file at `path` on `branch`. Refuses secret paths before any
 * fetch, and refuses content that looks like a secret after decoding.
 *
 * Returns `binary: true` (no content) for non-text files, and
 * `truncated: true` (no content) for files exceeding the size cap.
 */
export async function readFile(
  sessionId: string,
  repo: string,
  branch: string,
  rawPath: string,
): Promise<GitHubResult<GitHubFileContent>> {
  const path = normalizePath(rawPath);

  // 1. Canonical path-based secrets guard — throws on secret paths.
  try {
    assertNotSecret(path);
  } catch {
    return fail(
      "forbidden",
      `Refused to read a protected path. File contents are never returned for secrets.`,
      false,
    );
  }

  // Reject parent-directory traversal — GitHub sandbox-contains it, but we
  // refuse it explicitly so the resolved path never diverges from the guard.
  if (hasTraversalSegments(path)) {
    return fail("validation", "Paths with `..` segments are not allowed.", false);
  }

  if (!path) {
    return fail("validation", "A file path is required.", false);
  }

  // 2. Fetch the content blob.
  const result = await githubRequest<RawContent>(
    sessionId,
    `/repos/${repo}/contents/${encodeURIComponent(path)}`,
    { query: { ref: branch } },
  );
  if (!result.ok) return result;

  const file = result.data;
  if (file.type !== "file") {
    return fail("validation", "The requested path is not a file.", false);
  }

  // 3. Size cap — never transfer huge file bodies to the client.
  if (file.size > MAX_READ_BYTES) {
    return {
      ok: true,
      data: {
        path,
        content: null,
        binary: false,
        truncated: true,
        size: file.size,
        sha: file.sha,
        lineCount: 0,
      },
    };
  }

  // 4. Decode + classify. No base64 content → binary/submodule/symlink target.
  if (file.encoding !== "base64" || typeof file.content !== "string") {
    return {
      ok: true,
      data: {
        path,
        content: null,
        binary: true,
        truncated: false,
        size: file.size,
        sha: file.sha,
        lineCount: 0,
      },
    };
  }

  const text = decodeBase64Content(file.content);

  // 5. Defense-in-depth: refuse content that looks like a secret.
  if (contentLooksSecret(text)) {
    return fail(
      "forbidden",
      "This file appears to contain private keys or access tokens. Contents are not shown.",
      false,
    );
  }

  return {
    ok: true,
    data: {
      path,
      content: text,
      binary: false,
      truncated: false,
      size: file.size,
      sha: file.sha,
      lineCount: text.length > 0 ? text.split("\n").length : 0,
    },
  };
}
