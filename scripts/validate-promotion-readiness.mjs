import { readFile, access } from "node:fs/promises";

const checks = [
  ["DR drill", ".artifacts-drill-evidence.json"],
  ["IR drill", ".artifacts/incident-drill/incident-report.json"],
  ["CI proof", ".artifacts/ci-proof.json"],
];
const failures = [];
for (const [label, file] of checks) {
  try { await access(file); } catch { failures.push(`${label}: missing ${file}`); }
}

let ciProof = null;
if (!failures.length) ciProof = JSON.parse(await readFile(".artifacts/ci-proof.json", "utf8"));
if (ciProof && ciProof.sha !== (process.env.GITHUB_SHA ?? "local")) failures.push(`CI proof SHA mismatch: ${ciProof.sha}`);

const governancePath = "docs/engineering/governance.md";
try { await access(governancePath); } catch { failures.push("Governance contract missing"); }

if (failures.length) {
  console.error("PROMOTION READINESS: BLOCKED");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("PROMOTION READINESS: STRUCTURAL PASS");
console.log("Operational blockers remaining: exact-SHA Live AI evidence and actual GitHub main branch protection verification.");
