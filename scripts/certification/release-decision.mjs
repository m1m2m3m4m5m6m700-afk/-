import fs from "node:fs/promises";
import path from "node:path";
import { readAndVerifyGateManifest } from "./verify-gate-manifest.mjs";
import { verifyBaseline } from "./verify-baseline.mjs";

export async function evaluateRelease(tool, {
  root = `.artifacts/${tool}`,
  requiredGates = ["fast", "medium", "correctness", "browser", "stability", "full"],
  expectedCommit = process.env.GITHUB_SHA ?? null,
  expectedRunId = process.env.GITHUB_RUN_ID ?? null,
  baseline = null,
  now = new Date(),
} = {}) {
  const gateResults = [];
  for (const gate of requiredGates) {
    const manifestPath = path.join(root, gate, "gate-manifest.json");
    try {
      const result = await readAndVerifyGateManifest(manifestPath, {
        evidencePath: path.join(root, gate, "gate-evidence.json"),
        expectedCommit,
        expectedRunId,
        now,
      });
      gateResults.push({
        gate,
        status: result.manifest.status,
        valid: result.valid,
        manifestId: result.manifest.manifestId,
        integrity: result.integrity,
        errors: result.errors,
      });
    } catch (error) {
      gateResults.push({ gate, status: "missing", valid: false, errors: [error.message] });
    }
  }

  const baselineResult = baseline
    ? await verifyBaseline({ ...baseline, now })
    : { valid: true, errors: [], skipped: true };

  const rootFailures = gateResults.filter((gate) => !gate.valid);
  const passed = gateResults.filter((gate) => gate.valid && gate.status === "success").length;
  const failed = gateResults.length - passed;
  const releaseStatus = rootFailures.length === 0 && baselineResult.valid ? "CERTIFIED" : "REJECTED";

  const decision = {
    schemaVersion: 1,
    tool,
    timestamp: now.toISOString(),
    commit: expectedCommit,
    runId: expectedRunId,
    gates: gateResults,
    baseline: baselineResult.skipped ? { status: "not-required" } : { valid: baselineResult.valid, errors: baselineResult.errors },
    releaseStatus,
    summary: {
      total: requiredGates.length,
      passed,
      failed,
      rootFailures: rootFailures.map((gate) => gate.gate),
    },
    diagnostics: {
      cascadeFailures: gateResults.filter((gate) => gate.status === "skipped").map((gate) => gate.gate),
      externalChecksAreNonAuthoritative: true,
    },
  };

  const decisionPath = path.join(root, "release", "release-decision.json");
  await fs.mkdir(path.dirname(decisionPath), { recursive: true });
  await fs.writeFile(decisionPath, `${JSON.stringify(decision, null, 2)}\n`, "utf8");
  return decision;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const tool = process.env.TOOL ?? "pdf-merge";
  const requiredGates = (process.env.REQUIRED_GATES ?? "fast,medium,correctness,browser,stability,full").split(",").filter(Boolean);
  const decision = await evaluateRelease(tool, { requiredGates });
  console.log(JSON.stringify(decision, null, 2));
  process.exit(decision.releaseStatus === "CERTIFIED" ? 0 : 1);
}
