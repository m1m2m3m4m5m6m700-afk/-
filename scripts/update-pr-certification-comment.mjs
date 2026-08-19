#!/usr/bin/env node

const token = process.env.GITHUB_TOKEN;
const repository = process.env.GITHUB_REPOSITORY;
const prNumber = process.env.PR_NUMBER;
const runId = process.env.GITHUB_RUN_ID;

if (!token || !repository || !prNumber || !runId) {
  console.log("PR summary skipped: missing GitHub context.");
  process.exit(0);
}

const apiBase = `https://api.github.com/repos/${repository}`;
const headers = {
  Accept: "application/vnd.github+json",
  Authorization: `Bearer ${token}`,
  "X-GitHub-Api-Version": "2022-11-28",
};

const response = await fetch(`${apiBase}/actions/runs/${runId}/jobs?per_page=100`, { headers });
if (!response.ok) throw new Error(`GitHub jobs API failed: ${response.status}`);
const jobs = (await response.json()).jobs ?? [];

const targets = [
  ["Fast", "Fast gate (static + contracts + policy)"],
  ["Medium", "Medium gate (deep validation)"],
  ["Windows", "Cross-environment smoke (Windows)"],
  ["Full", "Full certification (browser + E2E + build + audit)"],
  ["QR", "QR output certification (portable decoder)"],
];

const formatDuration = (job) => {
  if (!job?.started_at) return "—";
  const end = job.completed_at ? new Date(job.completed_at) : new Date();
  const seconds = Math.max(0, Math.round((end.getTime() - new Date(job.started_at).getTime()) / 1000));
  return `${Math.floor(seconds / 60)}m ${String(seconds % 60).padStart(2, "0")}s`;
};

const line = (label, job) => {
  const passed = job?.conclusion === "success";
  const status = passed ? "✅" : job?.conclusion === "failure" ? "❌" : job?.conclusion === "cancelled" ? "🟡" : "⏳";
  return `${label.padEnd(8)} ${status} ${formatDuration(job)}`;
};

const lines = targets.map(([label, name]) => line(label, jobs.find((job) => job.name === name)));
const certified = targets.every(([, name]) => jobs.find((job) => job.name === name)?.conclusion === "success");

const tests = Number(process.env.TEST_COUNT || 0);
const vulnerabilities = Number(process.env.VULNERABILITIES || 0);
const baselineStatus = process.env.BASELINE_STATUS || "NOT_ESTABLISHED";
const regressionStatus = process.env.REGRESSION_STATUS || "NOT_APPLICABLE";
const baselineId = process.env.BASELINE_ID || "—";

const body = [
  "<!-- flixo-certification-summary -->",
  "## FLIXO Certification",
  "",
  "```text",
  ...lines,
  "```",
  "",
  `Tests: ${tests}`,
  `Vulnerabilities: ${vulnerabilities}`,
  `Baseline: ${baselineStatus}`,
  `Regression: ${regressionStatus}`,
  `Baseline ID: ${baselineId}`,
  "",
  `Verdict: ${certified ? "🟢 CERTIFIED" : "🔴 NOT CERTIFIED"}`,
  `Run: #${runId}`,
  `Commit: ${process.env.GITHUB_SHA ?? "unknown"}`,
].join("\n");

const commentsResponse = await fetch(`${apiBase}/issues/${prNumber}/comments?per_page=100`, { headers });
if (!commentsResponse.ok) throw new Error(`GitHub comments API failed: ${commentsResponse.status}`);
const comments = await commentsResponse.json();
const existing = comments.find((comment) => typeof comment.body === "string" && comment.body.includes("<!-- flixo-certification-summary -->"));

const write = existing
  ? fetch(existing.url, { method: "PATCH", headers: { ...headers, "Content-Type": "application/json" }, body: JSON.stringify({ body }) })
  : fetch(`${apiBase}/issues/${prNumber}/comments`, { method: "POST", headers: { ...headers, "Content-Type": "application/json" }, body: JSON.stringify({ body }) });

const result = await write;
if (!result.ok) throw new Error(`GitHub comment write failed: ${result.status}`);
console.log(existing ? "Updated PR certification summary." : "Created PR certification summary.");
