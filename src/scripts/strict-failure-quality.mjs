import { readFile } from "node:fs/promises";

const failures = [];
const fail = (message) => failures.push(message);
const playwright = await readFile("playwright.config.ts", "utf8");
const workflow = await readFile(".github/workflows/tool-platform.yml", "utf8");

if (!playwright.includes("trace: \"retain-on-failure\"")) fail("Playwright trace retention is required.");
if (!playwright.includes("reporter:")) fail("Playwright reporter must be explicitly configured.");
if (!workflow.includes("if: failure()")) fail("CI must preserve failure diagnostics when a gate fails.");
if (!workflow.includes("playwright-report")) fail("CI must expose Playwright report artifacts on failure.");
if (!workflow.includes("test-results")) fail("CI must expose raw test-results on failure.");

if (failures.length) {
  console.error("FAILURE QUALITY GATE: FAIL");
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exit(1);
}
console.log("FAILURE QUALITY GATE: PASS");
