#!/usr/bin/env node
import { spawnSync } from "node:child_process";

const checks = [
  ["package/lock contract", "node", ["scripts/validate-package-lock-contract.mjs"]],
  ["CI contract", "npm", ["run", "validate-ci-contract"]],
  ["project contract", "npm", ["run", "validate:project-contract"]],
  ["test quality", "npm", ["run", "validate:test-quality"]],
  ["tool platform", "npm", ["run", "validate:tool-platform"]],
  ["tool lifecycle", "npm", ["run", "validate:tool-platform-lifecycle"]],
  ["tool boundaries", "npm", ["run", "validate:tool-platform-boundaries"]],
  ["tool runtime", "npm", ["run", "validate:tool-runtime"]],
  ["search catalog", "npm", ["run", "validate:search-catalog"]],
  ["SEO", "npm", ["run", "validate:seo"]],
  ["tool content", "npm", ["run", "validate:tool-content"]],
  ["localization", "npm", ["run", "validate:localization"]],
  ["strict security", "npm", ["run", "validate:security-strict"]],
  ["property fuzz", "npm", ["run", "test:property-fuzz"]],
  ["fault injection", "npm", ["run", "test:fault-injection"]],
  ["TypeScript", "npm", ["run", "typecheck"]],
  ["ESLint", "npm", ["run", "lint"]],
  ["public runtime preflight", "node", ["scripts/validate-release-tools.mjs"]],
  ["Playwright collection", "npx", ["playwright", "test", "tests/desktop-tools.spec.ts", "--list"]],
];

console.log("FLIXO FAST FAIL GATE");
console.log("Order: cheapest/static contracts first, browser/build last.");
console.log(`Checks: ${checks.length}`);

const started = Date.now();
for (const [name, command, args] of checks) {
  const checkStarted = Date.now();
  console.log(`\n[FAST] ${name}`);
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
    console.error("Fix this failure before installing browsers or running release E2E.");
    process.exit(result.status ?? 1);
  }

  console.log(`[PASS] ${name} (${((Date.now() - checkStarted) / 1000).toFixed(1)}s)`);
}

console.log(`\nFAST FAIL GATE PASSED in ${((Date.now() - started) / 1000).toFixed(1)}s`);
