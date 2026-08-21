import fs from "node:fs";
import path from "node:path";

const file = path.join(process.cwd(), "src/config/tools.ts");
const source = fs.readFileSync(file, "utf8");

if (!source.includes("export const TOOLS_REGISTRY")) throw new Error("Canonical TOOLS_REGISTRY export is missing.");
if (!/TOOLS_REGISTRY:\s*readonly ToolConfig\[\]\s*=\s*Object\.freeze\(\[\]\)/.test(source)) throw new Error("Product reset requires an empty canonical registry.");
if (source.includes("@/data/tools") || source.includes("megaToolsCatalog")) throw new Error("Legacy tool catalog references remain in the canonical registry.");
console.log("Registry validation passed: no public tools are enabled.");
