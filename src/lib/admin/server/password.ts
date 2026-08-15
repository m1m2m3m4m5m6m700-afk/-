/** Server-only password hashing/verification using Node scrypt. */

import { randomBytes, scryptSync, timingSafeEqual } from "node:crypto";
import { getAdminConfigAsync } from "../config";

const KEYLEN = 64;

export function hashAdminPassword(password: string): string {
  const salt = randomBytes(16);
  const hash = scryptSync(password, salt, KEYLEN);
  return `${salt.toString("hex")}:${hash.toString("hex")}`;
}

function verifyHash(submitted: string, stored: string): boolean {
  const sep = stored.indexOf(":");
  if (sep <= 0 || sep >= stored.length - 1) return false;
  try {
    const salt = Buffer.from(stored.slice(0, sep), "hex");
    const expected = Buffer.from(stored.slice(sep + 1), "hex");
    if (!salt.length || !expected.length) return false;
    const derived = scryptSync(submitted, salt, KEYLEN);
    return derived.length === expected.length && timingSafeEqual(derived, expected);
  } catch {
    return false;
  }
}

/** Verify against env credentials or the persistent first-run owner account. */
export async function verifyAdminPassword(submitted: string): Promise<boolean> {
  if (typeof submitted !== "string" || submitted.length === 0) return false;
  const config = await getAdminConfigAsync();
  return config ? verifyHash(submitted, config.passwordHash) : false;
}
