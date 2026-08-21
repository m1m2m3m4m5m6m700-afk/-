import { execFileSync } from "node:child_process";
import { main } from "./_core.mjs";
await main("check-git-integrity", () => {
  const sha = execFileSync("git", ["rev-parse", "HEAD"], { encoding: "utf8" }).trim();
  const raw = execFileSync("git", ["status", "--porcelain", "--untracked-files=all"], { encoding: "utf8" }).trim();
  const status = raw ? raw.split("\n").filter(Boolean) : [];
  const findings = status.filter((entry) => {
    const path = entry.slice(3).trim();
    return !/^diagnostics\/(?:errors\.log\.json|DECISION_LOG\.md|verify-timing\.json)$/.test(path);
  });
  return { severity: findings.length ? "CRITICAL" : "INFO", message: findings.length ? "Workspace is not clean" : "Git integrity PASS", findings, details: { sha, ignoredGeneratedDiagnostics: status.filter((entry) => !findings.includes(entry)) } };
});
