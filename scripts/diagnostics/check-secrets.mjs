import { readFileSync } from "node:fs";
import { main, files, rel, json } from "./_core.mjs";

const CONFIG = json("SECRETS_ALLOWLIST.json");
const STRONG_PATTERNS = [
  /AKIA[0-9A-Z]{16}/,
  /-----BEGIN (?:RSA |EC |OPENSSH |PGP |DSA )?PRIVATE KEY-----/,
  /github_pat_[A-Za-z0-9_]{20,}/,
  /ghp_[A-Za-z0-9]{30,}/,
  /sk-[A-Za-z0-9]{20,}/,
  /xox[baprs]-[A-Za-z0-9-]{20,}/,
  /AIza[0-9A-Za-z_-]{20,}/,
];
const ASSIGNMENT = /(?:password|secret|token|api[_-]?key|client[_-]?secret)\s*[:=]\s*["']([^"'\n]{12,})["']/gi;

function entropy(value) {
  const counts = new Map();
  for (const ch of value) counts.set(ch, (counts.get(ch) ?? 0) + 1);
  let score = 0;
  for (const count of counts.values()) {
    const p = count / value.length;
    score -= p * Math.log2(p);
  }
  return score;
}
function allowedPath(path) {
  return (CONFIG.pathPrefixes ?? []).some((prefix) => path.startsWith(prefix)) || (CONFIG.pathExact ?? []).includes(path);
}
function allowedLiteral(value) { return (CONFIG.literalValues ?? []).includes(value); }

await main("check-secrets", () => {
  const findings = [];
  for (const file of files(".", /\.(ts|tsx|js|jsx|mjs|json|env|yml|yaml|md)$/)) {
    const path = rel(file);
    if (allowedPath(path)) continue;
    const source = readFileSync(file, "utf8");
    for (const pattern of STRONG_PATTERNS) {
      if (pattern.test(source)) {
        findings.push(`${path}: high-confidence secret pattern`);
        break;
      }
    }
    if (findings.some((item) => item.startsWith(`${path}:`))) continue;
    ASSIGNMENT.lastIndex = 0;
    for (const match of source.matchAll(ASSIGNMENT)) {
      const value = match[1];
      if (!allowedLiteral(value) && entropy(value) > 4.5) {
        findings.push(`${path}: high-entropy secret-like assignment`);
        break;
      }
    }
  }
  return {
    severity: findings.length ? "CRITICAL" : "INFO",
    message: findings.length ? "Context-aware secret detection found suspicious material" : "Context-aware secret scan PASS",
    findings,
    details: { entropyThreshold: 4.5, allowlist: "SECRETS_ALLOWLIST.json" },
  };
});
