import { mkdir, writeFile } from "node:fs/promises";
import { createHash } from "node:crypto";

await mkdir(".artifacts/incident-drill", { recursive: true });

const raw = [
  "Error: provider returned 503",
  "Authorization: Bearer SHOULD-NOT-SURVIVE",
  "FLIXO_AI_SMOKE_TOKEN=SHOULD-NOT-SURVIVE",
].join("\n");

const sanitized = raw
  .replace(/Bearer\s+[A-Za-z0-9._-]+/gi, "Bearer [REDACTED]")
  .replace(/FLIXO_AI_SMOKE_TOKEN=[^\s]+/g, "FLIXO_AI_SMOKE_TOKEN=[REDACTED]");

if (/SHOULD-NOT-SURVIVE/.test(sanitized)) {
  throw new Error("Secret redaction failed");
}

const fingerprint = createHash("sha256").update("provider-503").digest("hex");
const evidence = {
  drill: "IR",
  status: "DRILL-PASS",
  scenario: "provider-503-secret-redaction",
  correlationId: `ir-drill-${fingerprint.slice(0, 12)}`,
  errorFingerprint: fingerprint,
  classification: "external-provider",
  severity: "high",
  sanitized: true,
  autoApply: false,
  requiresHumanReview: true,
  regressionGuard: "validate:regression-prevention",
  timestamp: new Date().toISOString(),
  exactSha: process.env.GITHUB_SHA ?? "local",
};

await writeFile(".artifacts/incident-drill/incident-report.json", JSON.stringify(evidence, null, 2));
console.log(JSON.stringify(evidence, null, 2));
