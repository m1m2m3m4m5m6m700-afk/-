import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const requiredFiles = [
  "src/lib/ai/failure-memory/types.ts",
  "src/lib/ai/failure-memory/signature.ts",
  "src/lib/ai/failure-memory/store.ts",
  "src/lib/ai/failure-memory/service.ts",
  "src/lib/ai/failure-memory/index.ts",
];

const failures = [];
for (const relative of requiredFiles) {
  if (!fs.existsSync(path.join(root, relative))) failures.push(`Missing ${relative}`);
}

const serviceSource = fs.readFileSync(path.join(root, "src/lib/ai/failure-memory/service.ts"), "utf8");
const signatureSource = fs.readFileSync(path.join(root, "src/lib/ai/failure-memory/signature.ts"), "utf8");
const aiServiceSource = fs.readFileSync(path.join(root, "src/lib/ai/aiService.ts"), "utf8");

for (const [source, label, needles] of [
  [signatureSource, "signature", ["createHash(\"sha256\")", "digest(\"hex\")"]],
  [serviceSource, "memory service", ["recordFailure", "find(", "resolve(", "confidence("]],
  [aiServiceSource, "AI service integration", ["failureMemory.recordFailure", "diagnosticCode", "provider.id"]],
]) {
  for (const needle of needles) if (!source.includes(needle)) failures.push(`${label} missing ${needle}`);
}

if (/autoApply\s*[:=]\s*true/.test(serviceSource) || /autoApply\s*[:=]\s*true/.test(aiServiceSource)) {
  failures.push("Failure Memory must never enable autoApply=true.");
}

if (failures.length) {
  console.error(`Failure Memory validation failed with ${failures.length} issue(s).`);
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("Failure Memory validation: PASS");
