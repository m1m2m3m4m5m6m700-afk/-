import { execFile } from "node:child_process";
import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);
const args = new Set(process.argv.slice(2));
const fast = args.has("--fast");
const secretsOnly = args.has("--secrets-only");
const advisory = args.has("--advisory") || fast;
const noAi = args.has("--no-ai") || !process.env.FLIXO_AI_PROVIDER;

if (fast && secretsOnly) throw new Error("--fast and --secrets-only are mutually exclusive.");

const ROOT = process.cwd();
const diagnosticsDir = resolve(ROOT, ".artifacts/diagnostics");
const historyDir = resolve(ROOT, "history");
const cachePath = resolve(diagnosticsDir, "ai-cache.json");
const usagePath = resolve(diagnosticsDir, "ai-usage.json");
mkdirSync(diagnosticsDir, { recursive: true });
mkdirSync(historyDir, { recursive: true });

const timestamp = new Date().toISOString();
const monthKey = timestamp.slice(0, 7);
const LOCAL_TIMEOUT_MS = Number(process.env.FLIXO_AI_PREFLIGHT_TIMEOUT_MS || (advisory ? 9000 : 20000));
const MONTHLY_CAP = Number(process.env.FLIXO_AI_MONTHLY_CALL_CAP || 500);
const CACHE_SCHEMA_VERSION = 2;
const DIAGNOSTIC_VERSION = 2;

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

function readJson(file, fallback) {
  if (!existsSync(file)) return fallback;
  try {
    return JSON.parse(readFileSync(file, "utf8"));
  } catch {
    return fallback;
  }
}

function sha256(value) {
  return createHash("sha256").update(JSON.stringify(value)).digest("hex");
}

function normalizeFinding(finding) {
  return {
    source: finding?.source ?? finding?.tool ?? "unknown",
    rule: finding?.rule ?? finding?.code ?? "unknown",
    file: finding?.file ?? finding?.path ?? "",
    message: redactSecrets(finding?.message ?? finding?.description ?? "").replace(/\s+/g, " ").trim(),
  };
}

function dedupeFindings(findings) {
  const groups = new Map();
  for (const raw of findings) {
    const item = normalizeFinding(raw);
    const key = `${item.source}:${item.rule}`;
    const entry = groups.get(key) ?? { source: item.source, rule: item.rule, count: 0, examples: [] };
    entry.count += 1;
    if (entry.examples.length < 3) entry.examples.push(item);
    groups.set(key, entry);
  }
  return [...groups.values()].sort((a, b) => b.count - a.count);
}

async function runCommand(label, command, commandArgs, options = {}) {
  const started = Date.now();
  try {
    const result = await execFileAsync(command, commandArgs, {
      cwd: ROOT,
      env: process.env,
      maxBuffer: 8 * 1024 * 1024,
      timeout: options.timeoutMs ?? 0,
      killSignal: "SIGTERM",
    });
    return {
      name: label,
      status: "pass",
      durationMs: Date.now() - started,
      summary: redactSecrets(`${result.stdout ?? ""}\n${result.stderr ?? ""}`).slice(-2000),
    };
  } catch (error) {
    const timedOut = error?.code === "ETIMEDOUT" || error?.signal === "SIGTERM";
    return {
      name: label,
      status: "fail",
      durationMs: Date.now() - started,
      code: error?.status ?? 1,
      timeout: timedOut,
      summary: redactSecrets(`${error?.stdout ?? ""}\n${error?.stderr ?? ""}`).slice(-2000),
    };
  }
}

async function runSecretsScan() {
  const result = await runCommand("secrets-scan", process.execPath, [resolve(ROOT, "scripts/scan-secrets.mjs")]);
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
  const groups = dedupeFindings(findings);
  return { ...result, status: findings.length ? "fail" : "pass", findings, findingGroups: groups };
}

function compactEvidence(results, groups) {
  return {
    checks: results.map(({ name, status, code, timeout, summary }) => ({
      name,
      status,
      ...(code ? { code } : {}),
      ...(timeout ? { timeout: true } : {}),
      summary: redactSecrets(summary).slice(-1200),
    })),
    findingGroups: groups,
  };
}

function loadUsage() {
  const current = readJson(usagePath, { schemaVersion: 1, months: {} });
  current.months ??= {};
  current.months[monthKey] ??= { calls: 0, cacheHits: 0, escalations: 0 };
  return current;
}

function recordUsage(field) {
  const usage = loadUsage();
  usage.months[monthKey][field] += 1;
  ensureRecord(usagePath, usage);
}

function selectModel(provider, evidence) {
  const flattened = JSON.stringify(evidence).toLowerCase();
  const complex = evidence.findingGroups.length > 5 || evidence.checks.length > 5;
  const highRisk = flattened.includes("secret") || flattened.includes("security") || flattened.includes("audit");
  if ((complex || highRisk) && process.env.FLIXO_AI_MODEL_ESCALATED) {
    recordUsage("escalations");
    return process.env.FLIXO_AI_MODEL_ESCALATED;
  }
  return process.env.FLIXO_AI_MODEL || (provider === "openrouter" ? "openai/gpt-4o-mini" : provider === "gemini" ? "gemini-2.0-flash" : "gpt-4o-mini");
}

function computeFingerprint(evidence, provider, model) {
  return sha256({
    schemaVersion: CACHE_SCHEMA_VERSION,
    diagnosticVersion: DIAGNOSTIC_VERSION,
    provider,
    model,
    evidence,
  });
}

function findCached(cache, fingerprint) {
  const entry = cache.entries?.[fingerprint];
  if (!entry) return null;
  if (entry.status !== "success" || entry.schemaVersion !== CACHE_SCHEMA_VERSION) return null;
  return entry;
}

async function askAi(evidence) {
  if (noAi) return { status: "skipped", reason: "no-provider" };
  const provider = process.env.FLIXO_AI_PROVIDER?.trim().toLowerCase();
  const model = selectModel(provider, evidence);
  const fingerprint = computeFingerprint(evidence, provider, model);
  const cache = readJson(cachePath, { schemaVersion: CACHE_SCHEMA_VERSION, entries: {} });
  const cached = findCached(cache, fingerprint);
  if (cached) {
    recordUsage("cacheHits");
    return { ...cached.response, cache: "hit", fingerprint };
  }

  const usage = loadUsage();
  if (usage.months[monthKey].calls >= MONTHLY_CAP) {
    return { status: "skipped", reason: "monthly-cap-reached", mode: "heuristic-only", fingerprint };
  }

  const prompt = redactSecrets([
    "Classify this engineering preflight evidence.",
    "Return concise JSON with severity, rootCause, proposedFix.",
    "Advisory only; do not override deterministic results.",
    JSON.stringify(evidence),
  ].join("\n"));

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), LOCAL_TIMEOUT_MS);
  try {
    let responseData;
    if (provider === "openai" || provider === "openrouter") {
      const key = provider === "openrouter" ? process.env.OPENROUTER_API_KEY : process.env.OPENAI_API_KEY;
      if (!key) return { status: "skipped", reason: "missing-provider-key", fingerprint };
      const base = provider === "openrouter" ? "https://openrouter.ai/api/v1" : "https://api.openai.com/v1";
      const response = await fetch(`${base}/chat/completions`, {
        method: "POST",
        headers: { "content-type": "application/json", authorization: `Bearer ${key}` },
        body: JSON.stringify({ model, temperature: 0, messages: [{ role: "user", content: prompt }] }),
        signal: controller.signal,
      });
      if (!response.ok) return { status: "error", reason: `provider-http-${response.status}`, fingerprint };
      const payload = await response.json();
      responseData = { status: "pass", provider, model, response: redactSecrets(payload?.choices?.[0]?.message?.content ?? "").slice(0, 3000), fingerprint };
    } else if (provider === "gemini") {
      const key = process.env.GEMINI_API_KEY;
      if (!key) return { status: "skipped", reason: "missing-provider-key", fingerprint };
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(key)}`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
        signal: controller.signal,
      });
      if (!response.ok) return { status: "error", reason: `provider-http-${response.status}`, fingerprint };
      const payload = await response.json();
      const text = payload?.candidates?.[0]?.content?.parts?.map((part) => part.text).filter(Boolean).join("\n") ?? "";
      responseData = { status: "pass", provider, model, response: redactSecrets(text).slice(0, 3000), fingerprint };
    } else {
      return { status: "skipped", reason: "unsupported-provider", fingerprint };
    }

    recordUsage("calls");
    cache.entries ??= {};
    cache.entries[fingerprint] = {
      schemaVersion: CACHE_SCHEMA_VERSION,
      createdAt: timestamp,
      status: "success",
      response: responseData,
    };
    ensureRecord(cachePath, cache);
    return responseData;
  } catch (error) {
    return { status: "error", reason: error?.name === "AbortError" ? "timeout" : redactSecrets(error?.message || "ai-provider-error"), fingerprint };
  } finally {
    clearTimeout(timer);
  }
}

async function runDeterministicChecks() {
  const secrets = await runSecretsScan();
  if (secretsOnly) return [secrets];

  const commonArgs = {
    timeoutMs: fast ? undefined : 0,
  };
  const commands = fast
    ? [
        ["typecheck", "npm", ["run", "typecheck", "--", "--incremental", "--tsBuildInfoFile", ".artifacts/diagnostics/preflight.tsbuildinfo"], { ...commonArgs }],
        ["lint", "npm", ["run", "lint", "--", "--cache", "--cache-location", ".artifacts/diagnostics/eslint-cache"], { ...commonArgs }],
      ]
    : [
        ["typecheck", "npm", ["run", "typecheck"], {}],
        ["lint", "npm", ["run", "lint"], {}],
        ["security-strict", "npm", ["run", "validate:security-strict"], {}],
        ["production-audit", "npm", ["run", "audit:production"], {}],
      ];

  const parallel = await Promise.all(commands.map(([label, command, commandArgs, options]) => runCommand(label, command, commandArgs, options)));
  return [secrets, ...parallel];
}

const results = await runDeterministicChecks();
const findingGroups = dedupeFindings(results.flatMap((result) => result.findings ?? []));
const evidence = compactEvidence(results, findingGroups);
const aiAssistance = await askAi(evidence);
const signatureGeneratorPath = resolve(ROOT, "scripts/error-intelligence/signature-generator.mjs");
const signatureGeneratorAvailable = existsSync(signatureGeneratorPath);

const report = {
  schemaVersion: 2,
  diagnosticVersion: DIAGNOSTIC_VERSION,
  generatedAt: timestamp,
  mode: fast ? "fast" : secretsOnly ? "secrets-only" : "full",
  advisory,
  deterministic: { passed: results.every((result) => result.status === "pass"), results },
  findings: { groups: findingGroups, total: results.reduce((sum, result) => sum + (result.findings?.length ?? 0), 0) },
  errorIntelligence: { signatureGeneratorAvailable },
  ai: aiAssistance,
  policy: {
    aiCanInterpretOnly: true,
    aiCanOverrideDeterministicResult: false,
    automaticRepair: false,
    secretRedactionApplied: true,
    fallback: "deterministic-only",
    cacheFingerprint: aiAssistance?.fingerprint ?? null,
  },
};

const reportPath = resolve(diagnosticsDir, "ai-preflight-report.json");
ensureRecord(reportPath, report);

const historyPath = resolve(historyDir, "ai-preflight.json");
const history = readJson(historyPath, []);
ensureRecord(historyPath, [...(Array.isArray(history) ? history : []), report].slice(-25));

console.log(JSON.stringify({
  mode: report.mode,
  deterministicStatus: report.deterministic.passed ? "PASS" : "FAIL",
  aiStatus: aiAssistance.status,
  aiCache: aiAssistance.cache ?? "miss",
  aiFingerprint: aiAssistance.fingerprint ?? null,
  timeoutMs: LOCAL_TIMEOUT_MS,
  reportPath,
  historyPath,
}, null, 2));

if (!report.deterministic.passed && !advisory) process.exitCode = 1;
