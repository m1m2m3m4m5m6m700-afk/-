import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const catalog = fs.readFileSync(path.join(root, "src/data/megaToolsCatalog.ts"), "utf8");
const engine = fs.readFileSync(path.join(root, "src/lib/megaToolsEngine.ts"), "utf8");

const strict = process.argv.includes("--strict");

const declaredHandlers = [
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

const implementedHandlers = declaredHandlers.filter((handler) =>
  engine.includes(`tool.handler === "${handler}"`),
);
const roadmapHandlers = declaredHandlers.filter(
  (handler) => !implementedHandlers.includes(handler),
);

const catalogHandlers = declaredHandlers.filter((handler) =>
  catalog.includes(`["${handler}"`),
);
const missingFromCatalog = declaredHandlers.filter(
  (handler) => !catalogHandlers.includes(handler),
);

const presetsMatch = catalog.match(/export const PRESETS = \[(.*?)\] as const/s);
const presetCount = presetsMatch ? (presetsMatch[1].match(/\[\"/g) ?? []).length : 0;
const declaredPdfVariants = (catalog.match(/slug: `mega-pdf-/g) ?? []).length;

const issues = [];
const advisories = [];

if (missingFromCatalog.length) {
  issues.push(`Missing declared PDF handlers from catalog: ${missingFromCatalog.join(", ")}`);
}

if (presetCount !== 11) {
  issues.push(`Expected 11 presets, found ${presetCount}.`);
}

if (declaredPdfVariants !== 0) {
  issues.push("PDF mega variants must remain generated from the canonical handler/preset catalog.");
}

if (roadmapHandlers.length) {
  advisories.push(
    `Roadmap PDF handlers are cataloged but not implemented: ${roadmapHandlers.join(", ")}`,
  );
}

const expectedVariants = implementedHandlers.length * presetCount;
const message = `PDF catalog audit: ${implementedHandlers.length} implemented handlers × ${presetCount} presets = ${expectedVariants} executable variants.`;
console.log(message);

for (const advisory of advisories) console.warn(`Advisory: ${advisory}`);

if (issues.length) {
  throw new Error(`PDF catalog validation failed:\n- ${issues.join("\n- ")}`);
}

if (strict && advisories.length) {
  throw new Error(`PDF catalog strict validation failed:\n- ${advisories.join("\n- ")}`);
}

console.log(strict ? "PDF catalog strict validation passed." : "PDF catalog advisory validation passed.");
