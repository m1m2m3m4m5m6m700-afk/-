#!/usr/bin/env node

const token = process.env.GITHUB_TOKEN;
const repository = process.env.GITHUB_REPOSITORY;
const runId = process.env.GITHUB_RUN_ID;

const outputPath = ".artifacts/diagnostics/ci-failure-diagnosis.json";

const fs = await import("node:fs");
const path = await import("node:path");

const ensureOutput = (value) => {
  const dir = path.dirname(outputPath);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(outputPath, JSON.stringify(value, null, 2) + "\n");
};

if (!token || !repository || !runId) {
  ensureOutput({
    schemaVersion: 1,
    status: "UNKNOWN",
    reason: "Missing GitHub Actions context; no diagnosis attempted.",
    repairAllowed: false,
  });
  process.exit(0);
}

const headers = {
  Accept: "application/vnd.github+json",
  Authorization: `Bearer ${token}`,
  "X-GitHub-Api-Version": "2022-11-28",
};
const apiBase = `https://api.github.com/repos/${repository}`;

const jobsResponse = await fetch(`${apiBase}/actions/runs/${runId}/jobs?per_page=100`, { headers });
if (!jobsResponse.ok) {
  ensureOutput({
    schemaVersion: 1,
    status: "UNKNOWN",
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
    schemaVersion: 1,
    status: "NO_FAILURE",
    reason: "No failed, cancelled, or timed-out jobs were observed in this run.",
    repairAllowed: false,
    runId,
    jobs: jobs.map((job) => ({ name: job.name, conclusion: job.conclusion })),
  });
  process.exit(0);
}

const ranked = [...terminalJobs].sort((a, b) => {
  const time = (job) => (job.completed_at ? new Date(job.completed_at).getTime() : Number.MAX_SAFE_INTEGER);
  return time(a) - time(b);
});
const firstFailureJob = ranked[0];

const evidenceResponse = await fetch(`${apiBase}/actions/jobs/${firstFailureJob.id}/logs`, { headers });
const rawEvidence = evidenceResponse.ok ? await evidenceResponse.text() : "";
const evidence = rawEvidence.slice(-20000);

const patterns = [
  { id: "lint", source: "code", pattern: /ESLint|no-useless-escape|no-undef|TS\d{3,4}/i, action: "Fix the exact reported lint/type error only; do not change unrelated code." },
  { id: "test", source: "code", pattern: /expect\(|Test timeout|Locator.*not found|received.*expected/i, action: "Reproduce the exact failing test and fix the asserted behavior or test contract." },
  { id: "build", source: "code-or-config", pattern: /Build failed|vite .*error|next .*error|module not found|Cannot find module/i, action: "Inspect the first build error and its dependency/config chain." },
  { id: "dependency-install", source: "environment-or-dependency", pattern: /npm ERR!|npm ci|ECONNRESET|ENOTFOUND|ETIMEDOUT|EAI_AGAIN/i, action: "Treat as dependency/network evidence first; do not modify application code without a second confirming failure." },
  { id: "browser-environment", source: "environment", pattern: /playwright install|browserType\.launch|Chromium launch|executable doesn't exist|Browser.*not found/i, action: "Fix runner/browser provisioning before changing application code." },
  { id: "permissions", source: "ci-config", pattern: /Resource not accessible by integration|HTTP 403|permission denied|Bad credentials/i, action: "Fix GitHub Actions permissions/authentication before changing application code." },
  { id: "yaml", source: "ci-config", pattern: /Invalid workflow file|YAML syntax|Unexpected value/i, action: "Fix workflow YAML only; do not touch product code." },
  { id: "vercel-rate-limit", source: "external-service", pattern: /build-rate-limit|api-deployments-free-per-day|rate.?limit/i, action: "External deployment quota; do not modify product code. Re-run only when the external limit is resolved or bypassed." },
  { id: "timeout-cancel", source: "orchestration", pattern: /operation was canceled|The operation was canceled|timed out/i, action: "Establish whether the cancellation was external, timeout-related, or caused by an upstream failure before any code change." },
];

const matches = patterns.filter((item) => item.pattern.test(evidence));
const uniqueMatches = [...new Map(matches.map((item) => [item.id, item])).values()];

const diagnosis = uniqueMatches.length === 1
  ? {
      status: "DIAGNOSED",
      confidence: "HIGH",
      failureClass: uniqueMatches[0].id,
      source: uniqueMatches[0].source,
      firstFailingJob: firstFailureJob.name,
      firstFailingStep: firstFailureJob.steps?.find((step) => step.conclusion === "failure" || step.conclusion === "cancelled" || step.conclusion === "timed_out")?.name ?? null,
      evidenceExcerpt: evidence.slice(-4000),
      repairAllowed: true,
      repairRule: uniqueMatches[0].action,
    }
  : {
      status: "UNKNOWN",
      confidence: uniqueMatches.length === 0 ? "NONE" : "AMBIGUOUS",
      failureClass: uniqueMatches.length === 0 ? "unknown" : "ambiguous",
      firstFailingJob: firstFailureJob.name,
      evidenceExcerpt: evidence.slice(-4000),
      repairAllowed: false,
      repairRule: "Stop. Gather more evidence from the exact failing step/log and do not guess the root cause.",
    };

ensureOutput({
  schemaVersion: 1,
  generatedAt: new Date().toISOString(),
  repository,
  runId,
  commit: process.env.GITHUB_SHA ?? null,
  terminalJobs: terminalJobs.map((job) => ({ name: job.name, conclusion: job.conclusion, id: job.id })),
  ...diagnosis,
});

console.log(JSON.stringify(diagnosis, null, 2));
