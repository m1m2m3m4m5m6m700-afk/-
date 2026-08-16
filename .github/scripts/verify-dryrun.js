import fs from "node:fs";
import { execFileSync } from "node:child_process";

const expectedSha = process.env.FAILED_SHA || process.env.GITHUB_EVENT_WORKFLOW_RUN_HEAD_SHA || "";
const allowedPrefixes = ["tests/"];
const allowedExact = new Set(["package-lock.json"]);

function run(command, args) {
  return execFileSync(command, args, { encoding: "utf8" }).trim();
}

if (!expectedSha) {
  console.error("verify-dryrun: FAILED_SHA is required");
  process.exit(1);
}

const head = run("git", ["rev-parse", "HEAD"]);
if (head !== expectedSha) {
  console.error(`verify-dryrun: HEAD mismatch. expected=${expectedSha} actual=${head}`);
  process.exit(1);
}

const changedText = run("git", ["diff", "--name-only"]) + "\n" + run("git", ["diff", "--cached", "--name-only"]);
const changed = [...new Set(changedText.split(/\r?\n/).map((value) => value.trim()).filter(Boolean))];

const unsafe = changed.filter((file) => file.startsWith("src/") || file.startsWith(".github/workflows/") || file.startsWith(".github/scripts/") || file.startsWith(".github/self-healing/"));
const disallowed = changed.filter((file) => !allowedExact.has(file) && !allowedPrefixes.some((prefix) => file.startsWith(prefix)));

const result = {
  expectedSha,
  actualSha: head,
  changed,
  unsafe,
  disallowed,
  dryRun: true,
  verified: unsafe.length === 0 && disallowed.length === 0,
  timestamp: new Date().toISOString(),
};

fs.mkdirSync(".github/self-healing/logs", { recursive: true });
fs.writeFileSync(".github/self-healing/logs/verify-dryrun.json", JSON.stringify(result, null, 2));
console.log(JSON.stringify(result, null, 2));

if (!result.verified) process.exit(1);
