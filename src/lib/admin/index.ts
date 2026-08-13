/**
 * Admin layer public surface.
 *
 * Import paths:
 * - Client code (admin routes): import from "@/lib/admin/useAdminAuth" and
 *   "@/lib/admin/types" only. Safe for the client bundle — no secrets, no
 *   config, no server code.
 * - Server-only code: import config / server/* directly from their modules
 *   (never re-exported here, so the client can't pull them in).
 *
 * Mirrors the GitHub layer's import-protection discipline.
 */

export type {
  AdminAuthStatus,
  AdminLoginResult,
  AdminLoginSuccess,
  AdminAuthFailure,
  AdminAuthFailureKind,
  AdminSessionPayload,
} from "./types";

// Client hook — safe for the client bundle (imports only RPC fetcher stubs +
// public types). Re-exported here for ergonomic `import { useAdminAuth }`.
export { useAdminAuth } from "./useAdminAuth";
export type { UseAdminAuthApi, UseAdminAuthState } from "./useAdminAuth";
