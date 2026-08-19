#!/usr/bin/env node
import { spawnSync } from "node:child_process";

const tiers = {
  fast: [
    ["package/lock contract", "node", ["scripts/validate-package-lock-contract.mjs"]],
    ["CI contract", "npm", ["run", "validate-ci-contract"]],
    ["project contract", "npm", ["run", "validate:project-contract"]],
    ["dependency tree health", "npm", ["ls", "--omit=dev", "--all", "--depth=0"]],
    ["dependency contract", "npm", ["run", "validate:dependencies"]],
    ["tool platform", "npm", ["run", "validate:tool-platform"]],
    ["tool lifecycle", "npm", ["run", "validate:tool-platform-lifecycle"]],
    ["tool boundaries", "npm", ["run", "validate:tool-platform-boundaries"]],
    ["tool runtime", "npm", ["run", "validate:tool-runtime"]],
    ["search catalog", "npm", ["run", "validate:search-catalog"]],
    ["SEO", "npm", ["run", "validate:seo"]],
    ["tool content", "npm", ["run", "validate:tool-content"]],
    ["localization", "npm", ["run", "validate:localization"]],
    ["accessibility contract", "npm", ["run", "validate:accessibility"]],
    ["security contract", "npm", ["run", "validate:security"]],
    ["TypeScript strict", "npm", ["run", "typecheck"]],
    ["ESLint", "npm", ["run", "lint"]],
    ["public runtime preflight", "node", ["scripts/validate-release-tools.mjs"]],
    ["Playwright collection", "npx", ["playwright", "test", "tests/desktop-tools.spec.ts", "--list"]],
  ],
  medium: [
    ["strict security", "npm", ["run", "validate:security-strict"]],
    ["property fuzz", "npm", ["run", "test:property-fuzz"]],
    ["fault injection", "npm", ["run", "test:fault-injection"]],
    ["flaky isolation", "npm", ["run", "validate:flaky-isolation"]],
    ["failure quality", "npm", ["run", "validate:failure-quality"]],
    ["performance/resource boundaries", "npm", ["run", "validate:performance"]],
  ],
  full: [
    ["production dependency audit", "npm", ["run", "audit:production"]],
  ],
};

const tier = process.argv[2] ?? "fast";
if (!(tier in tiers)) {
  console.error(`Unknown gate tier: ${tier}. Expected fast, medium, or full.`);
  process.exit(2);
}

const checks = tiers[tier];
const started = Date.now();
console.log(`FLIXO ${tier.toUpperCase()} FAIL GATE`);
console.log("Policy: cheapest checks first; heavier validation waits for prior tiers.");
console.log(`Checks: ${checks.length}`);

for (const [name, command, args] of checks) {
  const checkStarted = Date.now();
  console.log(`\n[${tier.toUpperCase()}] ${name}`);

  const result = spawnSync(command, args, {
    stdio: "inherit",
    shell: process.platform === "win32",
    env: { ...process.env, CI: process.env.CI ?? "1" },
  });

  if (result.error) {
    console.error(`[FAIL] ${name}: ${result.error.message}`);
    process.exit(1);
  }

  if (result.status !== 0) {
    console.error(`[FAIL] ${name} after ${((Date.now() - checkStarted) / 1000).toFixed(1)}s`);
    console.error(`STOP: fix ${tier} gate failure before starting the next gate.`);
    process.exit(result.status ?? 1);
  }

  console.log(`[PASS] ${name} (${((Date.now() - checkStarted) / 1000).toFixed(1)}s)`);
}

console.log(`\n${tier.toUpperCase()} FAIL GATE PASSED in ${((Date.now() - started) / 1000).toFixed(1)}s`);
