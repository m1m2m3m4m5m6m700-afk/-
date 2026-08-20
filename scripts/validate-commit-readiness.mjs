import fs from "node:fs";
import { spawnSync } from "node:child_process";

const baselinePath = ".governance/commit-baseline.json";
const failures = [];
const warnings = [];
const commands = [
  ["package/lock contract", "node", ["scripts/validate-package-lock-contract.mjs"]],
  ["regression prevention", "node", ["scripts/validate-regression-prevention.mjs"]],
  ["project contract", "node", ["src/scripts/validate-project-contract.mjs"]],
  ["test quality", "node", ["src/scripts/validate-test-quality.mjs"]],
  ["tool platform", "node", ["src/scripts/validate-tool-platform.mjs"]],
  ["tool lifecycle", "node", ["src/scripts/validate-tool-platform-lifecycle.mjs"]],
  ["engineering completeness", "node", ["scripts/validate-engineering-completeness.mjs"]],
  ["error intelligence", "node", ["scripts/test-error-intelligence.mjs"]],
];

function run(label, executable, args) {
  const result = spawnSync(executable, args, { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] });
  if (result.status !== 0) {
    failures.push(`${label}: command failed`);
    if (result.stdout) process.stdout.write(result.stdout);
    if (result.stderr) process.stderr.write(result.stderr);
    return false;
  }
  return true;
}

if (!fs.existsSync(baselinePath)) {
  failures.push(`missing commit baseline: ${baselinePath}`);
} else {
  try {
    const baseline = JSON.parse(fs.readFileSync(baselinePath, "utf8"));
    const current = {
      directLegacyImports: Number(process.env.FLIXO_DIRECT_LEGACY_IMPORTS ?? baseline.directLegacyImports),
      compatibilityShimImports: Number(process.env.FLIXO_COMPAT_SHIM_IMPORTS ?? baseline.compatibilityShimImports),
    };
    if (current.directLegacyImports > baseline.directLegacyImports) {
      failures.push(`direct legacy imports increased: ${current.directLegacyImports} > ${baseline.directLegacyImports}`);
    }
    if (current.compatibilityShimImports > baseline.compatibilityShimImports) {
      failures.push(`compatibility-shim imports increased: ${current.compatibilityShimImports} > ${baseline.compatibilityShimImports}`);
    }
    if (current.directLegacyImports < baseline.directLegacyImports) {
      warnings.push(`legacy debt improved: ${baseline.directLegacyImports} → ${current.directLegacyImports}`);
    }
    if (current.compatibilityShimImports < baseline.compatibilityShimImports) {
      warnings.push(`compatibility-shim debt improved: ${baseline.compatibilityShimImports} → ${current.compatibilityShimImports}`);
    }
  } catch (error) {
    failures.push(`invalid commit baseline: ${error.message}`);
  }
}

for (const [label, executable, args] of commands) run(label, executable, args);

const score = failures.length === 0 ? 100 : Math.max(0, 100 - failures.length * 15);
console.log(`COMMIT READINESS SCORE: ${score}/100`);
for (const warning of warnings) console.warn(`- ${warning}`);

if (failures.length) {
  console.error("COMMIT READINESS: BLOCKED");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("COMMIT READINESS: ALLOWED");
console.log("Policy: 0 blocking failures and no increase in known technical debt.");
