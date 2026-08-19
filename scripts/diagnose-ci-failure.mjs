#!/usr/bin/env node

const token = process.env.GITHUB_TOKEN;
const repository = process.env.GITHUB_REPOSITORY;
const runId = process.env.GITHUB_RUN_ID;

const fs = await import("node:fs");
const path = await import("node:path");

const outputPath = ".artifacts/diagnostics/ci-failure-diagnosis.json";
const signaturePath = path.resolve("scripts/ci-error-signatures.json");

const ensureOutput = (value) => {
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, JSON.stringify(value, null, 2) + "\n");
};

if (!token || !repository || !runId) {
  ensureOutput({
    schemaVersion: 2,
    status: "UNKNOWN",
    confidenceScore: 0,
    reason: "Missing GitHub Actions context; no diagnosis attempted.",
    repairAllowed: false,
  });
  process.exit(0);
}

const signatures = JSON.parse(fs.readFileSync(signaturePath, "utf8")).signatures ?? [];
const headers = {
  Accept: "application/vnd.github+json",
  Authorization: `Bearer ${token}`,
  "X-GitHub-Api-Version": "2022-11-28",
};
const apiBase = `https://api.github.com/repos/${repository}`;

const jobsResponse = await fetch(`${apiBase}/actions/runs/${runId}/jobs?per_page=100`, { headers });
if (!jobsResponse.ok) {
  ensureOutput({
    schemaVersion: 2,
    status: "UNKNOWN",
    confidenceScore: 0,
    reason: `GitHub jobs API failed with HTTP ${jobsResponse.status}; no diagnosis attempted.`,
    repairAllowed: false,
    runId,
  });
  process.exit(0);
}

const jobs = (await jobsResponse.json()).jobs ?? [];
const terminalJobs = jobs.filter((job) => ["failure", "cancelled", "timed_out"].includes(job.conclusion));

if (terminalJobs.length === 0) {
  ensureOutput({
    schemaVersion: 2,
    status: "NO_FAILURE",
    confidenceScore: 0,
    reason: "No failed, cancelled, or timed-out jobs were observed in this run.",
    repairAllowed: false,
    runId,
    jobs: jobs.map((job) => ({ name: job.name, conclusion: job.conclusion })),
  });
  process.exit(0);
}

const ranked = [...terminalJobs].sort((a, b) => {
  const time = (job) => (job.started_at ? new Date(job.started_at).getTime() : Number.MAX_SAFE_INTEGER);
  return time(a) - time(b);
});
const firstFailureJob = ranked[0];
const firstFailingStep = firstFailureJob.steps?.find((step) => ["failure", "cancelled", "timed_out"].includes(step.conclusion)) ?? null;

const evidenceResponse = await fetch(`${apiBase}/actions/jobs/${firstFailureJob.id}/logs`, { headers });
const rawEvidence = evidenceResponse.ok ? await evidenceResponse.text() : "";
const evidenceLines = rawEvidence.split(/\r?\n/);

const signatureMatches = signatures.flatMap((signature) => {
  const regexes = signature.patterns.map((pattern) => new RegExp(signature.regex ? pattern : pattern.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i"));
  const matched = regexes.some((regex) => regex.test(rawEvidence));
  return matched ? [{
    id: signature.id,
    category: signature.category,
    source: signature.source,
    priority: signature.priority,
    confidence: signature.confidence,
    repair: signature.repair,
  }] : [];
});

const matches = signatureMatches.sort((a, b) => b.priority - a.priority);
const uniqueMatches = [...new Map(matches.map((item) => [item.id, item])).values()];

const firstMatchIndex = uniqueMatches[0]
  ? Math.max(0, evidenceLines.findIndex((line) => signatures.find((s) => s.id === uniqueMatches[0].id)?.patterns.some((p) => new RegExp(signatures.find((s) => s.id === uniqueMatches[0].id)?.regex ? p : p.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i").test(line))))
  : -1;
const snapshotStart = firstMatchIndex >= 0 ? Math.max(0, firstMatchIndex - 25) : Math.max(0, evidenceLines.length - 30);
const snapshotEnd = firstMatchIndex >= 0 ? Math.min(evidenceLines.length, firstMatchIndex + 26) : evidenceLines.length;
const evidenceSnapshot = evidenceLines.slice(snapshotStart, snapshotEnd).join("\n");

const sameCategory = uniqueMatches.length > 1 && uniqueMatches[0].category === uniqueMatches[1].category;
const top = uniqueMatches[0] ?? null;
const confidenceScore = top
  ? Math.max(0, Math.min(0.999, sameCategory ? Math.min(top.confidence, 0.89) : top.confidence))
  : 0;

const status = !top
  ? "UNKNOWN"
  : uniqueMatches.length > 1 && !sameCategory
    ? "AMBIGUOUS"
    : "DIAGNOSED";

const repairAllowed = status === "DIAGNOSED" && confidenceScore >= 0.9 && top?.source !== "external-service" && top?.source !== "orchestration";
const repairMode = repairAllowed ? "AUTO_ALLOWED" : confidenceScore >= 0.6 ? "DRY_RUN_ONLY" : "STOP_AND_GATHER_EVIDENCE";

const diagnosis = {
  status,
  confidenceScore,
  confidenceBand: confidenceScore >= 0.9 ? "HIGH" : confidenceScore >= 0.6 ? "MEDIUM" : "LOW",
  failureClass: top?.id ?? (uniqueMatches.length ? "ambiguous" : "unknown"),
  category: top?.category ?? null,
  source: top?.source ?? null,
  firstFailingJob: firstFailureJob.name,
  firstFailingStep: firstFailingStep?.name ?? null,
  firstFailingStepConclusion: firstFailingStep?.conclusion ?? null,
  matchedSignatures: uniqueMatches.map(({ id, category, source, priority, confidence }) => ({ id, category, source, priority, confidence })),
  evidenceSnapshot,
  evidenceWindow: { before: 25, after: 25 },
  repairAllowed,
  repairMode,
  repairRule: repairAllowed
    ? top.repair
    : "Do not guess. Preserve the evidence, inspect the exact failing step, and collect additional corroboration before changing code.",
};

ensureOutput({
  schemaVersion: 2,
  generatedAt: new Date().toISOString(),
  repository,
  runId,
  commit: process.env.GITHUB_SHA ?? null,
  terminalJobs: terminalJobs.map((job) => ({ name: job.name, conclusion: job.conclusion, id: job.id })),
  ...diagnosis,
});

console.log(JSON.stringify(diagnosis, null, 2));
