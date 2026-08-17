import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const issues = [];

const files = {
  types: "src/lib/tool-platform/types.ts",
  registry: "src/lib/tool-platform/registry.ts",
  publicRegistry: "src/lib/tool-platform/public-registry.ts",
  promotion: "src/lib/tool-platform/promotion.ts",
  testContract: "src/lib/tool-platform/test-contract.ts",
  publicRuntime: "src/lib/tool-runtime/readyTools.ts",
};

for (const [label, relativePath] of Object.entries(files)) {
  if (!fs.existsSync(path.join(root, relativePath))) issues.push(`Missing ${label}: ${relativePath}`);
}

const publicRegistrySource = fs.readFileSync(path.join(root, files.publicRegistry), "utf8");
const publicRuntimeSource = fs.readFileSync(path.join(root, files.publicRuntime), "utf8");

if (!/publicToolRegistrations:\s*readonly PublicToolRegistration\[\]\s*=\s*\[\]/.test(publicRegistrySource)) {
  issues.push("Public registration extension point must start empty on the clean baseline.");
}

if (!/readyToolRuntimes\s*=\s*\[\]/.test(publicRuntimeSource)) {
  issues.push("Legacy runtime registry must remain empty on the clean baseline.");
}

const legacyRuntimeDir = path.join(root, "src/lib/tool-runtime/tools");
if (!fs.existsSync(legacyRuntimeDir)) issues.push("Legacy runtime directory must remain preserved for rollback.");

const typeSource = fs.readFileSync(path.join(root, files.types), "utf8");
if (/from\s+["']@\/data\/tools["']/.test(typeSource)) {
  issues.push("Tool platform types must not import the legacy catalog.");
}

const platformFiles = fs
  .readdirSync(path.join(root, "src/lib/tool-platform"), { withFileTypes: true })
  .filter((entry) => entry.isFile() && /\.(ts|tsx)$/.test(entry.name));

for (const entry of platformFiles) {
  const source = fs.readFileSync(path.join(root, "src/lib/tool-platform", entry.name), "utf8");
  if (/from\s+["']@\/data\/tools["']/.test(source)) {
    issues.push(`Platform file ${entry.name} imports the legacy tool catalog.`);
  }
}

if (issues.length) {
  throw new Error(`Tool platform validation failed with ${issues.length} issue(s).\n- ${issues.join("\n- ")}`);
}

console.log("Tool platform architecture: PASS");
console.log("Public registrations: 0");
console.log("Legacy runtime source: preserved");
console.log("Platform contracts: isolated from legacy catalog");
