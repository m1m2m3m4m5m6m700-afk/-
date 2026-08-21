import { execFileSync } from "node:child_process";
import { main } from "./_core.mjs";

const GENERATED_PATHS = [
  /^diagnostics(?:\/|$)/,
  /^errors\.log\.json$/,
  /^DECISION_LOG\.md$/,
];
function pathFromStatus(line) {
  return line.replace(/^[ MADRCU?!]+/, "").split(" -> ").pop() ?? line;
}

await main("check-git-integrity", () => {
  const sha = execFileSync("git", ["rev-parse", "HEAD"], { encoding: "utf8" }).trim();
  const status = execFileSync("git", ["status", "--porcelain", "--untracked-files=all"], { encoding: "utf8" }).trim().split("\n").filter(Boolean);
  const findings = status
    .filter((entry) => !GENERATED_PATHS.some((pattern) => pattern.test(pathFromStatus(entry))))
    .map(pathFromStatus);
  return {
    severity: findings.length ? "CRITICAL" : "INFO",
    message: findings.length ? "Unexpected workspace changes detected" : "Git integrity PASS",
    findings,
    details: { sha, ignoredGeneratedChanges: status.length - findings.length },
  };
});
