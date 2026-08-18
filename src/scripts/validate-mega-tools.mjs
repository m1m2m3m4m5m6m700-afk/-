import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const catalogPath = path.join(root, "src/data/megaToolsCatalog.ts");
const source = fs.readFileSync(catalogPath, "utf8");

const categories = ["images", "video", "audio", "pdf"];
const expectedHandlers = {
  images: ["resize", "compress", "convert-png", "convert-jpg", "convert-webp", "rotate", "flip", "grayscale", "invert", "brightness", "contrast", "saturation"],
  video: ["inspect", "poster", "frame-25", "frame-50", "frame-75", "resize", "rotate", "flip", "mute", "speed", "metadata", "contact-sheet"],
  audio: ["inspect", "waveform", "peak", "rms", "normalize", "trim", "fade-in", "fade-out", "mono", "reverse", "speed", "wav"],
  pdf: ["inspect", "extract-text", "rotate", "page-numbers", "watermark", "remove-metadata", "duplicate", "extract-range", "split-even", "blank-cover", "flatten", "poster"],
};

const issues = [];
if (!source.includes("export const MEGA_TOOLS")) issues.push("MEGA_TOOLS export is missing.");
if (!source.includes("export const MEGA_TOOL_CATEGORIES")) issues.push("MEGA_TOOL_CATEGORIES export is missing.");
if (!source.includes("export const HANDLERS_BY_CATEGORY")) issues.push("HANDLERS_BY_CATEGORY export is missing.");
if (!source.includes("export const MEGA_TOOL_COUNT = MEGA_TOOLS.length")) {
  issues.push("MEGA_TOOL_COUNT must be derived from MEGA_TOOLS.length.");
}

const presetBlock = source.match(/export const PRESETS\s*=\s*\[([\s\S]*?)\]\s*as const;/);
if (!presetBlock) {
  issues.push("PRESETS definition is missing or not parseable.");
}
const presetCount = presetBlock ? [...presetBlock[1].matchAll(/\[\s*["']([^"']+)["']\s*,/g)].length : 0;
if (presetCount === 0) issues.push("PRESETS contains no executable presets.");

for (const category of categories) {
  for (const handler of expectedHandlers[category]) {
    if (!source.includes(`[\"${handler}\"`)) issues.push(`Missing ${category} handler: ${handler}.`);
  }
  if (!source.includes(`...buildTools(\"${category}\")`)) {
    issues.push(`Typed builder missing category: ${category}.`);
  }
}

const handlerCounts = categories.map((category) => expectedHandlers[category].length);
const expectedCount = handlerCounts.reduce((sum, count) => sum + count, 0) * presetCount;
const buildCallCount = categories.filter((category) => source.includes(`...buildTools(\"${category}\")`)).length;
if (buildCallCount !== categories.length) issues.push("MEGA_TOOLS must build every declared category exactly once.");

if (issues.length) {
  throw new Error(`Mega-tool catalog validation failed with ${issues.length} issue(s).\n- ${issues.join("\n- ")}`);
}

console.log(`Mega-tool catalog contract passed: ${expectedCount} variants derived from ${presetCount} presets × ${handlerCounts.reduce((sum, count) => sum + count, 0)} handlers.`);
