import fs from "node:fs/promises";
import path from "node:path";

const [, , toolId] = process.argv;
if (!toolId) {
  console.error("Usage: node scripts/test-generation.mjs <tool-id>");
  process.exit(2);
}

const root = process.cwd();
const registry = await fs.readFile(path.join(root, "src/lib/tool-platform/publicDesktopTools.ts"), "utf8");
const contracts = await fs.readFile(path.join(root, "src/lib/tool-platform/testContracts.ts"), "utf8");

if (!registry.includes(`id: "${toolId}"`)) {
  console.error(`Unknown public tool: ${toolId}`);
  process.exit(1);
}
if (!contracts.includes(`toolId: "${toolId}"`)) {
  console.error(`Missing test contract: ${toolId}`);
  process.exit(1);
}

const suggestions = [
  { category: "contract", name: "manifest/registration consistency", reason: "Tool Platform registration must match runtime identity." },
  { category: "render", name: "route renders exactly once", reason: "Public route must expose the tool UI." },
  { category: "interaction", name: "primary input/output interaction", reason: "Main user flow must be executable." },
  { category: "output", name: "valid output artifact", reason: "Output must be non-empty and type-correct." },
  { category: "error", name: "invalid input path", reason: "User-visible failure must be explicit and bounded." },
  { category: "security", name: "secret/privacy boundary", reason: "Local-only tools must not exfiltrate sensitive input." },
  { category: "performance", name: "bounded operation", reason: "Expensive work needs measurable completion bounds." },
  { category: "accessibility", name: "keyboard and accessible name", reason: "Core controls must remain operable and discoverable." },
];

const report = {
  schemaVersion: 1,
  toolId,
  suggestions,
  generatedBy: "deterministic-tool-contract",
  requiresHumanReview: true,
  aiOptional: true,
  autoApply: false,
  generatedAt: new Date().toISOString(),
};

const outDir = path.join(root, ".artifacts", "test-generation");
await fs.mkdir(outDir, { recursive: true });
await fs.writeFile(path.join(outDir, `${toolId}.json`), JSON.stringify(report, null, 2));
console.log(JSON.stringify(report, null, 2));
