#!/usr/bin/env node

const token = process.env.GITHUB_TOKEN;
const repository = process.env.GITHUB_REPOSITORY;
const runId = process.env.GITHUB_RUN_ID;

const fs = await import("node:fs");
const path = await import("node:path");

const outputPath = ".artifacts/diagnostics/ci-failure-diagnosis.json";
const signaturePath = path.resolve("scripts/ci-error-signatures.json");
const historyPath = path.resolve("history/ci-failures.json");

const ensureOutput = (value) => {
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, JSON.stringify(value, null, 2) + "\n");
};

if (!token || !repository || !runId) {
  ensureOutput({ schemaVersion: 3, status: "UNKNOWN", confidenceScore: 0, reason: "Missing GitHub Actions context; no diagnosis attempted.", repairAllowed: false });
  process.exit(0);
}

const signaturesData = JSON.parse(fs.readFileSync(signaturePath, "utf8"));
const signatures = signaturesData.signatures ?? [];
const defaults = signaturesData.defaults ?? { autoThreshold: 0.9, dryRunThreshold: 0.6, maxConfidence: 0.99, historicalBoostCap: 0.05, ambiguityMargin: 0.15, snapshotLines: 25 };
const history = fs.existsSync(historyPath) ? JSON.parse(fs.readFileSync(historyPath, "utf8")) : { schemaVersion: 1, failures: [] };

const headers = {
  Accept: "application/vnd.github+json",
  Authorization: `Bearer ${token}`,
  "X-GitHub-Api-Version": "2022-11-28",
};
const apiBase = `https://api.github.com/repos/${repository}`;

const normalize = (value) => String(value ?? "")
  .replace(/https?:\/\/[^\s]+/gi, "<URL>")
  .replace(/\/home\/runner\/work\/[\w.-]+\/[\w.-]+/gi, "<WORKSPACE>")
  .replace(/\/Users\/runner\/work\/[\w.-]+\/[\w.-]+/gi, "<WORKSPACE>")
  .replace(/\/[^\s]*\/FLIXO-AI-TOOLS\//g, "<REPO>/")
  .replace(/\b[0-9a-f]{7,40}\b/gi, "<IDENTIFIER>")
  .replace(/\bRun #?\d+\b/gi, "Run <RUN>")
  .replace(/\bline \d+(?::\d+)?\b/gi, "line <LOCATION>")
  .replace(/\bcolumn \d+\b/gi, "column <LOCATION>")
  .replace(/\s+/g, " ")
  .trim();

const escaped = (pattern) => pattern.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const matchesPattern = (signature, text) => signature.patterns.some((pattern) => new RegExp(signature.regex ? pattern : escaped(pattern), "i").test(text));

const jobsResponse = await fetch(`${apiBase}/actions/runs/${runId}/jobs?per_page=100`, { headers });
if (!jobsResponse.ok) {
  ensureOutput({ schemaVersion: 3, status: "UNKNOWN", confidenceScore: 0, reason: `GitHub jobs API failed with HTTP ${jobsResponse.status}; no diagnosis attempted.`, repairAllowed: false, runId });
  process.exit(0);
}

const jobs = (await jobsResponse.json()).jobs ?? [];
const terminalJobs = jobs.filter((job) => ["failure", "cancelled", "timed_out"].includes(job.conclusion));
if (terminalJobs.length === 0) {
  ensureOutput({ schemaVersion: 3, status: "NO_FAILURE", confidenceScore: 0, reason: "No failed, cancelled, or timed-out jobs were observed in this run.", repairAllowed: false, runId, jobs: jobs.map((job) => ({ name: job.name, conclusion: job.conclusion })) });
  process.exit(0);
}

const rankedJobs = [...terminalJobs].sort((a, b) => (a.started_at ? new Date(a.started_at).getTime() : Number.MAX_SAFE_INTEGER) - (b.started_at ? new Date(b.started_at).getTime() : Number.MAX_SAFE_INTEGER));
const firstFailureJob = rankedJobs[0];
const firstFailingStep = firstFailureJob.steps?.find((step) => ["failure", "cancelled", "timed_out"].includes(step.conclusion)) ?? null;

const evidenceResponse = await fetch(`${apiBase}/actions/jobs/${firstFailureJob.id}/logs`, { headers });
const rawEvidence = evidenceResponse.ok ? await evidenceResponse.text() : "";
const evidenceLines = rawEvidence.split(/\r?\n/);
const normalizedMessage = normalize(rawEvidence.slice(-5000));

const signatureMatches = signatures
  .filter((signature) => matchesPattern(signature, rawEvidence))
  .map((signature) => {
    const historyItem = history.failures.find((item) => item.signatureId === signature.id && item.normalizedMessage === normalizedMessage);
    const boost = Math.min(defaults.historicalBoostCap ?? 0.05, historyItem?.confidenceBoost ?? 0);
    return {
      id: signature.id,
      category: signature.category,
      source: signature.source,
      priority: signature.priority ?? 0,
      baseConfidence: signature.confidence ?? 0,
      historicalOccurrences: historyItem?.occurrences ?? 0,
      historicalSimilarity: historyItem ? 1 : 0,
      confidenceScore: Math.min(defaults.maxConfidence ?? 0.99, (signature.confidence ?? 0) + boost),
      repair: signature.repair,
    };
  })
  .sort((a, b) => (b.priority - a.priority) || (b.confidenceScore - a.confidenceScore));

const top = signatureMatches[0] ?? null;
const second = signatureMatches[1] ?? null;
const distinct = Boolean(top && (!second || (top.confidenceScore - second.confidenceScore >= (defaults.ambiguityMargin ?? 0.15))));
const score = top?.confidenceScore ?? 0;
const repairMode = !distinct ? "STOP_AND_GATHER_EVIDENCE" : score >= (defaults.autoThreshold ?? 0.9) ? "AUTO_ALLOWED" : score >= (defaults.dryRunThreshold ?? 0.6) ? "DRY_RUN_ONLY" : "STOP_AND_GATHER_EVIDENCE";

const matchIndex = top ? evidenceLines.findIndex((line) => {
  const signature = signatures.find((item) => item.id === top.id);
  return signature ? matchesPattern(signature, line) : false;
}) : -1;
const center = matchIndex >= 0 ? matchIndex : Math.max(0, evidenceLines.length - 1);
const snapshotLines = defaults.snapshotLines ?? 25;
const evidenceSnapshot = evidenceLines.slice(Math.max(0, center - snapshotLines), Math.min(evidenceLines.length, center + snapshotLines + 1)).join("\n");

const historicalMatches = history.failures
  .map((item) => ({
    signatureId: item.signatureId,
    occurrences: item.occurrences ?? 0,
    similarity: item.normalizedMessage === normalizedMessage ? 1 : item.normalizedMessage && normalizedMessage.includes(item.normalizedMessage) ? 0.8 : 0,
    confidenceBoost: item.confidenceBoost ?? 0,
  }))
  .filter((item) => item.similarity > 0)
  .sort((a, b) => b.similarity - a.similarity)
  .slice(0, 5);

const status = !top ? "UNKNOWN" : !distinct ? "AMBIGUOUS" : "DIAGNOSED";
const repairAllowed = status === "DIAGNOSED" && (repairMode === "AUTO_ALLOWED" || repairMode === "DRY_RUN_ONLY") && !["external-service", "orchestration"].includes(top.source);

const diagnosis = {
  status,
  confidenceScore: score,
  confidenceBand: score >= 0.9 ? "HIGH" : score >= 0.6 ? "MEDIUM" : "LOW",
  failureClass: top?.id ?? (signatureMatches.length ? "ambiguous" : "unknown"),
  category: top?.category ?? null,
  source: top?.source ?? null,
  firstFailingJob: firstFailureJob.name,
  firstFailingStep: firstFailingStep?.name ?? null,
  firstFailingStepConclusion: firstFailingStep?.conclusion ?? null,
  matchedSignatures: signatureMatches.slice(0, 5).map(({ id, category, priority, baseConfidence, confidenceScore, historicalOccurrences }) => ({ id, category, priority, baseConfidence, confidenceScore, historicalOccurrences })),
  historicalMatches,
  normalizedMessage,
  evidenceSnapshot,
  evidenceWindow: { before: snapshotLines, after: snapshotLines },
  repairAllowed,
  repairMode,
  repairRule: repairAllowed ? top.repair : "Do not guess. Preserve the evidence, inspect the exact failing step, and collect additional corroboration before changing code.",
};

if (top && distinct) {
  const now = new Date().toISOString();
  const existing = history.failures.find((item) => item.signatureId === top.id && item.normalizedMessage === normalizedMessage);
  if (existing) {
    existing.lastSeen = now;
    existing.occurrences = (existing.occurrences ?? 0) + 1;
  } else {
    history.failures.push({ signatureId: top.id, normalizedMessage, firstSeen: now, lastSeen: now, occurrences: 1, successfulFixes: 0, confidenceBoost: 0 });
  }
  history.failures = history.failures.slice(-500);
  fs.mkdirSync(path.dirname(historyPath), { recursive: true });
  fs.writeFileSync(historyPath, JSON.stringify(history, null, 2) + "\n");
}

ensureOutput({
  schemaVersion: 3,
  generatedAt: new Date().toISOString(),
  repository,
  runId,
  commit: process.env.GITHUB_SHA ?? null,
  terminalJobs: terminalJobs.map((job) => ({ name: job.name, conclusion: job.conclusion, id: job.id })),
  ...diagnosis,
});

console.log(JSON.stringify(diagnosis, null, 2));
