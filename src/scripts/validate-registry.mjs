import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const toolsFile = path.join(root, "src/lib/tool-platform/publicDesktopTools.ts");
const contractsFile = path.join(root, "src/lib/tool-platform/testContracts.ts");
const categoriesFile = path.join(root, "src/lib/tool-platform/categories.ts");

for (const file of [toolsFile, contractsFile, categoriesFile]) {
  if (!fs.existsSync(file)) throw new Error(`Missing canonical tool-platform source: ${path.relative(root, file)}`);
}

const tools = fs.readFileSync(toolsFile, "utf8");
const contracts = fs.readFileSync(contractsFile, "utf8");
const categories = fs.readFileSync(categoriesFile, "utf8");
const issues = [];

const ids = [...tools.matchAll(/id:\s*"([^"]+)"/g)].map((m) => m[1]);
const slugs = [...tools.matchAll(/slug:\s*"([^"]+)"/g)].map((m) => m[1]);
const contractIds = [...contracts.matchAll(/toolId:\s*"([^"]+)"/g)].map((m) => m[1]);

const duplicates = (values) => [...new Set(values.filter((value, index) => values.indexOf(value) !== index))];
for (const id of duplicates(ids)) issues.push(`Duplicate canonical tool id: ${id}`);
for (const slug of duplicates(slugs)) issues.push(`Duplicate canonical tool slug: ${slug}`);
for (const id of duplicates(contractIds)) issues.push(`Duplicate test contract: ${id}`);

if (!tools.includes("publicToolRegistrations")) issues.push("Canonical publicToolRegistrations export is missing.");
if (!tools.includes("toolBaseManifestSchema")) issues.push("Canonical manifest schema validation is missing.");
if (!contracts.includes("publicToolTestContracts")) issues.push("Canonical public tool test contracts export is missing.");
if (!categories.includes("export const categories")) issues.push("Canonical category registry is missing its categories export.");

const report = {
  schemaVersion: 2,
  source: "src/lib/tool-platform",
  canonicalTools: ids.length,
  canonicalContracts: contractIds.length,
  errors: issues.length,
  certificationEligible: issues.length === 0,
  issues,
};

const outputDir = path.join(root, ".artifacts", "gates");
fs.mkdirSync(outputDir, { recursive: true });
fs.writeFileSync(path.join(outputDir, "tool-registry.json"), JSON.stringify(report, null, 2));

if (issues.length) {
  console.error(`Registry validation failed with ${issues.length} issue(s).`);
  for (const issue of issues) console.error(`- ${issue}`);
  process.exit(1);
}

console.log(`Registry validation passed: ${ids.length} canonical public tools.`);
