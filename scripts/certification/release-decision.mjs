import fs from "node:fs/promises";
import path from "node:path";
import { readAndVerifyGateManifest } from "./verify-gate-manifest.mjs";
import { verifyBaseline } from "./verify-baseline.mjs";

async function findManifest(root, gate) {
  let found = null;
  async function walk(dir) {
    if (found) return;
    let entries;
    try { entries = await fs.readdir(dir, { withFileTypes: true }); } catch { return; }
    for (const entry of entries) {
      const file = path.join(dir, entry.name);
      if (entry.isDirectory()) await walk(file);
      else if (entry.name === "gate-manifest.json") {
        const manifest = JSON.parse(await fs.readFile(file, "utf8"));
        if (manifest.gate === gate) { found = { file, manifest }; return; }
      }
    }
  }
  await walk(root);
  return found;
}

export async function evaluateRelease(tool, {
  root = `.artifacts/${tool}`,
  requiredGates = ["fast", "medium", "correctness", "browser", "stability", "full"],
  expectedCommit = process.env.GITHUB_SHA ?? null,
  expectedRunId = process.env.GITHUB_RUN_ID ?? null,
  baseline = null,
  now = new Date(),
} = {}) {
  const gateResults = [];
  let rootFailureSeen = false;

  for (const gate of requiredGates) {
    const located = await findManifest(root, gate);
    if (!located) {
      const failureKind = rootFailureSeen ? "cascade" : "missing-root-gate";
      gateResults.push({ gate, status: "missing", valid: false, failureKind, errors: ["gate manifest missing"] });
      continue;
    }

    const result = await readAndVerifyGateManifest(located.file, {
      evidencePath: path.join(path.dirname(located.file), located.manifest.evidence.file),
      expectedCommit,
      expectedRunId,
      now,
    });
    const rootFailure = located.manifest.status !== "success" && !rootFailureSeen;
    if (rootFailure) rootFailureSeen = true;
    gateResults.push({
      gate,
      status: located.manifest.status,
      valid: result.valid,
      manifestId: located.manifest.manifestId,
      integrity: result.integrity,
      failureKind: result.valid ? null : (rootFailure ? "root" : "cascade"),
      errors: result.errors,
    });
  }

  const baselineResult = baseline
    ? await verifyBaseline({ ...baseline, now })
    : { valid: true, errors: [], skipped: true };
  const rootFailures = gateResults.filter((gate) => gate.failureKind === "root" || gate.failureKind === "missing-root-gate");
  const cascadeFailures = gateResults.filter((gate) => gate.failureKind === "cascade");
  const passed = gateResults.filter((gate) => gate.valid && gate.status === "success").length;
  const releaseStatus = rootFailures.length === 0 && cascadeFailures.length === 0 && baselineResult.valid ? "CERTIFIED" : "REJECTED";

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
      failed: requiredGates.length - passed,
      rootFailures: rootFailures.map((gate) => gate.gate),
      cascadeFailures: cascadeFailures.map((gate) => gate.gate),
    },
    diagnostics: {
      failureMode: rootFailures.length ? "root" : cascadeFailures.length ? "cascade" : "none",
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
  const decision = await evaluateRelease(tool, { requiredGates, root: process.env.ARTIFACT_ROOT ?? `.artifacts/${tool}` });
  console.log(JSON.stringify(decision, null, 2));
  process.exit(decision.releaseStatus === "CERTIFIED" ? 0 : 1);
}
