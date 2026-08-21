import { readFile } from "node:fs/promises";

const runtimeTypes = await readFile("src/lib/tool-runtime/types.ts", "utf8");
if (runtimeTypes.includes("@/data/tools") || runtimeTypes.includes("Tool[\"id\"]")) {
  throw new Error("Runtime identity is still coupled to the legacy catalog.");
}

const runtime = await readFile("src/lib/tool-runtime/readyTools.ts", "utf8");
const registry = await readFile("src/config/tools.ts", "utf8");
const contracts = await readFile("src/lib/tool-platform/testContracts.ts", "utf8");
const promotion = await readFile("src/lib/tool-platform/promotion.ts", "utf8");
const types = await readFile("src/lib/tool-platform/types.ts", "utf8");
const schemas = await readFile("src/lib/tool-platform/schemas.ts", "utf8");

const publicTools = [...registry.matchAll(/\{\s*id:\s*"([^"]+)"[\s\S]*?isReady:\s*(true|false),/g)]
  .filter((match) => match[2] === "true")
  .map((match) => match[1]);

if (publicTools.length === 0) throw new Error("Central tool registry contains no ready tools.");
if (!runtime.includes("getReadyToolConfigs().map(toolConfigToRuntime)")) {
  throw new Error("Ready runtime is not derived from the central tool registry.");
}

for (const id of publicTools) {
  if (!runtime.includes("getReadyToolConfigs")) throw new Error(`Runtime registry missing central source: ${id}`);
  if (!registry.includes(`id: "${id}"`)) throw new Error(`Central registry missing: ${id}`);
  if (!contracts.includes(id)) throw new Error(`Test contract missing: ${id}`);
}

for (const required of [
  "ToolId",
  "ToolSlug",
  "ToolCategoryId",
  "ToolManifest",
  "ToolLifecycleState",
  "ToolTestContract",
  "ToolCertificationLevel",
  "ToolCertificationRequirements",
  "assertPublicRegistration",
]) {
  if (![types, promotion].some((source) => source.includes(required))) {
    throw new Error(`Platform contract missing: ${required}`);
  }
}

for (const schemaExport of [
  "toolCategoryIdSchema",
  "toolLifecycleStateSchema",
  "toolBaseManifestSchema",
  "toolTestContractSchema",
  "toolCertificationRequirementsSchema",
  "toolManifestSchema",
]) {
  if (!schemas.includes(`export const ${schemaExport}`)) {
    throw new Error(`Tool schema contract missing: ${schemaExport}`);
  }
}

for (const state of ["draft", "implemented", "verified", "public", "deprecated"]) {
  if (!types.includes(`"${state}"`) || !schemas.includes(`"${state}"`)) {
    throw new Error(`Lifecycle state missing from type/schema: ${state}`);
  }
}

for (const check of ["security", "performance", "mutation", "invariant", "evidence"]) {
  if (!contracts.includes(`"${check}"`) || !schemas.includes(`"${check}"`)) {
    throw new Error(`Certification check missing from contract/schema: ${check}`);
  }
}

if (!contracts.includes('level: "certified"')) throw new Error("Public certification level is not strict.");
if (!contracts.includes("requiredEvidence: true")) throw new Error("Evidence requirement is not strict.");
if (!contracts.includes("regressionLocked: true")) throw new Error("Regression lock is not strict.");
if (!contracts.includes('dataProcessing: "local-only"')) throw new Error("Local-only data policy is not strict.");

console.log(`Tool Platform architecture + certification + schema contract: PASS (${publicTools.length} ready tools)`);
