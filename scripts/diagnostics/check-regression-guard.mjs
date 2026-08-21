import { existsSync } from "node:fs";
import { main, json, files, text, rel } from "./_core.mjs";
await main("check-regression-guard", () => {
  const path = "REGRESSION_RULES.json";
  if (!existsSync(path)) return { severity: "CRITICAL", message: "REGRESSION_RULES.json missing", findings: [path] };
  const cfg = json(path);
  const findings = [];
  const warnings = [];
  if (!Number.isInteger(cfg.version) || !Array.isArray(cfg.rules)) findings.push("Schema requires integer version and rules array");
  const candidates = files("src", /\.(ts|tsx|js|jsx|mjs)$/).filter((f) => {
    const p = rel(f);
    return p !== "src/routeTree.gen.ts" && !p.startsWith("src/scripts/");
  });
  for (const rule of cfg.rules || []) {
    if (!rule.id || typeof rule.pattern !== "string") { findings.push(`Invalid rule schema: ${JSON.stringify(rule)}`); continue; }
    let re;
    try { re = new RegExp(rule.pattern, rule.flags || ""); } catch { findings.push(`Invalid regex in rule ${rule.id}`); continue; }
    for (const f of candidates) {
      if (!re.test(text(f))) continue;
      if (rule.id === "no-console-log") warnings.push(`${rel(f)} matches regression rule ${rule.id}`);
      else findings.push(`${rel(f)} matches regression rule ${rule.id}`);
      re.lastIndex = 0;
    }
  }
  return {
    severity: findings.length ? "CRITICAL" : "INFO",
    message: findings.length ? "Regression guard triggered" : warnings.length ? "Regression guard advisory findings" : "Regression guard PASS",
    findings,
    details: { warnings },
  };
});
