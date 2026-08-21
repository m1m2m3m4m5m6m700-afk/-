import fs from "node:fs/promises";
import crypto from "node:crypto";

const root = process.cwd();
const reportPath = process.env.ERROR_REPORT_PATH ?? ".artifacts/errors/error-report.json";
const memoryPath = process.env.ERROR_MEMORY_PATH ?? ".artifacts/errors/failure-memory.json";
const sarifRoots = [
  ".artifacts/security",
  ".artifacts/early-detection",
  ".artifacts/errors",
  "results",
].map((dir) => `${root}/${dir}`);

const safeReadJson = async (file) => {
  try { return JSON.parse(await fs.readFile(file, "utf8")); } catch { return null; }
};

const walk = async (dir) => {
  const files = [];
  try {
    for (const entry of await fs.readdir(dir, { withFileTypes: true })) {
      const full = `${dir}/${entry.name}`;
      if (entry.isDirectory()) files.push(...await walk(full));
      else if (entry.name.endsWith(".sarif") || entry.name.endsWith(".json")) files.push(full);
    }
  } catch {}
  return files;
};

const normalizeText = (value) => String(value ?? "")
  .replace(/\r\n/g, "\n")
  .replace(/\x1b\[[0-9;]*m/g, "")
  .trim();

const redact = (value) => normalizeText(value)
  .replace(/(ghp_|github_pat_|sk-|AIza)[A-Za-z0-9_\-.]+/g, "[REDACTED]")
  .replace(/(token|secret|password|api[_-]?key)\s*[:=]\s*[^\s,;]+/gi, "$1=[REDACTED]")
  .replace(/Bearer\s+[A-Za-z0-9._-]+/gi, "Bearer [REDACTED]");

const hash = (value) => crypto.createHash("sha256").update(value, "utf8").digest("hex");

function detectRootCause(report) {
  const text = `${report.message ?? ""}\n${report.errorType ?? ""}`.toLowerCase();
  const message = report.message ?? "";
  const patterns = [
    { re: /enoent.*(?:src\/data\/tools\.ts|src\\data\\tools\.ts)/i, code: "deleted-legacy-file-reference", cause: "A validator or runtime path still references the removed legacy tool catalog.", fix: "Migrate the consumer to src/lib/tool-platform or the matching src/lib/data domain adapter." },
    { re: /megaToolsCatalog|megaToolsEngine/i, code: "deleted-legacy-subsystem-reference", cause: "The removed Mega Tools subsystem is referenced by a consumer or validator.", fix: "Remove the import/reference and use the canonical Tool Platform registry." },
    { re: /package-lock|npm ci.*package|lockfile/i, code: "dependency-contract", cause: "The package manifest and lockfile are out of sync or a dependency contract failed.", fix: "Regenerate package-lock with the intended package.json and rerun npm ci." },
    { re: /401|unauthorized|invalid token|smoke token/i, code: "provider-authentication", cause: "The live provider endpoint rejected authentication.", fix: "Verify the Preview deployment secret matches the GitHub secret without exposing the secret value." },
    { re: /build-rate-limit|api-deployments-free-per-day/i, code: "deployment-rate-limit", cause: "The external deployment provider blocked another deployment because of a rate limit.", fix: "Wait for the provider limit reset or use approved deployment capacity; do not retry repeatedly." },
    { re: /actionlint|workflow.*syntax|invalid workflow/i, code: "workflow-contract", cause: "A GitHub Actions workflow is syntactically or structurally invalid.", fix: "Run actionlint against the affected workflow and correct the first reported expression or key." },
    { re: /timeout|timed out|deadline exceeded|exceeded.*time/i, code: "timeout", cause: "A command or test exceeded its allowed execution window.", fix: "Identify the first timed-out operation, then reduce work, parallelize the test, or raise the timeout only when justified." },
    { re: /econnreset|enotfound|network|fetch failed|socket hang up|503|502/i, code: "network", cause: "A network or upstream service request failed.", fix: "Identify the first failing endpoint/dependency and verify retryability, connectivity, and upstream health before retrying." },
    { re: /heap out of memory|javascript heap|allocation failed|out of memory/i, code: "memory", cause: "The Node.js process exceeded available heap memory.", fix: "Measure the memory-heavy step, reduce retained data/concurrency, and only then raise the Node heap limit." },
    { re: /eacces|eperm|permission denied|operation not permitted/i, code: "permission", cause: "The process lacks the required filesystem or GitHub Actions permission.", fix: "Inspect the exact operation and grant the minimum required permission or change the target path." },
    { re: /typescript|ts\d{3,5}|cannot find module/i, code: "typecheck", cause: "TypeScript or module resolution failed.", fix: "Inspect the first TypeScript error and verify the imported symbol/path against the canonical module boundary." },
    { re: /playwright|expect\(|test failed/i, code: "e2e-regression", cause: "A browser or end-to-end contract failed.", fix: "Use the Playwright artifact and first failing assertion to identify the affected route/tool before rerunning." },
    { re: /semgrep|codeql|gitleaks|osv|trivy|grype|zizmor/i, code: "security-finding", cause: "An automated security or supply-chain scanner reported a finding.", fix: "Review the scanner evidence, severity, and affected dependency/file before deciding whether to block or suppress." },
  ];
  const matched = patterns.find((entry) => entry.re.test(message) || entry.re.test(text));
  if (matched) return { code: matched.code, rootCause: matched.cause, recommendation: matched.fix, confidence: 0.96 };
  return { code: "unclassified", rootCause: "No deterministic root-cause rule matched the normalized failure payload.", recommendation: "Inspect the first failing command and stack trace, then add a regression rule after the diagnosis is confirmed.", confidence: 0.35 };
}

function extractFiles(message) {
  const matches = new Set();
  const pathPattern = /(?:^|[\s(])((?:src|tests|scripts|\.github|public)\/[A-Za-z0-9_.$/@{}\-]+\.(?:ts|tsx|mjs|js|yml|yaml|json|md|txt))/g;
  for (const match of message.matchAll(pathPattern)) matches.add(match[1]);
  return [...matches].slice(0, 20);
}

async function collectSarifFindings() {
  const files = (await Promise.all(sarifRoots.map(walk))).flat();
  const findings = [];
  for (const file of files) {
    const data = await safeReadJson(file);
    for (const run of data?.runs ?? []) {
      for (const result of run.results ?? []) {
        findings.push({
          source: file.replace(`${root}/`, ""),
          ruleId: result.ruleId ?? result.rule?.id ?? "unknown",
          level: result.level ?? "warning",
          message: normalizeText(result.message?.text ?? result.message ?? ""),
          locations: result.locations ?? [],
        });
      }
    }
  }
  return findings.slice(0, 200);
}

const report = await safeReadJson(`${root}/${reportPath}`);
if (!report) {
  console.error(`ERROR INTELLIGENCE: missing ${reportPath}`);
  process.exit(1);
}

const current = report;
current.message = redact(current.message);
current.affectedFiles = [...new Set([...(current.affectedFiles ?? []), ...extractFiles(current.message)])].slice(0, 20);
const diagnosis = detectRootCause(current);
current.rootCause = diagnosis.rootCause;
current.rootCauseCode = diagnosis.code;
current.recommendation = diagnosis.recommendation;
current.diagnosisConfidence = diagnosis.confidence;
current.classification = { deterministic: diagnosis.code !== "unclassified", source: "error-intelligence-engine", errorType: current.errorType ?? "unknown" };

const findings = await collectSarifFindings();
current.findings = findings;
const findingGroups = new Map();
for (const finding of findings) {
  const key = finding.ruleId;
  findingGroups.set(key, (findingGroups.get(key) ?? 0) + 1);
}
current.findingSummary = [...findingGroups.entries()].map(([ruleId, count]) => ({ ruleId, count })).sort((a, b) => b.count - a.count).slice(0, 50);

const signatureInput = JSON.stringify({ errorType: current.errorType ?? "unknown", rootCauseCode: diagnosis.code, affectedFiles: current.affectedFiles, message: current.message.slice(0, 2000) });
current.fingerprint = hash(signatureInput).slice(0, 32);

const priorMemory = (await safeReadJson(`${root}/${memoryPath}`)) ?? { schemaVersion: 2, maxEntries: 500, entries: {}, metrics: { diagnosesReviewed: 0, diagnosesAccurate: 0, diagnosesFalsePositive: 0 } };
priorMemory.schemaVersion = 2;
priorMemory.maxEntries = 500;
priorMemory.metrics ??= { diagnosesReviewed: 0, diagnosesAccurate: 0, diagnosesFalsePositive: 0 };
const key = current.fingerprint;
const previous = priorMemory.entries[key];
const now = new Date().toISOString();
priorMemory.entries[key] = {
  ...(previous ?? {}),
  fingerprint: key,
  errorType: current.errorType ?? "unknown",
  rootCauseCode: diagnosis.code,
  rootCause: diagnosis.rootCause,
  recommendation: diagnosis.recommendation,
  diagnosisConfidence: diagnosis.confidence,
  occurrences: (previous?.occurrences ?? 0) + 1,
  firstSeenAt: previous?.firstSeenAt ?? now,
  lastSeenAt: now,
  lastCommitSha: current.commitSha ?? null,
  successfulResolutionCount: previous?.successfulResolutionCount ?? 0,
  failedResolutionCount: previous?.failedResolutionCount ?? 0,
  resolutionStatus: previous?.resolutionStatus ?? "unreviewed",
};

const entries = Object.values(priorMemory.entries).sort((a, b) => String(b.lastSeenAt).localeCompare(String(a.lastSeenAt)));
priorMemory.entries = Object.fromEntries(entries.slice(0, priorMemory.maxEntries).map((entry) => [entry.fingerprint, entry]));
const reviewed = entries.filter((entry) => entry.resolutionStatus === "fixed" || entry.resolutionStatus === "false-positive" || entry.resolutionStatus === "wont-fix");
priorMemory.metrics.diagnosesReviewed = reviewed.length;
priorMemory.metrics.diagnosesAccurate = reviewed.filter((entry) => entry.resolutionStatus === "fixed").length;
priorMemory.metrics.diagnosesFalsePositive = reviewed.filter((entry) => entry.resolutionStatus === "false-positive").length;
current.memory = { lookup: "deterministic-file-memory", hit: Boolean(previous), occurrences: priorMemory.entries[key]?.occurrences ?? 1, previousDiagnosis: previous?.rootCause ?? null };
current.memoryMetrics = { entries: Object.keys(priorMemory.entries).length, maxEntries: priorMemory.maxEntries, diagnosisAccuracy: reviewed.length ? priorMemory.metrics.diagnosesAccurate / reviewed.length : null };
current.autoApply = false;
current.requiresHumanReview = true;

await fs.mkdir(`${root}/${reportPath}`.split("/").slice(0, -1).join("/"), { recursive: true });
await fs.writeFile(`${root}/${reportPath}`, `${JSON.stringify(current, null, 2)}\n`, "utf8");
await fs.writeFile(`${root}/${memoryPath}`, `${JSON.stringify(priorMemory, null, 2)}\n`, "utf8");

console.log(`ERROR INTELLIGENCE: ${diagnosis.code} confidence=${diagnosis.confidence}`);
console.log(`ERROR INTELLIGENCE: memoryHit=${current.memory.hit} findings=${findings.length}`);
console.log(`ERROR INTELLIGENCE: report=${reportPath}`);
