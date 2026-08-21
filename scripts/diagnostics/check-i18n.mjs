import { readFileSync } from "node:fs";
import { main, files, rel } from "./_core.mjs";
await main("check-i18n", () => {
  const findings = [];
  for (const f of files("src", /\.(tsx|jsx)$/)) {
    const s = readFileSync(f, "utf8");
    const body = s.replace(/className\s*=\s*(?:\{[^}]*\}|"[^"]*"|'[^']*')/g, "");
    for (const m of body.matchAll(/>([^<{\n][^<>{}]*)</g)) {
      const value = m[1].trim();
      if (value && /[A-Za-z]{3}/.test(value)) findings.push(`${rel(f)}: hardcoded UI text: ${value.slice(0, 80)}`);
    }
  }
  return {
    severity: "INFO",
    message: findings.length ? "Potential hardcoded UI strings detected (advisory)" : "i18n surface PASS",
    findings: [],
    details: { warnings: findings },
  };
});
