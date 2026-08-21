import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, openSync, readFileSync, renameSync, closeSync, writeFileSync, unlinkSync } from "node:fs";
import { dirname, join } from "node:path";
import { randomUUID } from "node:crypto";

const LOG_FILE = join(process.cwd(), "errors.log.json");
const DECISION_LOG = join(process.cwd(), "DECISION_LOG.md");
const MAX_RECORDS = Math.max(1, Number(process.env.FLIXO_ERROR_SINK_MAX_RECORDS ?? 1000));
const MAX_DETAIL_CHARS = Math.max(500, Number(process.env.FLIXO_ERROR_SINK_MAX_DETAIL_CHARS ?? 4000));

function getGitSha() {
  try {
    return execFileSync("git", ["rev-parse", "HEAD"], { encoding: "utf8" }).trim();
  } catch {
    return "UNKNOWN_SHA";
  }
}

function sanitizeText(value, max = MAX_DETAIL_CHARS) {
  return String(value ?? "")
    .replace(/(GEMINI_API_KEY|OPENAI_API_KEY|OPENROUTER_API_KEY|ANTHROPIC_API_KEY)\s*[:=]\s*[^\s]+/gi, "$1=[REDACTED]")
    .replace(/(Bearer\s+)[A-Za-z0-9._~-]+/gi, "$1[REDACTED]")
    .slice(-max);
}

function loadRecords() {
  if (!existsSync(LOG_FILE)) return [];
  try {
    const parsed = JSON.parse(readFileSync(LOG_FILE, "utf8"));
    if (Array.isArray(parsed)) return parsed;
    if (Array.isArray(parsed?.records)) return parsed.records;
  } catch {
    return [];
  }
  return [];
}

function withExclusiveLock(file) {
  const lock = `${file}.${process.pid}.lock`;
  const fd = openSync(lock, "wx", 0o600);
  return () => {
    try { closeSync(fd); } finally {
      try { unlinkSync(lock); } catch { /* best effort */ }
    }
  };
}

function atomicWrite(file, records) {
  mkdirSync(dirname(file), { recursive: true });
  const temp = `${file}.${process.pid}.${randomUUID()}.tmp`;
  try {
    writeFileSync(temp, JSON.stringify({ schemaVersion: 1, records }, null, 2) + "\n", {
      encoding: "utf8",
      flag: "wx",
      mode: 0o600,
    });
    renameSync(temp, file);
  } finally {
    try { unlinkSync(temp); } catch { /* already renamed */ }
  }
}

export function logErrorToSink({
  toolName = "SYSTEM_RUNTIME",
  severity = "CRITICAL",
  signature = "UNCAUGHT_RUNTIME_EXCEPTION",
  rootCause = "No explicit cause recorded",
  details = "",
  sha = getGitSha(),
}) {
  const timestamp = new Date().toISOString();
  const record = {
    timestamp,
    sha: sanitizeText(sha, 64),
    toolName: sanitizeText(toolName, 200),
    severity: sanitizeText(severity, 32),
    signature: sanitizeText(signature, 200),
    rootCause: sanitizeText(rootCause, 600),
    details: sanitizeText(details),
  };

  try {
    const release = withExclusiveLock(LOG_FILE);
    try {
      atomicWrite(LOG_FILE, [...loadRecords(), record].slice(-MAX_RECORDS));
    } finally {
      release();
    }
  } catch (error) {
    console.error("[ERROR SINK] errors.log.json persistence failed:", error instanceof Error ? error.message : String(error));
  }

  try {
    mkdirSync(dirname(DECISION_LOG), { recursive: true });
    const entry = [
      "",
      `### [${record.severity}] ${record.toolName} - ${timestamp}`,
      `- **Target SHA:** \`${record.sha}\``,
      `- **Signature:** \`${record.signature}\``,
      `- **Root Cause:** ${record.rootCause}`,
      "```text",
      record.details,
      "```",
      "---",
      "",
    ].join("\n");
    writeFileSync(DECISION_LOG, entry, { encoding: "utf8", flag: "a", mode: 0o600 });
  } catch (error) {
    console.error("[ERROR SINK] DECISION_LOG persistence failed:", error instanceof Error ? error.message : String(error));
  }

  console.error(`[ERROR SINK] ${record.signature} @ ${record.sha}`);
  return record;
}
