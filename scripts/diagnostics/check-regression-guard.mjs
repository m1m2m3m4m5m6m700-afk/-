import { existsSync } from "node:fs";
import { main, json, files, text, rel } from "./_core.mjs";

await main("check-regression-guard", () => {
  const path = "REGRESSION_RULES.json";
  if (!existsSync(path)) return { severity: "CRITICAL", message: "REGRESSION_RULES.json missing", findings: [path] };
  const cfg = json(path);
  const criticalFindings = [];
  const advisoryFindings = [];
  if (!Number.isInteger(cfg.version) || !Array.isArray(cfg.rules)) criticalFindings.push("Schema requires integer version and rules array");

  for (const rule of cfg.rules ?? []) {
    if (!rule.id || typeof rule.pattern !== "string") {
      criticalFindings.push(`Invalid rule schema: ${JSON.stringify(rule)}`);
      continue;
    }
    let re;
    try { re = new RegExp(rule.pattern, rule.flags ?? ""); } catch { criticalFindings.push(`Invalid regex in rule ${rule.id}`); continue; }
    for (const file of files("src", /\.(ts|tsx|js|jsx|mjs)$/)) {
      const pathName = rel(file);
      if ((rule.pathPrefixes ?? []).some((prefix) => pathName.startsWith(prefix))) continue;
      re.lastIndex = 0;
      if (re.test(text(file))) {
        const finding = `${pathName} matches regression rule ${rule.id}`;
        if (rule.guardMode === "advisory") advisoryFindings.push(finding); else criticalFindings.push(finding);
      }
    }
  }

  const findings = [...criticalFindings, ...advisoryFindings];
  return {
    severity: criticalFindings.length ? "CRITICAL" : advisoryFindings.length ? "WARNING" : "INFO",
    message: criticalFindings.length ? "Critical regression guard triggered" : advisoryFindings.length ? "Regression guard advisory findings" : "Regression guard PASS",
    findings,
    details: { criticalFindings, advisoryFindings },
  };
});
