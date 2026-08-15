import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const required = [
  "src/data/tools.ts",
  "src/data/categories.ts",
  "src/lib/tool-runtime/types.ts",
  "src/lib/tool-runtime/readyTools.ts",
  "src/lib/tool-quality/contract.ts",
  "scripts/generate-tool.mjs",
];
const issues = [];
for (const file of required) if (!fs.existsSync(path.join(root, file))) issues.push(`Missing canonical phase-1 file: ${file}`);

const tools = fs.readFileSync(path.join(root, "src/data/tools.ts"), "utf8");
const contract = fs.readFileSync(path.join(root, "src/lib/tool-quality/contract.ts"), "utf8");
const generator = fs.readFileSync(path.join(root, "scripts/generate-tool.mjs"), "utf8");

if (fs.existsSync(path.join(root, "src/tools"))) issues.push("Do not create src/tools: the existing runtime remains canonical.");
if (!tools.includes("export const tools: Tool[]")) issues.push("Canonical tool registry marker is missing.");
for (const status of ["planned", "ready", "automated_pass", "manual_pass", "public", "failed", "blocked", "deprecated"]) {
  if (!contract.includes(`"${status}"`)) issues.push(`Canonical lifecycle is missing ${status}.`);
}
for (const gate of ["runtime", "automated", "manual", "localization", "accessibility", "performance", "seo", "security"]) {
  if (!contract.includes(`"${gate}"`)) issues.push(`Release gate is missing ${gate}.`);
}
for (const term of ["id", "slug", "category", "validation", "metadata", "permissions", "limits", "dependencies", "lifecycle"]) {
  if (!contract.includes(`${term}:`)) issues.push(`Canonical tool contract is missing ${term}.`);
}
for (const term of ["Duplicate tool ID", "Duplicate tool slug", "Duplicate route candidate", "Invalid or missing category", "Invalid runtime"]) {
  if (!generator.includes(term)) issues.push(`Generator does not guard ${term}.`);
}

if (issues.length) throw new Error(`Tool contract validation failed:\n- ${issues.join("\n- ")}`);
console.log("Tool contract validation passed: canonical registry, runtime, lifecycle, gates and generator guards are present.");
