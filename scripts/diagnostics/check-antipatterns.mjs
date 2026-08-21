import { readFileSync } from "node:fs";
import { main, files, rel } from "./_core.mjs";

await main("check-antipatterns", () => {
  const criticalFindings = [];
  const advisoryFindings = [];
  for (const file of files("src", /\.(ts|tsx|js|jsx|mjs)$/)) {
    const path = rel(file);
    const source = readFileSync(file, "utf8");
    if (/console\.log\s*\(/.test(source)) advisoryFindings.push(`${path}: console.log (advisory)`);
    if (/\.then\s*\([^)]*\)\s*;/.test(source) && !/\.catch\s*\(/.test(source)) criticalFindings.push(`${path}: promise chain without catch`);
    if (/new Promise\s*\([^)]*setTimeout/.test(source)) advisoryFindings.push(`${path}: timer-backed promise should be audited for cleanup`);
  }
  const findings = [...criticalFindings, ...advisoryFindings];
  return {
    severity: criticalFindings.length ? "CRITICAL" : advisoryFindings.length ? "WARNING" : "INFO",
    message: criticalFindings.length ? "Critical runtime antipatterns detected" : advisoryFindings.length ? "Runtime antipattern advisories" : "Antipattern scan PASS",
    findings,
    details: { criticalFindings, advisoryFindings },
  };
});
