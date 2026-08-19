import fs from "node:fs/promises";
import path from "node:path";
import { verifyEvidenceIntegrity } from "./verify-evidence-integrity.mjs";

export async function verifyBaseline({ baselinePath, provenancePath, now = new Date() }) {
  const errors = [];
  let baseline;
  let provenance;
  try {
    baseline = JSON.parse(await fs.readFile(baselinePath, "utf8"));
  } catch (error) {
    return { valid: false, errors: [`baseline unreadable: ${error.message}`] };
  }
  try {
    provenance = JSON.parse(await fs.readFile(provenancePath, "utf8"));
  } catch (error) {
    return { valid: false, errors: [`provenance unreadable: ${error.message}`] };
  }

  if (baseline.status !== "certified" || baseline.verdict !== "CERTIFIED") errors.push("baseline is not certified");
  if (baseline.promotion?.immutable !== true) errors.push("baseline is not immutable");
  if (baseline.baselineId !== provenance.baselineId) errors.push("baselineId mismatch");
  if (baseline.tool !== provenance.tool) errors.push("tool mismatch");
  if (provenance.immutable !== true) errors.push("provenance is not immutable");
  const expiry = new Date(baseline.expiresAt ?? provenance.expiresAt ?? "invalid");
  if (!Number.isFinite(expiry.getTime()) || expiry.getTime() <= now.getTime()) errors.push("baseline expired");
  if (!baseline.certifiedCommit || !provenance.sourceCommit) errors.push("certification commit missing");
  if (baseline.certifiedCommit !== provenance.sourceCommit) errors.push("certification commit mismatch");

  const sourceArtifact = provenance.sourceArtifactDigest;
  if (!/^sha256:[a-f0-9]{64}$/.test(sourceArtifact ?? "")) errors.push("source artifact digest invalid");
  if (!/^sha256:[a-f0-9]{64}$/.test(provenance.baselineFileSha256 ? `sha256:${provenance.baselineFileSha256}` : "")) errors.push("baseline file SHA-256 invalid");

  const integrity = {
    baselinePath: path.normalize(baselinePath),
    provenancePath: path.normalize(provenancePath),
    immutable: provenance.immutable === true && baseline.promotion?.immutable === true,
  };

  return { valid: errors.length === 0, errors, baseline, provenance, integrity };
}
