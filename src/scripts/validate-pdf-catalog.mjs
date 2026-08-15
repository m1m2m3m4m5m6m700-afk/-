import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const catalog = fs.readFileSync(path.join(root, "src/data/megaToolsCatalog.ts"), "utf8");
const engine = fs.readFileSync(path.join(root, "src/lib/megaToolsEngine.ts"), "utf8");

const expectedHandlers = [
  "inspect",
  "extract-text",
  "rotate",
  "page-numbers",
  "watermark",
  "remove-metadata",
  "duplicate",
  "extract-range",
  "split-even",
  "blank-cover",
  "flatten",
  "poster",
];

const missingFromCatalog = expectedHandlers.filter(
  (handler) => !catalog.includes(`[\"${handler}\"`),
);
const missingFromEngine = expectedHandlers.filter(
  (handler) => !engine.includes(`tool.handler === \"${handler}\"`) && !engine.includes(`tool.handler === \"${handler}\"`),
);

const presetsMatch = catalog.match(/export const PRESETS = \[(.*?)\] as const/s);
const presetCount = presetsMatch ? (presetsMatch[1].match(/\[\"/g) ?? []).length : 0;

const expectedVariants = expectedHandlers.length * 11;
const declaredPdfVariants = (catalog.match(/slug: `mega-pdf-/g) ?? []).length;

const issues = [];
if (missingFromCatalog.length) issues.push(`Missing PDF handlers from catalog: ${missingFromCatalog.join(", ")}`);
if (missingFromEngine.length) issues.push(`Missing PDF handlers from engine: ${missingFromEngine.join(", ")}`);
if (presetCount !== 11) issues.push(`Expected 11 presets, found ${presetCount}.`);
if (expectedVariants !== 132) issues.push(`Internal PDF variant expectation is ${expectedVariants}, expected 132.`);
if (declaredPdfVariants !== 0) {
  // MEGA_TOOLS is generated at runtime; this branch intentionally verifies that
  // the source does not try to hand-maintain a second static list of variants.
  issues.push("PDF mega variants must remain generated from the canonical handler/preset catalog.");
}

if (issues.length) {
  throw new Error(`PDF catalog validation failed:\n- ${issues.join("\n- ")}`);
}

console.log(`PDF catalog validation passed: ${expectedHandlers.length} handlers × ${presetCount} presets = 132 generated variants.`);
