import fs from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const issues = [];

const exists = async (relative) => {
  try {
    await fs.access(path.join(root, relative));
    return true;
  } catch {
    return false;
  }
};

const legacyPaths = [
  "src/data/megaToolsCatalog.ts",
  "src/lib/megaToolsEngine.ts",
  "src/scripts/validate-mega-tools.mjs",
  "tests/mega-tools.spec.ts",
];

for (const file of legacyPaths) {
  if (await exists(file)) issues.push(`Legacy PDF/MegaTool file still exists: ${file}`);
}

const pdfTest = await fs.readFile(path.join(root, "tests/pdf-tools.spec.ts"), "utf8");
if (pdfTest.includes("megaToolsCatalog") || pdfTest.includes("megaToolsEngine")) {
  issues.push("PDF regression test still references removed MegaTool runtime.");
}

const runtimeRoot = path.join(root, "src/lib/tool-runtime/tools");
const runtimeFiles = await fs.readdir(runtimeRoot);
const pdfRuntimeFiles = runtimeFiles.filter((file) => /pdf/i.test(file));

if (pdfRuntimeFiles.length === 0) {
  console.log("PDF catalog audit: no canonical public PDF runtime is registered; legacy MegaTool PDF surface is absent.");
} else {
  console.log(`PDF catalog audit: ${pdfRuntimeFiles.length} canonical PDF runtime file(s) discovered.`);
}

if (issues.length) {
  console.error(`PDF catalog validation failed:\n- ${issues.join("\n- ")}`);
  process.exit(1);
}

console.log("PDF catalog validation passed: canonical runtime boundary is clean.");
