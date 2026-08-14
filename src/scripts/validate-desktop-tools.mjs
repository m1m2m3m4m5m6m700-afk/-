import fs from "node:fs";
import ts from "typescript";

const root = process.cwd();
const source = fs.readFileSync(`${root}/src/lib/desktop-tools/catalog.ts`, "utf8");
const transpiled = ts.transpileModule(source, {
  compilerOptions: {
    target: ts.ScriptTarget.ES2022,
    module: ts.ModuleKind.ESNext,
  },
}).outputText;

const moduleUrl = `data:text/javascript;base64,${Buffer.from(transpiled, "utf8").toString("base64")}`;
const { desktopToolCatalog } = await import(moduleUrl);
const issues = [];
const seenIds = new Set();
const seenSlugs = new Set();

for (const tool of desktopToolCatalog) {
  if (seenIds.has(tool.id)) issues.push(`Duplicate id: ${tool.id}`);
  if (seenSlugs.has(tool.slug)) issues.push(`Duplicate slug: ${tool.slug}`);
  seenIds.add(tool.id);
  seenSlugs.add(tool.slug);

  if (!tool.id || !tool.name || !tool.slug || !tool.description || typeof tool.run !== "function") {
    issues.push(`Incomplete tool contract: ${tool.id || "unknown"}`);
    continue;
  }

  try {
    const output = tool.run(tool.sampleInput);
    if (typeof output !== "string") issues.push(`${tool.slug}: output is not a string.`);
    if (tool.expectedSampleOutput !== undefined && output !== tool.expectedSampleOutput) {
      issues.push(
        `${tool.slug}: sample mismatch. Expected ${JSON.stringify(tool.expectedSampleOutput)}, got ${JSON.stringify(output)}.`,
      );
    }
  } catch (error) {
    issues.push(`${tool.slug}: execution threw ${error instanceof Error ? error.message : String(error)}.`);
  }
}

if (desktopToolCatalog.length < 120) {
  issues.push(`Desktop tool count is ${desktopToolCatalog.length}; required minimum is 120.`);
}

if (issues.length > 0) {
  throw new Error(`Desktop tool validation failed with ${issues.length} issue(s).\n- ${issues.join("\n- ")}`);
}

console.log(`Desktop tool validation passed: ${desktopToolCatalog.length} tools executed successfully with sample contracts.`);
