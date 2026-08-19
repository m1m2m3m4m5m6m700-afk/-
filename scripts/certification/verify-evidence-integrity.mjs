import fs from "node:fs/promises";
import { computeSha256 } from "./create-gate-manifest.mjs";

export async function verifyEvidenceIntegrity(evidencePath, expectedSha256) {
  const stat = await fs.stat(evidencePath);
  const sha256 = await computeSha256(evidencePath);
  return {
    path: evidencePath,
    sizeBytes: stat.size,
    sha256,
    hashMatch: sha256 === expectedSha256,
    valid: sha256 === expectedSha256,
  };
}
