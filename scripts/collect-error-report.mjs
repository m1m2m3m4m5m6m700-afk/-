import fs from "node:fs/promises";
import crypto from "node:crypto";
import { execFileSync } from "node:child_process";

const outDir = ".artifacts/errors";
const outFile = `${outDir}/error-report.json`;

const readText = async (file) => {
  try { return await fs.readFile(file, "utf8"); } catch { return ""; }
};

const redact = (input) => input
  .replace(/(ghp_|github_pat_|sk-|AIza)[A-Za-z0-9_\-\.]+/g, "[REDACTED]")
  .replace(/(token|secret|password|api[_-]?key)\s*[:=]\s*[^\s,;]+/gi, "$1=[REDACTED]")
  .replace(/Bearer\s+[A-Za-z0-9._\-]+/gi, "Bearer [REDACTED]");

const raw = redact([
  process.env.CI_ERROR_MESSAGE ?? "",
  process.env.CI_ERROR_LOG ?? "",
  await readText(".artifacts/ci-error.txt"),
].filter(Boolean).join("\n"));

const normalized = raw || "No explicit CI error payload was provided; inspect the workflow job log.";
const lower = normalized.toLowerCase();

const type = lower.includes("typescript") || /\bts\d{3,5}\b/.test(lower)
  ? "typecheck"
  : lower.includes("eslint") || lower.includes("lint")
    ? "lint"
    : lower.includes("semgrep") || lower.includes("security") || lower.includes("xss")
      ? "security"
      : lower.includes("playwright") || lower.includes("test failed")
        ? "test"
        : lower.includes("npm ci") || lower.includes("package-lock") || lower.includes("dependency")
          ? "dependency"
          : lower.includes("build") || lower.includes("vite") || lower.includes("rollup")
            ? "build"
            : "unknown";

const severity = type === "security" || type === "dependency" ? "high" : "medium";
const fingerprint = crypto.createHash("sha256").update(`${type}\n${normalized}`).digest("hex").slice(0, 32);

const report = {
  schemaVersion: 1,
  generatedAt: new Date().toISOString(),
  source: "github-actions",
  commitSha: process.env.GITHUB_SHA ?? null,
  workflow: process.env.GITHUB_WORKFLOW ?? null,
  runId: process.env.GITHUB_RUN_ID ?? null,
  job: process.env.GITHUB_JOB ?? null,
  status: "failure",
  errorType: type,
  severity,
  fingerprint,
  message: normalized.slice(0, 4000),
  affectedFiles: [],
  rootCause: null,
  recommendation: null,
  memory: { lookup: "pending", hit: false },
  autoApply: false,
  requiresHumanReview: true,
};

await fs.mkdir(outDir, { recursive: true });
await fs.writeFile(outFile, `${JSON.stringify(report, null, 2)}\n`);

try {
  execFileSync(process.execPath, ["scripts/error-intelligence-engine.mjs"], {
    stdio: "inherit",
    env: { ...process.env, ERROR_REPORT_PATH: outFile },
  });
} catch (error) {
  console.error("ERROR INTELLIGENCE: engine failed; normalized report was still preserved.");
  if (error?.status) console.error(`ERROR INTELLIGENCE: exit=${error.status}`);
  process.exitCode = 1;
}

console.log(`Error report written to ${outFile}`);
