/**
 * Admin layer — shared types.
 *
 * These are safe for client import: they contain NO password hashes, NO
 * secrets, NO session secrets. The client only ever sees the public shape of
 * auth status. All credentials stay server-side (`config.ts`, `server/*`).
 */

/** Public admin auth status returned to the client (never includes secrets). */
export interface AdminAuthStatus {
  /** True when the server has both ADMIN_PASSWORD_HASH + ADMIN_SESSION_SECRET. */
  configured: boolean;
  /** True when the request carries a valid, unexpired admin session cookie. */
  authenticated: boolean;
  /** Always "admin" when authenticated, else null. */
  role: "admin" | null;
}

/** Result of a login attempt. */
export interface AdminLoginSuccess {
  ok: true;
}

export type AdminAuthFailureKind = "not_configured" | "invalid_credentials" | "not_authenticated";

export interface AdminAuthFailure {
  ok: false;
  kind: AdminAuthFailureKind;
  message: string;
}

export type AdminLoginResult = AdminLoginSuccess | AdminAuthFailure;

/** Server-side admin session payload stored in the signed cookie (no secret). */
export interface AdminSessionPayload {
  sessionId: string;
  role: "admin";
  issuedAt: number;
  expiresAt: number;
}
