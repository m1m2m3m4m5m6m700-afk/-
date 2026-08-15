import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const toolsSource = fs.readFileSync(path.join(root, "src/data/tools.ts"), "utf8");
const contractSource = fs.readFileSync(path.join(root, "src/lib/tool-quality/contract.ts"), "utf8");
const registrySource = fs.readFileSync(path.join(root, "src/scripts/validate-registry.mjs"), "utf8");
const runtimeSource = fs.readFileSync(path.join(root, "src/scripts/validate-tool-runtime.mjs"), "utf8");

const issues = [];

const requiredContractTerms = [
  'ToolRuntimeStatus',
  'ToolReviewStatus',
  'PUBLIC_TOOL_REQUIREMENTS',
  'isPublicTool',
  'qualityScore',
];
for (const term of requiredContractTerms) {
  if (!contractSource.includes(term)) issues.push(`Tool quality contract is missing ${term}.`);
}

if (!toolsSource.includes('status: ToolStatus')) {
  issues.push('Canonical tool registry must expose explicit runtime status.');
}

if (!registrySource.includes('ready')) issues.push('Registry validator must understand ready tools.');
if (!runtimeSource.includes('ready')) issues.push('Runtime validator must validate ready tools.');

// Public publication is deliberately stricter than "ready": manual QA and all
// quality dimensions must be satisfied before a future search adapter exposes it.
if (!contractSource.includes('record.reviewStatus === "manual_pass"')) {
  issues.push('Public publication must require manual_pass review status.');
}
if (!contractSource.includes('record.searchable')) {
  issues.push('Public publication must respect the searchable flag.');
}

if (issues.length) {
  throw new Error(`Tool quality contract failed:\n- ${issues.join("\n- ")}`);
}

console.log('Tool quality contract validation passed. Publication policy is stricter than runtime readiness.');
