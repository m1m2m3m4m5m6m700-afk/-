import fs from "node:fs";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { validateRule } from "./regression-guard.mjs";

const ROOT = process.cwd();
const RULES_FILE = path.join(ROOT, "REGRESSION_RULES.json");
const SHA_REGEX = /^[a-f0-9]{40}$/i;

function readRules() {
  if (!fs.existsSync(RULES_FILE)) return [];
  const parsed = JSON.parse(fs.readFileSync(RULES_FILE, "utf8"));
  const rules = Array.isArray(parsed) ? parsed : parsed?.rules;
  if (!Array.isArray(rules)) throw new Error("REGRESSION_RULES.json must contain a rule array");
  return rules;
}

function requireSha(value) {
  if (!SHA_REGEX.test(value ?? "")) throw new Error("fixSha must be a real 40-character hexadecimal SHA");
  return value;
}

export function promoteRule(rule) {
  const normalized = {
    ...rule,
    fixSha: requireSha(rule.fixSha),
    guardMode: rule.guardMode ?? "blocking",
    updatedAt: new Date().toISOString(),
  };
  const validation = validateRule(normalized);
  if (!validation.valid) throw new Error(`Invalid regression rule: ${validation.reason}`);

  const rules = readRules();
  const index = rules.findIndex((entry) => entry.id === normalized.id);
  if (index >= 0) rules[index] = normalized;
  else rules.push(normalized);

  const temp = `${RULES_FILE}.${process.pid}.${randomUUID()}.tmp`;
  const lock = `${RULES_FILE}.${process.pid}.lock`;
  let fd;
  try {
    fd = fs.openSync(lock, "wx", 0o600);
    fs.writeFileSync(temp, `${JSON.stringify(rules, null, 2)}\n`, { encoding: "utf8", flag: "wx", mode: 0o600 });
    fs.renameSync(temp, RULES_FILE);
  } finally {
    try { if (fd !== undefined) fs.closeSync(fd); } catch {}
    try { fs.unlinkSync(temp); } catch {}
    try { fs.unlinkSync(lock); } catch {}
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const [id, targetFile, bannedPattern, requiredPattern, fixSha, guardMode = "blocking"] = process.argv.slice(2);
  if (!id || !targetFile || !bannedPattern || !fixSha) {
    console.error("Usage: node scripts/diagnostics/promote-rule.mjs <id> <targetFile> <bannedPattern> [requiredPattern] <fixSha> [blocking|advisory]");
    process.exit(2);
  }
  promoteRule({ id, targetFile, bannedPattern, requiredPattern, fixSha, guardMode });
  console.log(`Promoted regression rule: ${id}`);
}
