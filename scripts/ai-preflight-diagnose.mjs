import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";

const args = new Set(process.argv.slice(2));
const fast = args.has("--fast");
const secretsOnly = args.has("--secrets-only");
const noAi = args.has("--no-ai") || !process.env.FLIXO_AI_PROVIDER;
const advisory = args.has("--advisory") || fast;

if (fast && secretsOnly) throw new Error("--fast and --secrets-only are mutually exclusive.");

const ROOT = process.cwd();
const diagnosticsDir = resolve(ROOT, ".artifacts/diagnostics");
const historyDir = resolve(ROOT, "history");
mkdirSync(diagnosticsDir, { recursive: true });
mkdirSync(historyDir, { recursive: true });

const timestamp = new Date().toISOString();

export function redactSecrets(input) {
  return String(input ?? "")
    .replace(/\bsk-[A-Za-z0-9_-]{20,}\b/g, "[REDACTED_OPENAI_KEY]")
    .replace(/\bgh[pousr]_[A-Za-z0-9_]{20,}\b/g, "[REDACTED_GITHUB_TOKEN]")
    .replace(/\bAKIA[0-9A-Z]{16}\b/g, "[REDACTED_AWS_KEY]")
    .replace(/-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----[\s\S]*?-----END (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/g, "[REDACTED_PRIVATE_KEY]")
    .replace(/\b(?:api[_-]?key|secret|token|password)\s*[:=]\s*["'][^"']+["']/gi, "$1=[REDACTED]")
    .replace(/(Authorization\s*:\s*Bearer\s+)[^\s]+/gi, "$1[REDACTED]");
}

function ensureRecord(file, value) {
  mkdirSync(dirname(file), { recursive: true });
  writeFileSync(file, JSON.stringify(value, null, 2) + "\n", "utf8");
}

function runCommand(label, command, commandArgs) {
  const started = Date.now();
  try {
    const stdout = execFileSync(command, commandArgs, {
      cwd: ROOT,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "pipe"],
      env: process.env,
      maxBuffer: 8 * 1024 * 1024,
    });
    return { name: label, status: "pass", durationMs: Date.now() - started, summary: redactSecrets(stdout).slice(-4000) };
  } catch (error) {
    return {
      name: label,
      status: "fail",
      durationMs: Date.now() - started,
      code: error?.status ?? 1,
      summary: redactSecrets(`${error?.stdout ?? ""}\n${error?.stderr ?? ""}`).slice(-4000),
    };
  }
}

function runSecretsScan() {
  const result = runCommand("secrets-scan", process.execPath, [resolve(ROOT, "scripts/scan-secrets.mjs")]);
  let findings = [];
  const jsonMatch = result.summary.match(/\{[\s\S]*\}/);
  if (jsonMatch) {
    try {
      const parsed = JSON.parse(jsonMatch[0]);
      findings = Array.isArray(parsed.findings) ? parsed.findings : [];
    } catch {
      findings = [];
    }
  }
  return { ...result, status: findings.length ? "fail" : "pass", findings };
}

function compactEvidence(results) {
  return results.map(({ name, status, code, summary }) => ({ name, status, ...(code ? { code } : {}), summary: redactSecrets(summary).slice(0, 800) }));
}

async function askAi(evidence) {
  if (noAi) return null;
  const provider = process.env.FLIXO_AI_PROVIDER?.trim().toLowerCase();
  const prompt = redactSecrets([
    "Classify this engineering preflight evidence.",
    "Return concise JSON with severity, rootCause, proposedFix.",
    "Advisory only; do not override deterministic results.",
    JSON.stringify(compactEvidence(evidence)),
  ].join("\n"));

  try {
    if (provider === "openai" || provider === "openrouter") {
      const key = provider === "openrouter" ? process.env.OPENROUTER_API_KEY : process.env.OPENAI_API_KEY;
      if (!key) return { status: "skipped", reason: "missing-provider-key" };
      const base = provider === "openrouter" ? "https://openrouter.ai/api/v1" : "https://api.openai.com/v1";
      const model = process.env.FLIXO_AI_MODEL || (provider === "openrouter" ? "openai/gpt-4o-mini" : "gpt-4o-mini");
      const response = await fetch(`${base}/chat/completions`, {
        method: "POST",
        headers: { "content-type": "application/json", authorization: `Bearer ${key}` },
        body: JSON.stringify({ model, temperature: 0, messages: [{ role: "user", content: prompt }] }),
      });
      if (!response.ok) return { status: "error", reason: `provider-http-${response.status}` };
      const payload = await response.json();
      return { status: "pass", provider, model, response: redactSecrets(payload?.choices?.[0]?.message?.content ?? "").slice(0, 3000) };
    }

    if (provider === "gemini") {
      const key = process.env.GEMINI_API_KEY;
      if (!key) return { status: "skipped", reason: "missing-provider-key" };
      const model = process.env.FLIXO_AI_MODEL || "gemini-2.0-flash";
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(key)}`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
      });
      if (!response.ok) return { status: "error", reason: `provider-http-${response.status}` };
      const payload = await response.json();
      const text = payload?.candidates?.[0]?.content?.parts?.map((part) => part.text).filter(Boolean).join("\n") ?? "";
      return { status: "pass", provider, model, response: redactSecrets(text).slice(0, 3000) };
    }

    return { status: "skipped", reason: "unsupported-provider" };
  } catch (error) {
    return { status: "error", reason: redactSecrets(error?.message || "ai-provider-error") };
  }
}

const results = [runSecretsScan()];
if (!fast && !secretsOnly) {
  results.push(
    runCommand("typecheck", "npm", ["run", "typecheck"]),
    runCommand("lint", "npm", ["run", "lint"]),
    runCommand("security-strict", "npm", ["run", "validate:security-strict"]),
    runCommand("production-audit", "npm", ["run", "audit:production"]),
  );
}

const aiAssistance = await askAi(results);
const signatureGeneratorPath = resolve(ROOT, "scripts/error-intelligence/signature-generator.mjs");
const signatureGeneratorAvailable = existsSync(signatureGeneratorPath);

const report = {
  schemaVersion: 1,
  generatedAt: timestamp,
  mode: fast ? "fast" : secretsOnly ? "secrets-only" : "full",
  advisory,
  deterministic: { passed: results.every((result) => result.status === "pass"), results },
  errorIntelligence: { signatureGeneratorAvailable },
  ai: aiAssistance,
  policy: { aiCanInterpretOnly: true, aiCanOverrideDeterministicResult: false, automaticRepair: false, secretRedactionApplied: true },
};

const reportPath = resolve(diagnosticsDir, "ai-preflight-report.json");
ensureRecord(reportPath, report);

const historyPath = resolve(historyDir, "ai-preflight.json");
let history = [];
if (existsSync(historyPath)) {
  try {
    const parsed = JSON.parse(readFileSync(historyPath, "utf8"));
    history = Array.isArray(parsed) ? parsed : [];
  } catch {
    history = [];
  }
}
history = [...history, report].slice(-25);
ensureRecord(historyPath, history);

if (!process.env.FLIXO_AI_PROVIDER) {
  ensureRecord(resolve(diagnosticsDir, "no-ai-fallback-test.json"), {
    schemaVersion: 1,
    generatedAt: timestamp,
    provider: "",
    aiSkipped: true,
    deterministicChecksRan: results.map(({ name, status }) => ({ name, status })),
    deterministicFailuresRemainAuthoritative: true,
    status: results.every((result) => result.status === "pass") ? "pass" : "fail",
  });
}

console.log(JSON.stringify({
  mode: report.mode,
  deterministicStatus: report.deterministic.passed ? "PASS" : "FAIL",
  aiStatus: aiAssistance?.status ?? "SKIPPED",
  reportPath,
  historyPath,
}, null, 2));

if (!report.deterministic.passed && !advisory) process.exitCode = 1;
