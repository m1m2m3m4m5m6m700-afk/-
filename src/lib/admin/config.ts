/** Server-only admin configuration and persistent first-run owner account. */

import { getDb } from "@/lib/server/db/client";
import { isDbConfigured } from "@/lib/server/db/config";
import { adminAccounts } from "@/lib/server/db/schema";

export interface AdminConfig { passwordHash: string; sessionSecret: string; name?: string; email?: string; }
const REQUIRED_VARS = ["ADMIN_PASSWORD_HASH", "ADMIN_SESSION_SECRET"] as const;
let cached: AdminConfig | null = null;
let cachedMissing: string[] | null = null;

function readEnv(name: string): string | undefined {
  if (typeof process === "undefined") return undefined;
  const value = process.env?.[name];
  return value && value.trim().length > 0 ? value.trim() : undefined;
}
function loadEnvConfig(): void {
  if (cached !== null || cachedMissing !== null) return;
  const passwordHash = readEnv("ADMIN_PASSWORD_HASH");
  const sessionSecret = readEnv("ADMIN_SESSION_SECRET");
  const missing: string[] = [];
  if (!passwordHash) missing.push(REQUIRED_VARS[0]);
  if (!sessionSecret) missing.push(REQUIRED_VARS[1]);
  if (missing.length) { cachedMissing = missing; cached = null; return; }
  const resolvedPasswordHash = passwordHash;
  const resolvedSessionSecret = sessionSecret;
  if (!resolvedPasswordHash || !resolvedSessionSecret) { cachedMissing = [...REQUIRED_VARS]; cached = null; return; }
  cached = { passwordHash: resolvedPasswordHash, sessionSecret: resolvedSessionSecret };
  cachedMissing = [];
}
export function isAdminConfigured(): boolean { loadEnvConfig(); return cached !== null; }
export function getMissingAdminConfig(): string[] { loadEnvConfig(); return cachedMissing ?? []; }
export function getAdminConfig(): AdminConfig { loadEnvConfig(); if (!cached) throw new Error("Admin auth is not configured. Missing: " + (cachedMissing ?? []).join(", ")); return cached; }
export async function getAdminConfigAsync(): Promise<AdminConfig | null> { loadEnvConfig(); if (cached) return cached; if (!isDbConfigured()) return null; try { const [account] = await getDb().select().from(adminAccounts).limit(1); if (!account) return null; return { passwordHash: account.passwordHash, sessionSecret: account.sessionSecret, name: account.name, email: account.email }; } catch { return null; } }
export async function isAdminConfiguredAsync(): Promise<boolean> { return (await getAdminConfigAsync()) !== null; }
export async function hasOwnerAccount(): Promise<boolean> { if (!isDbConfigured()) return false; try { const [account] = await getDb().select({ id: adminAccounts.id }).from(adminAccounts).limit(1); return Boolean(account); } catch { return false; } }
export async function createOwnerAccount(input: { name: string; email: string; passwordHash: string; sessionSecret: string }): Promise<boolean> { if (!isDbConfigured()) return false; try { await getDb().insert(adminAccounts).values({ singletonKey: "owner", name: input.name, email: input.email.trim().toLowerCase(), passwordHash: input.passwordHash, sessionSecret: input.sessionSecret }); return true; } catch { return false; } }
export function getAdminSessionSecret(): string { return getAdminConfig().sessionSecret; }
export function resetAdminConfigCache(): void { cached = null; cachedMissing = null; }
