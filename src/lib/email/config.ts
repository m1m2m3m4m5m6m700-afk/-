/**
 * Email notification configuration — SERVER-ONLY.
 *
 * Reads SMTP + recipient config from `process.env`. Mirrors the
 * completable-later contract: when SMTP is not configured,
 * `isEmailConfigured()` returns false and `sendNotification` is a no-op that
 * resolves (the message still persists to the DB; the notification is
 * best-effort and never blocks the write path).
 *
 * Env vars:
 *   SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_FROM, NOTIFY_TO
 *
 * No credentials are ever logged or serialized into responses.
 */

const REQUIRED_VARS = ["SMTP_HOST", "SMTP_PORT", "SMTP_FROM", "NOTIFY_TO"];

let cached: Record<string, string | undefined> | null = null;

function readEnv(name: string): string | undefined {
  if (typeof process === "undefined") return undefined;
  const v = process.env?.[name];
  return v && v.trim().length > 0 ? v.trim() : undefined;
}

function load(): void {
  if (cached) return;
  cached = {
    SMTP_HOST: readEnv("SMTP_HOST"),
    SMTP_PORT: readEnv("SMTP_PORT"),
    SMTP_USER: readEnv("SMTP_USER"),
    SMTP_PASS: readEnv("SMTP_PASS"),
    SMTP_FROM: readEnv("SMTP_FROM"),
    NOTIFY_TO: readEnv("NOTIFY_TO"),
  };
}

export function isEmailConfigured(): boolean {
  load();
  if (!cached) return false;
  return REQUIRED_VARS.every((k) => !!cached![k]);
}

export interface EmailConfig {
  host: string;
  port: number;
  user?: string;
  pass?: string;
  from: string;
  notifyTo: string;
}

export function getEmailConfig(): EmailConfig {
  load();
  if (!cached || !isEmailConfigured()) {
    throw new Error("Email is not configured. Missing: " + REQUIRED_VARS.join(", "));
  }
  return {
    host: cached.SMTP_HOST!,
    port: Number(cached.SMTP_PORT!) || 587,
    user: cached.SMTP_USER,
    pass: cached.SMTP_PASS,
    from: cached.SMTP_FROM!,
    notifyTo: cached.NOTIFY_TO!,
  };
}

export function resetEmailConfigCache(): void {
  cached = null;
}
