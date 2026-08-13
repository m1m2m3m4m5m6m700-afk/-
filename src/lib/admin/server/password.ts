/**
 * Admin password verification — SERVER-ONLY.
 *
 * Uses Node's built-in `scrypt` (no external dependency, no bcrypt) to verify a
 * submitted password against a stored hash. The hash format is:
 *
 *   `<saltHex>:<hashHex>`
 *
 * where both halves are hex-encoded and `hashHex` is `scryptSync(password,
 * salt, KEYLEN)` with the default scrypt parameters (N=16384, r=8, p=1). The
 * operator generates one with, e.g.:
 *
 *   node -e "const{scryptSync,randomBytes}=require('crypto');const s=randomBytes(16).toString('hex');const h=scryptSync(process.argv[1],Buffer.from(s,'hex'),64).toString('hex');console.log(s+':'+h)" 'your-password'
 *
 * The plaintext password is NEVER stored anywhere. Verification is constant
 * time via `timingSafeEqual`. On any malformed stored hash, verification
 * simply fails (never throws credentials) so brute-force probing yields no
 * signal.
 */

import { scryptSync, timingSafeEqual } from "node:crypto";
import { getAdminConfig } from "../config";

const KEYLEN = 64;

function constantTimeEqual(a: Buffer, b: Buffer): boolean {
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

/**
 * Verify a submitted plaintext password against the stored
 * `ADMIN_PASSWORD_HASH` (`<saltHex>:<hashHex>` scrypt). Returns true on match.
 *
 * If the stored hash is malformed (no `:` separator, bad hex), this returns
 * false rather than throwing — a misconfiguration must never open the gate,
 * and must not leak which part is wrong.
 */
export function verifyAdminPassword(submitted: string): boolean {
  let stored: string;
  try {
    stored = getAdminConfig().passwordHash;
  } catch {
    return false;
  }
  if (typeof submitted !== "string" || submitted.length === 0) return false;

  const sep = stored.indexOf(":");
  if (sep <= 0 || sep >= stored.length - 1) return false;
  const saltHex = stored.slice(0, sep);
  const hashHex = stored.slice(sep + 1);

  let salt: Buffer;
  let expected: Buffer;
  try {
    salt = Buffer.from(saltHex, "hex");
    expected = Buffer.from(hashHex, "hex");
  } catch {
    return false;
  }
  if (salt.length === 0 || expected.length === 0) return false;

  let derived: Buffer;
  try {
    derived = scryptSync(submitted, salt, KEYLEN);
  } catch {
    return false;
  }
  return constantTimeEqual(derived, expected);
}
