import { readFile, access } from "node:fs/promises";

const required = [
  ".artifacts/ci-proof.json",
];
const failures = [];
for (const file of required) {
  try { await access(file); } catch { failures.push(`Missing ${file}`); }
}

if (failures.length) {
  console.error("CI PROOF: BLOCKED");
  for (const failure of failures) console.error(`- ${failure}`);
  console.error("Run the full CI proof workflow and retain its artifact before promotion.");
  process.exit(1);
}

const evidence = JSON.parse(await readFile(".artifacts/ci-proof.json", "utf8"));
const requiredGates = ["foundation", "security", "tool-platform", "e2e", "engineering-completeness"];
const missing = requiredGates.filter((gate) => evidence.gates?.[gate] !== "PASS");
if (missing.length || evidence.sha !== process.env.GITHUB_SHA) {
  console.error("CI PROOF: FAIL");
  if (missing.length) console.error(`Missing/failed gates: ${missing.join(", ")}`);
  if (evidence.sha !== process.env.GITHUB_SHA) console.error(`SHA mismatch: evidence=${evidence.sha} current=${process.env.GITHUB_SHA}`);
  process.exit(1);
}

console.log(`CI PROOF: PASS (${requiredGates.length} gates, SHA ${evidence.sha})`);
