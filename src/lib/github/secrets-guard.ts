/**
 * Secrets guard — blocks sensitive files from ever reaching the AI agent or
 * being written/committed via the GitHub layer.
 *
 * Used by `service/files.ts` (Phase 5), `service/search` (Phase 4) and the
 * agent's `read_file` / `search_code` / `create_file` / `update_file` tools.
 * Phase 2 ships the guard itself so every later phase imports one canonical
 * policy — no tool re-implements protection.
 *
 * Trust hierarchy (per the brief): System Rules > App Security Rules > User
 * Request > Repository Content. This module encodes the App Security Rules and
 * cannot be overridden by user request or repository content.
 */

/** Basenames that are always secret regardless of path. */
const SECRET_BASENAMES = new Set<string>([
  ".env",
  ".env.local",
  ".env.production",
  ".env.development",
  ".env.staging",
  ".env.test",
  "credentials.json",
  "service-account.json",
  ".npmrc",
  ".pypirc",
  ".netrc",
  ".htpasswd",
  // SSH private keys (no extension) — id_rsa, id_dsa, id_ecdsa, id_ed25519.
  // Detected by basename because they carry no .key/.pem extension.
  "id_rsa",
  "id_dsa",
  "id_ecdsa",
  "id_ed25519",
]);

/** Extensions that are always secret. */
const SECRET_EXTENSIONS = new Set<string>([".pem", ".key", ".p12", ".pfx", ".keystore"]);

/** Path segments that mark a whole directory as secret. */
const SECRET_DIR_SEGMENTS = new Set<string>([".ssh", ".gnupg", ".config", ".aws", ".secrets"]);

/** Globs that look like env files (.env, .env.*, but NOT .env.example). */
const ENV_FILE_RE = /^\.env(\.[a-z0-9_-]+)?$/i;

export interface SecretMatch {
  /** The normalized path that was rejected. */
  path: string;
  /** Why it was rejected — surfaced to the caller, never includes file content. */
  reason: string;
}

/** Normalize a path: trim leading `./`, collapse slashes, lowercase nothing. */
export function normalizePath(rawPath: string): string {
  return rawPath
    .replace(/\\/g, "/")
    .replace(/^\.\//, "")
    .replace(/\/+/g, "/")
    .replace(/^\/+/, "")
    .trim();
}

/**
 * Returns true if a normalized path contains a parent-directory (`..`)
 * segment. GitHub's contents/trees API resolves `..` within the repo, so it
 * cannot escape the repository — but rejecting it makes intent unambiguous,
 * prevents traversal-encoded attempts from diverging between the secrets guard
 * and GitHub's resolution, and hardens against any future local-filesystem use.
 */
export function hasTraversalSegments(path: string): boolean {
  return path.split("/").some((seg) => seg === "..");
}

/**
 * Returns a `SecretMatch` if the path is protected, else `null`.
 * `.env.example` is intentionally ALLOWED (it documents vars without values).
 */
export function findSecretMatch(rawPath: string): SecretMatch | null {
  const path = normalizePath(rawPath);
  if (path.length === 0) return null;

  const segments = path.split("/");
  const basename = segments[segments.length - 1];

  // .env.example / .env.sample are documentation — allowed.
  const isEnvExample = /^\.env\.(example|sample)$/i.test(basename);
  if (isEnvExample) return null;

  if (ENV_FILE_RE.test(basename) || SECRET_BASENAMES.has(basename.toLowerCase())) {
    return { path, reason: "Environment or credentials file" };
  }

  const ext = basename.slice(basename.lastIndexOf(".")).toLowerCase();
  if (SECRET_EXTENSIONS.has(ext)) {
    return { path, reason: "Private key or certificate file" };
  }

  for (const seg of segments) {
    if (SECRET_DIR_SEGMENTS.has(seg.toLowerCase())) {
      return { path, reason: "Secrets directory" };
    }
  }

  // Heuristic: filename literally contains a token-like keyword.
  if (/(^|[_\-.])(secret|private[_-]?key|access[_-]?token|api[_-]?key)([_\-.]|$)/i.test(basename)) {
    return { path, reason: "Filename indicates a secret" };
  }

  return null;
}

/** Convenience boolean. */
export function isSecretPath(rawPath: string): boolean {
  return findSecretMatch(rawPath) !== null;
}

/**
 * Assert a path is safe to read/write/search. Throws a typed error the service
 * layer maps to `forbidden`. Never includes the file's contents in the error.
 */
export function assertNotSecret(rawPath: string): void {
  const match = findSecretMatch(rawPath);
  if (match) {
    const err = new Error(`Refused to access protected path: ${match.path} (${match.reason})`);
    (err as Error & { code?: string }).code = "SECRETS_GUARD";
    throw err;
  }
}
