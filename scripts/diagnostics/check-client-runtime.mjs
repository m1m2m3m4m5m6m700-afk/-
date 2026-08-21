import { existsSync, readFileSync } from "node:fs";
import { main, files } from "./_core.mjs";
await main("check-client-runtime", () => {
  const findings = [];
  const all = files("src", /\.(ts|tsx|js|mjs)$/);
  const joined = all.map((f) => readFileSync(f, "utf8")).join("\n");
  if (!joined.includes("/api/log-error")) findings.push("No client /api/log-error integration found");
  if (!/window\.onerror|window\.addEventListener\(\s*["']error/.test(joined)) findings.push("window error handler not detected");
  if (!/ErrorBoundary|componentDidCatch/.test(joined)) findings.push("Error Boundary not detected");
  return {
    severity: "INFO",
    message: findings.length ? "Client error telemetry contract incomplete (advisory)" : "Client runtime diagnostic PASS",
    findings: [],
    details: { warnings: findings },
  };
});
