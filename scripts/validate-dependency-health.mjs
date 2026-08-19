import { spawnSync } from "node:child_process";

const result = spawnSync("npm", ["audit", "--omit=dev", "--json"], {
  encoding: "utf8",
  stdio: ["ignore", "pipe", "pipe"],
});

let report;
try {
  report = JSON.parse(result.stdout || "{}");
} catch {
  console.error("DEPENDENCY HEALTH: FAIL");
  console.error("npm audit did not return valid JSON.");
  process.exit(1);
}

const counts = report.metadata?.vulnerabilities ?? {};
const high = Number(counts.high ?? 0);
const critical = Number(counts.critical ?? 0);
const moderate = Number(counts.moderate ?? 0);
const low = Number(counts.low ?? 0);
const info = Number(counts.info ?? 0);

console.log(
  `DEPENDENCY HEALTH: high=${high} critical=${critical} moderate=${moderate} low=${low} info=${info}`,
);

if (high > 0 || critical > 0) {
  console.error("DEPENDENCY HEALTH: FAIL (high/critical production vulnerabilities detected)");
  process.exit(1);
}

if (moderate > 0) {
  console.warn("DEPENDENCY HEALTH: WARN (moderate production vulnerabilities require planned remediation)");
} else {
  console.log("DEPENDENCY HEALTH: PASS");
}
