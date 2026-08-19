import { readFile } from "node:fs/promises";

const workflow = await readFile(".github/workflows/self-heal.yml", "utf8");
const packageLock = JSON.parse(await readFile("package-lock.json", "utf8"));

const failures = [];
const fail = (message) => failures.push(message);

if (!workflow.includes("workflow_dispatch:")) fail("Self-Heal must be manual-dispatch only.");
if (workflow.includes("workflow_run:")) fail("Self-Heal must not use workflow_run automation.");
if (workflow.includes("auto-correct.js")) fail("Self-Heal must not execute auto-correct automatically.");
if (workflow.includes("contents: write")) fail("Self-Heal must not have contents write permission.");
if (workflow.includes("pull-requests: write")) fail("Self-Heal must not have pull-request write permission.");
if (!workflow.includes("contents: read")) fail("Self-Heal must explicitly declare contents: read.");
if (!workflow.includes("actions: read")) fail("Self-Heal must explicitly declare actions: read.");
if (!workflow.includes("pull-requests: read")) fail("Self-Heal must explicitly declare pull-requests: read.");
if (workflow.includes("cache: npm")) fail("Manual Self-Heal diagnosis must not depend on npm cache or lockfile discovery.");
if (!workflow.includes("source_run_id")) fail("Manual Self-Heal must require source_run_id.");
if (!workflow.includes("failed_sha")) fail("Manual Self-Heal must require failed_sha.");
if (!workflow.includes("source_run_id")) fail("Manual Self-Heal must correlate diagnosis to an explicit source run.");
if (packageLock.lockfileVersion !== 3) fail("package-lock.json must remain lockfileVersion 3.");

if (failures.length) {
  console.error("SELF-HEAL PROCESS CONTRACT: FAIL");
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exit(1);
}

console.log("SELF-HEAL PROCESS CONTRACT: PASS");
