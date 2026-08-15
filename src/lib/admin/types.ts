/** Shared client-safe admin types. */

export interface AdminAuthStatus {
  configured: boolean;
  authenticated: boolean;
  role: "admin" | null;
  setupRequired: boolean;
}

export interface AdminLoginSuccess { ok: true; }
export type AdminAuthFailureKind = "not_configured" | "invalid_credentials" | "not_authenticated" | "setup_unavailable";
export interface AdminAuthFailure { ok: false; kind: AdminAuthFailureKind; message: string; }
export type AdminLoginResult = AdminLoginSuccess | AdminAuthFailure;

export interface AdminSetupSuccess { ok: true; }
export type AdminSetupResult = AdminSetupSuccess | AdminAuthFailure;

export interface AdminSessionPayload {
  sessionId: string;
  role: "admin";
  issuedAt: number;
  expiresAt: number;
}
