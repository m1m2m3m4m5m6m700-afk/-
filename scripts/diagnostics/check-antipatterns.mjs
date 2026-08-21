import { readFileSync } from "node:fs";
import { main, files, rel } from "./_core.mjs";
await main("check-antipatterns", () => {
  const critical = [];
  const warnings = [];
  for (const f of files("src", /\.(ts|tsx|js|jsx|mjs)$/)) {
    const s = readFileSync(f, "utf8");
    if (/\.then\s*\([^)]*\)\s*;/.test(s) && !/\.catch\s*\(/.test(s)) critical.push(`${rel(f)}: promise chain without catch`);
    if (/new Promise\s*\([^)]*setTimeout/.test(s)) critical.push(`${rel(f)}: timer-backed promise should be audited for cleanup`);
    if (/console\.log\s*\(/.test(s)) warnings.push(`${rel(f)}: console.log`);
  }
  return {
    severity: critical.length ? "CRITICAL" : "INFO",
    message: critical.length ? "Runtime antipatterns detected" : warnings.length ? "Runtime antipattern warnings detected" : "Antipattern scan PASS",
    findings: critical,
    details: { warnings },
  };
});
