import fs from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const outputDir = path.join(root, ".artifacts", "diagnostics");
const outputPath = path.join(outputDir, "tool-platform-health.json");
const read = (file) => fs.readFile(path.join(root, file), "utf8");

const diagnostics = [];
const add = (severity, code, message, context = {}) =>
  diagnostics.push({ severity, code, message, ...context });

const publicSource = await read("src/lib/tool-platform/publicDesktopTools.ts");
const contractsSource = await read("src/lib/tool-platform/testContracts.ts");
const categoriesSource = await read("src/lib/tool-platform/categories.ts");
const typesSource = await read("src/lib/tool-platform/types.ts");

const publicTools = [...publicSource.matchAll(/id:\s*"([^"]+)"[\s\S]*?slug:\s*"([^"]+)"/g)].map((m) => ({
  id: m[1],
  slug: m[2],
}));
const contracts = [...contractsSource.matchAll(/toolId:\s*"([^"]+)"\s*,\s*route:\s*"([^"]+)"/g)].map((m) => ({
  toolId: m[1],
  route: m[2],
}));

const countDuplicates = (values) => {
  const seen = new Set();
  const duplicates = new Set();
  for (const value of values) {
    if (seen.has(value)) duplicates.add(value);
    seen.add(value);
  }
  return [...duplicates];
};

for (const duplicate of countDuplicates(publicTools.map((tool) => tool.id))) {
  add("error", "DUPLICATE_PUBLIC_TOOL_ID", `Duplicate public tool id: ${duplicate}`, { toolId: duplicate });
}
for (const duplicate of countDuplicates(publicTools.map((tool) => tool.slug))) {
  add("error", "DUPLICATE_PUBLIC_TOOL_SLUG", `Duplicate public tool slug: ${duplicate}`, {
    route: `/tools/${duplicate}`,
  });
}
for (const duplicate of countDuplicates(contracts.map((entry) => entry.route))) {
  add("error", "DUPLICATE_TOOL_ROUTE", `Duplicate tool test route: ${duplicate}`, {
    route: duplicate,
  });
}
for (const duplicate of countDuplicates(contracts.map((entry) => entry.toolId))) {
  add("error", "DUPLICATE_TEST_CONTRACT", `Duplicate test contract: ${duplicate}`, {
    toolId: duplicate,
  });
}

const publicIds = new Set(publicTools.map((tool) => tool.id));
const publicSlugs = new Set(publicTools.map((tool) => tool.slug));
const contractIds = new Set(contracts.map((entry) => entry.toolId));

for (const tool of publicTools) {
  if (!contractIds.has(tool.id)) {
    add("error", "PUBLIC_TOOL_MISSING_TEST", `Public tool has no test contract: ${tool.id}`, {
      toolId: tool.id,
      route: `/tools/${tool.slug}`,
    });
  }
  const matching = contracts.find((entry) => entry.toolId === tool.id);
  if (matching && matching.route !== `/tools/${tool.slug}`) {
    add("error", "TOOL_ROUTE_SLUG_MISMATCH", `Route does not match public slug for ${tool.id}.`, {
      toolId: tool.id,
      route: matching.route,
      details: { expected: `/tools/${tool.slug}` },
    });
  }
}

for (const entry of contracts) {
  if (!publicIds.has(entry.toolId)) {
    add("error", "TEST_TOOL_NOT_REGISTERED", `Test contract references unknown public tool: ${entry.toolId}`, {
      toolId: entry.toolId,
      route: entry.route,
    });
  }
}

if (!publicSource.includes("publicToolRegistrations")) {
  add("error", "CANONICAL_REGISTRY_EXPORT_MISSING", "publicToolRegistrations export is missing from the canonical registry.");
}
if (!publicSource.includes("toolBaseManifestSchema")) {
  add("error", "MANIFEST_SCHEMA_MISSING", "Canonical manifests are not validated through toolBaseManifestSchema.");
}
if (!contractsSource.includes("publicToolTestContracts")) {
  add("error", "TEST_CONTRACT_EXPORT_MISSING", "publicToolTestContracts export is missing.");
}
if (!categoriesSource.includes("export const categoryCatalog")) {
  add("error", "CATEGORY_CATALOG_MISSING", "Canonical categoryCatalog export is missing.");
}
if (!typesSource.includes("export interface PublicToolRegistration")) {
  add("error", "PUBLIC_REGISTRATION_TYPE_MISSING", "PublicToolRegistration type is missing from Tool Platform types.");
}

const errors = diagnostics.filter((entry) => entry.severity === "error");
const warnings = diagnostics.filter((entry) => entry.severity === "warning");
const report = {
  schemaVersion: 2,
  generatedAt: new Date().toISOString(),
  source: "src/lib/tool-platform",
  counts: {
    publicTools: publicTools.length,
    testContracts: contracts.length,
    uniquePublicSlugs: publicSlugs.size,
    uniqueTestToolIds: contractIds.size,
    errors: errors.length,
    warnings: warnings.length,
  },
  certificationEligible: errors.length === 0,
  diagnostics,
};

await fs.mkdir(outputDir, { recursive: true });
await fs.writeFile(outputPath, JSON.stringify(report, null, 2));

console.log(`Tool platform diagnostics: ${errors.length} error(s), ${warnings.length} warning(s).`);
for (const entry of diagnostics) {
  const target = entry.toolId ? ` [${entry.toolId}]` : "";
  console.log(`${entry.severity.toUpperCase()} ${entry.code}${target}: ${entry.message}`);
}

if (errors.length > 0) process.exit(1);
