import { appendFileSync, existsSync, mkdirSync, openSync, readFileSync, renameSync, unlinkSync, writeFileSync, closeSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { join } from "node:path";

const ROOT = process.cwd();
const LOG = join(ROOT, "errors.log.json");
const DEC = join(ROOT, "DECISION_LOG.md");
const EVIDENCE = join(ROOT, "diagnostics");
const ELOG = join(EVIDENCE, "errors.log.json");
const EDEC = join(EVIDENCE, "DECISION_LOG.md");
const LOCK = join(EVIDENCE, ".error-sink.lock");
const LOCK_STALE_MS = 10_000;
mkdirSync(EVIDENCE, { recursive: true });

const SECRET = /((?:sk|xox|ghp|github_pat|AIza)[-_A-Za-z0-9]{12,}|-----BEGIN [^-]+ PRIVATE KEY-----|(?:password|secret|token|api[_-]?key)\s*[:=]\s*[\"'][^\"']+[\"'])/gi;
function sha() { const v = execFileSync("git", ["rev-parse", "HEAD"], { encoding: "utf8" }).trim(); if (!/^[0-9a-f]{40}$/i.test(v)) throw new Error("Missing exact SHA"); return v; }
function scrub(v) { if (typeof v !== "string") return v; return v.replace(SECRET, "[REDACTED]"); }
function scrubDeep(value) { if (typeof value === "string") return scrub(value); if (Array.isArray(value)) return value.map(scrubDeep); if (value && typeof value === "object") return Object.fromEntries(Object.entries(value).map(([k, v]) => [k, scrubDeep(v)])); return value; }
function load() { if (!existsSync(LOG)) return []; try { return JSON.parse(readFileSync(LOG, "utf8")); } catch { return []; } }
function acquireLock() {
  const deadline = Date.now() + 5000;
  while (Date.now() < deadline) {
    try { const fd = openSync(LOCK, "wx"); writeFileSync(fd, String(Date.now()), "utf8"); closeSync(fd); return; } catch {
      try { const created = Number.parseInt(readFileSync(LOCK, "utf8"), 10); if (Number.isFinite(created) && Date.now() - created > LOCK_STALE_MS) unlinkSync(LOCK); } catch {}
      Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, 40);
    }
  }
  throw new Error("Timed out acquiring diagnostic sink lock");
}
function releaseLock() { try { unlinkSync(LOCK); } catch {} }
function atomicWrite(path, content) {
  const tmp = `${path}.${process.pid}.${Date.now()}.tmp`;
  let fd = null;
  try { fd = openSync(tmp, "wx"); writeFileSync(fd, content, "utf8"); closeSync(fd); fd = null; renameSync(tmp, path); }
  finally { if (fd !== null) { try { closeSync(fd); } catch {} } try { unlinkSync(tmp); } catch {} }
}
function save(entries) {
  const payload = JSON.stringify(entries, null, 2) + "\n";
  acquireLock();
  try { atomicWrite(LOG, payload); atomicWrite(ELOG, payload); }
  finally { releaseLock(); }
}
function appendDecision(line) { acquireLock(); try { appendFileSync(DEC, line); appendFileSync(EDEC, line); } finally { releaseLock(); } }
function parseArgs(argv) { const a = {}; for (let i = 2; i < argv.length; i += 1) { const k = argv[i], v = argv[i + 1]; if (k?.startsWith("--")) { a[k.slice(2)] = v?.startsWith("--") ? true : v; i += v?.startsWith("--") ? 0 : 1; } } return a; }

const args = parseArgs(process.argv), command = process.argv[2];
if (command === "record") {
  const details = scrubDeep(JSON.parse(args.details || "{}"));
  const entry = { timestamp: new Date().toISOString(), sha: sha(), scanner: args.scanner || "unknown", severity: args.severity || "INFO", message: scrub(args.message || ""), details };
  const entries = load(); entries.push(entry); save(entries); appendDecision(`\n- ${entry.timestamp} | ${entry.sha} | ${entry.scanner} | ${entry.severity} | ${entry.message}`);
  process.stdout.write(JSON.stringify({ ok: true, scanner: entry.scanner, severity: entry.severity, sha: entry.sha }) + "\n");
} else if (command === "begin") {
  const session = { timestamp: new Date().toISOString(), sha: sha(), scanner: "session", severity: "INFO", message: "diagnostic session started", details: { sessionId: `diag-${Date.now()}` } };
  const entries = load(); entries.push(session); save(entries); appendDecision(`\n\n## Diagnostic session ${session.details.sessionId}\n- SHA: ${session.sha}\n- Started: ${session.timestamp}\n`); process.stdout.write(session.details.sessionId + "\n");
} else if (command === "summary") {
  const entries = load(), latestSha = sha(), current = entries.filter((e) => e.sha === latestSha); const critical = current.filter((e) => e.severity === "CRITICAL").length; const failed = current.filter((e) => e.severity === "CRITICAL").map((e) => e.scanner);
  process.stdout.write(JSON.stringify({ sha: latestSha, entries: current.length, critical, failed }, null, 2) + "\n"); process.exitCode = critical ? 1 : 0;
} else { process.stderr.write("error-sink usage: record|begin|summary\n"); process.exitCode = 2; }
