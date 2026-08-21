import { readFile } from "node:fs/promises";

const failures = [];
const fail = (message) => failures.push(message);
const playwright = await readFile("playwright.config.ts", "utf8");
const workflow = await readFile(".github/workflows/ci.yml", "utf8");

if (!playwright.includes("trace: \"retain-on-failure\"")) fail("Playwright trace retention is required.");
if (!playwright.includes("reporter:")) fail("Playwright reporter must be explicitly configured.");
if (!workflow.includes("name: Failure Diagnosis")) fail("CI must define a dedicated failure diagnosis job.");
if (!workflow.includes("node scripts/diagnose-ci-failure.mjs")) fail("CI must invoke the failure diagnostic engine.");
if (!workflow.includes("if: ${{ always() &&")) fail("CI must preserve diagnostics even when an upstream gate fails.");
if (!workflow.includes("name: Upload Playwright report")) fail("CI must define a Playwright report upload step.");
if (!workflow.includes("if: always()")) fail("CI must preserve Playwright artifacts after test failure.");
if (!workflow.includes("playwright-report")) fail("CI must expose Playwright report artifacts on failure.");
if (!workflow.includes("test-results")) fail("CI must expose raw test-results on failure.");

if (failures.length) {
  console.error("FAILURE QUALITY GATE: FAIL");
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exit(1);
}
console.log("FAILURE QUALITY GATE: PASS");
