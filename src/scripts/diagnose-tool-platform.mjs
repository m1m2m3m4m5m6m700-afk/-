import fs from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const outputDir = path.join(root, ".artifacts", "diagnostics");
const outputPath = path.join(outputDir, "tool-platform-health.json");
const read = (file) => fs.readFile(path.join(root, file), "utf8");

const diagnostics = [];
const add = (severity, code, message, context = {}) =>
  diagnostics.push({ severity, code, message, ...context });

const toolsSource = await read("src/data/tools.ts");
const publicSource = await read("src/lib/tool-platform/publicDesktopTools.ts");
const testsSource = await read("src/lib/tool-platform/testContracts.ts");
const typesSource = await read("src/lib/tool-platform/types.ts");

const toolIds = [...toolsSource.matchAll(/t\(\s*"([^"]+)"\s*,\s*"([^"]+)"\s*,/g)].map((m) => m[1]);
const readyTools = [...toolsSource.matchAll(/t\(\s*"([^"]+)"\s*,[\s\S]*?,\s*"ready"\s*,[\s\S]*?,\s*"([^"]+)"\)/g)].map((m) => ({ id: m[1], slug: m[2] }));
const publicTools = [...publicSource.matchAll(/id:\s*"([^"]+)"[\s\S]*?slug:\s*"([^"]+)"/g)].map((m) => ({ id: m[1], slug: m[2] }));
const routes = [...testsSource.matchAll(/\{\s*toolId:\s*"([^"]+)"\s*,\s*route:\s*"([^"]+)"/g)].map((m) => ({ toolId: m[1], route: m[2] }));

const countDuplicates = (values) => {
  const seen = new Set();
  const duplicates = new Set();
  for (const value of values) {
    if (seen.has(value)) duplicates.add(value);
    seen.add(value);
  }
  return [...duplicates];
};

for (const duplicate of countDuplicates(toolIds)) {
  add("error", "DUPLICATE_TOOL_ID", `Duplicate catalog tool id: ${duplicate}`, { toolId: duplicate });
}
for (const duplicate of countDuplicates(publicTools.map((tool) => tool.id))) {
  add("error", "DUPLICATE_PUBLIC_TOOL_ID", `Duplicate public tool id: ${duplicate}`, { toolId: duplicate });
}
for (const duplicate of countDuplicates(publicTools.map((tool) => tool.slug))) {
  add("error", "DUPLICATE_PUBLIC_TOOL_SLUG", `Duplicate public tool slug: ${duplicate}`, { route: `/tools/${duplicate}` });
}
for (const duplicate of countDuplicates(routes.map((entry) => entry.route))) {
  add("error", "DUPLICATE_TOOL_ROUTE", `Duplicate tool test route: ${duplicate}`, { route: duplicate });
}

const catalogIds = new Set(toolIds);
const publicIds = new Set(publicTools.map((tool) => tool.id));
const publicSlugs = new Set(publicTools.map((tool) => tool.slug));
const testIds = new Set(routes.map((entry) => entry.toolId));

for (const tool of publicTools) {
  if (!catalogIds.has(tool.id)) {
    add("error", "PUBLIC_TOOL_NOT_IN_CATALOG", `Public registration references unknown catalog tool: ${tool.id}`, { toolId: tool.id });
  }
  const matchingRoute = routes.find((entry) => entry.toolId === tool.id);
  if (!matchingRoute) {
    add("error", "PUBLIC_TOOL_MISSING_TEST", `Public tool has no test contract: ${tool.id}`, { toolId: tool.id, route: `/tools/${tool.slug}` });
  } else if (matchingRoute.route !== `/tools/${tool.slug}`) {
    add("error", "TOOL_ROUTE_SLUG_MISMATCH", `Route does not match public slug for ${tool.id}.`, {
      toolId: tool.id,
      route: matchingRoute.route,
      details: { expected: `/tools/${tool.slug}` },
    });
  }
}

for (const entry of routes) {
  if (!catalogIds.has(entry.toolId)) {
    add("error", "TEST_TOOL_NOT_IN_CATALOG", `Test contract references unknown catalog tool: ${entry.toolId}`, { toolId: entry.toolId, route: entry.route });
  }
}

for (const tool of readyTools) {
  if (!publicIds.has(tool.id)) {
    add("warning", "READY_TOOL_NOT_PUBLIC_REGISTRY", `Ready tool is not in the public/certified registration surface: ${tool.id}.`, {
      toolId: tool.id,
      route: `/tools/${tool.slug}`,
    });
  }
}

if (!typesSource.includes('export type ToolDiagnosticSeverity = "info" | "warning" | "error";') && !typesSource.includes("ToolDiagnosticSeverity")) {
  add("warning", "DIAGNOSTICS_NOT_IN_CORE_TYPES", "Central diagnostics contract exists outside Tool platform types; consider consolidating it later.");
}

const errors = diagnostics.filter((entry) => entry.severity === "error");
const warnings = diagnostics.filter((entry) => entry.severity === "warning");
const report = {
  schemaVersion: 1,
  generatedAt: new Date().toISOString(),
  counts: {
    catalogTools: toolIds.length,
    readyTools: readyTools.length,
    publicTools: publicTools.length,
    testContracts: routes.length,
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
