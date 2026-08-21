import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";

const sha = execFileSync("git", ["rev-parse", "HEAD"], { encoding: "utf8" }).trim();
const sink = new URL("../error-sink.mjs", import.meta.url).pathname;
const checks = [
  ["node-runtime", () => process.versions.node.startsWith("22.")],
  ["package-manifest", () => existsSync("package.json")],
  ["lockfile", () => existsSync("package-lock.json")],
  ["error-sink", () => existsSync(sink)],
  ["diagnostic-runner", () => existsSync("scripts/run-all-diagnostics.mjs")],
  ["regression-rules", () => existsSync("REGRESSION_RULES.json")],
];

const failures = [];
for (const [name, fn] of checks) {
  try {
    if (!fn()) failures.push(name);
  } catch {
    failures.push(name);
  }
}

const pkg = JSON.parse(readFileSync("package.json", "utf8"));
const rpcHint = Object.keys(pkg.scripts || {}).filter((name) => /api|rpc|health|chat/i.test(name));

const payload = {
  timestamp: new Date().toISOString(),
  sha,
  mode: "offline-synthetic",
  externalCalls: 0,
  discoveredHealthOrApiScripts: rpcHint,
  checked: checks.length,
  failures,
};

const severity = failures.length ? "CRITICAL" : "INFO";
const record = execFileSync(process.execPath, [sink, "record", "--scanner", "synthetic-health-check", "--severity", severity, "--message", failures.length ? "Synthetic health check failed" : "Synthetic health check PASS", "--details", JSON.stringify(payload)], { encoding: "utf8" });
process.stdout.write(record);
if (failures.length) process.exit(1);
