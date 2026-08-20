import fs from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const required = [
  "docs/engineering/threat-model.md",
  "docs/engineering/provenance.md",
  "docs/engineering/observability.md",
  "docs/engineering/disaster-recovery.md",
  "docs/engineering/chaos.md",
  "docs/engineering/incident-response.md",
  "docs/engineering/completeness.md",
];

const failures = [];
for (const file of required) {
  try { await fs.access(path.join(root, file)); }
  catch { failures.push(`Missing ${file}`); }
}

const contents = {};
for (const file of required.filter((f) => !failures.some((x) => x.includes(f)))) {
  contents[file] = await fs.readFile(path.join(root, file), "utf8");
}

const requiredPhrases = {
  "docs/engineering/threat-model.md": ["Trust boundaries", "Prompt injection", "Secret leakage"],
  "docs/engineering/provenance.md": ["source SHA", "package-lock.json", "provenance"],
  "docs/engineering/observability.md": ["correlationId", "Logs", "Metrics", "Traces"],
  "docs/engineering/disaster-recovery.md": ["RPO", "RTO", "restore drill"],
  "docs/engineering/chaos.md": ["429", "5xx", "Database unavailable", "no secret leakage"],
  "docs/engineering/incident-response.md": ["Detect", "Diagnose", "Postmortem", "autoApply=true"],
  "docs/engineering/completeness.md": ["Threat Model", "Live AI Certification", "DRILL PENDING"],
};

for (const [file, phrases] of Object.entries(requiredPhrases)) {
  const text = contents[file] ?? "";
  for (const phrase of phrases) {
    if (!text.includes(phrase)) failures.push(`${file}: missing required contract phrase: ${phrase}`);
  }
}

if (failures.length) {
  console.error(`ENGINEERING COMPLETENESS: FAIL (${failures.length})`);
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log(`ENGINEERING COMPLETENESS: PASS (${required.length} layers registered)`);
console.log("Validated: threat model, provenance, observability, DR contract, chaos contract, incident response, status matrix.");
