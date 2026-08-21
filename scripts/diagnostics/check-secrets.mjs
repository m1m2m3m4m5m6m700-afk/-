import { readFileSync } from "node:fs";
import { main, files, rel } from "./_core.mjs";
const criticalPatterns = [
  /AKIA[0-9A-Z]{16}/g,
  /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/g,
  /github_pat_[A-Za-z0-9_]{20,}/g,
  /ghp_[A-Za-z0-9]{36,}/g,
  /sk-[A-Za-z0-9]{20,}/g,
  /xox[baprs]-[A-Za-z0-9-]{20,}/g,
  /AIza[0-9A-Za-z_-]{20,}/g,
];
const literalSecretPattern = /(?:password|secret|token|api[_-]?key)\s*[:=]\s*["']([^"'\n]{20,})["']/gi;
await main("check-secrets", () => {
  const critical = [];
  const warnings = [];
  for (const f of files(".", /\.(ts|tsx|js|jsx|mjs|json|env|yml|yaml|md)$/)) {
    const s = readFileSync(f, "utf8");
    if (criticalPatterns.some((p) => { p.lastIndex = 0; return p.test(s); })) critical.push(rel(f));
    else if (literalSecretPattern.test(s)) warnings.push(rel(f));
    literalSecretPattern.lastIndex = 0;
  }
  return {
    severity: critical.length ? "CRITICAL" : "INFO",
    message: critical.length ? "Verified secret material detected" : warnings.length ? "Potential secret literals require review" : "Secret scan PASS",
    findings: critical,
    details: { warnings },
  };
});
