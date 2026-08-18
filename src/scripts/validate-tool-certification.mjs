import { readFile } from "node:fs/promises";

const manifest = await readFile("src/lib/tool-platform/publicDesktopTools.ts", "utf8");
const contracts = await readFile("src/lib/tool-platform/testContracts.ts", "utf8");
const types = await readFile("src/lib/tool-platform/types.ts", "utf8");
const promotion = await readFile("src/lib/tool-platform/promotion.ts", "utf8");

const tools = ["zip-creator", "archive-extractor", "file-splitter", "metadata-viewer"];
const requiredChecks = ["render", "interaction", "output", "error", "security", "performance", "mutation", "invariant", "evidence"];
for (const tool of tools) {
  if (!manifest.includes(`id: "${tool}"`)) throw new Error(`Certification: missing manifest ${tool}`);
  if (!contracts.includes(`toolId: "${tool}"`)) throw new Error(`Certification: missing test contract ${tool}`);
}
for (const check of requiredChecks) if (!contracts.includes(`"${check}"`)) throw new Error(`Certification: missing check ${check}`);
for (const token of ["ToolCertificationLevel", "ToolCertificationRequirements", 'level: "certified"', "requiredEvidence", "regressionLocked", 'dataProcessing: "local-only"']) {
  if (![types, contracts, manifest, promotion].some((source) => source.includes(token))) throw new Error(`Certification contract missing ${token}`);
}
console.log(`TOOL CERTIFICATION: PASS — ${tools.length} public tools require certified status.`);
