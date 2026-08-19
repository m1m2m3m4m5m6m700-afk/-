import { readFile } from "node:fs/promises";

const failures = [];
const fail = (message) => failures.push(message);
const playwright = await readFile("playwright.config.ts", "utf8");
const desktop = await readFile("tests/desktop-tools.spec.ts", "utf8");

if (!playwright.includes("reuseExistingServer: false")) fail("E2E server reuse must be disabled for isolation.");
if (!playwright.includes("fullyParallel: false")) fail("Desktop verification must remain deterministic and isolated.");
if (!playwright.includes("trace: \"retain-on-failure\"")) fail("Failure traces must be retained.");
if (/globalThis\.|window\.[A-Z_]+\s*=/.test(desktop)) fail("Global browser state mutation detected in desktop tests.");
if (/process\.env\.[A-Z_]+\s*=/.test(desktop)) fail("Environment mutation detected in desktop tests.");
if (/setTimeout\([^\n]*\d{4,}/.test(desktop)) fail("Long arbitrary sleeps are forbidden; use condition-based waits.");

if (failures.length) {
  console.error("FLAKY/ISOLATION GATE: FAIL");
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exit(1);
}
console.log("FLAKY/ISOLATION GATE: PASS");
