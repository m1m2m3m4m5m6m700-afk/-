import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const catalogSource = fs.readFileSync(path.join(root, "src/data/megaToolsCatalog.ts"), "utf8");
const deprecatedSource = fs.readFileSync(path.join(root, "src/data/deprecated-tools.ts"), "utf8");

const categories = ["images", "video", "audio", "pdf"];
const presets = ["quick", "small", "medium", "large", "social", "web", "mobile", "print", "hd", "pro", "max"];
const expectedHandlers = {
  images: ["resize", "compress", "convert-png", "convert-jpg", "convert-webp", "rotate", "flip", "grayscale", "invert", "brightness", "contrast", "saturation"],
  video: ["inspect", "poster", "frame-25", "frame-50", "frame-75", "resize", "rotate", "flip", "mute", "speed", "metadata", "contact-sheet"],
  audio: ["inspect", "waveform", "peak", "rms", "normalize", "trim", "fade-in", "fade-out", "mono", "reverse", "speed", "wav"],
  pdf: ["inspect", "extract-text", "rotate", "page-numbers", "watermark", "remove-metadata", "duplicate", "extract-range", "split-even", "blank-cover", "flatten", "poster"],
};

const issues = [];
if (!catalogSource.includes("export const MEGA_TOOLS")) issues.push("MEGA_TOOLS export is missing.");
if (!catalogSource.includes("export const MEGA_TOOL_CATEGORIES")) issues.push("MEGA_TOOL_CATEGORIES export is missing.");
if (!catalogSource.includes("export interface MegaTool")) issues.push("MegaTool interface is missing.");
if (!catalogSource.includes("DEPRECATED_MEGA_TOOL_SLUGS")) issues.push("Catalog is not wired to the typed deprecated-tools registry.");
if (!deprecatedSource.includes("export const DEPRECATED_MEGA_TOOLS")) issues.push("Typed deprecated-tools registry export is missing.");

const removedSlugs = new Set(
  [...deprecatedSource.matchAll(/slug:\s*"([^"]+)"/g)].map((match) => match[1]),
);
if (removedSlugs.size === 0) issues.push("Deprecated registry must contain at least one explicitly documented entry.");

for (const category of categories) {
  for (const handler of expectedHandlers[category]) {
    if (!catalogSource.includes(`[\"${handler}\"`)) issues.push(`Missing ${category} handler: ${handler}.`);
  }
}
for (const preset of presets) if (!catalogSource.includes(`[\"${preset}\"`)) issues.push(`Missing preset: ${preset}.`);
for (const category of categories) if (!catalogSource.includes(`buildTools(\"${category}\")`)) issues.push(`Typed builder missing category: ${category}.`);

const generatedCount = categories.reduce((total, category) => total + expectedHandlers[category].length * presets.length, 0);
const expectedExecutableCount = generatedCount - removedSlugs.size;
if (removedSlugs.size >= generatedCount) issues.push("Deprecated registry removes every generated variant.");
if (!catalogSource.includes("export const MEGA_TOOL_COUNT = MEGA_TOOLS.length")) issues.push("MEGA_TOOL_COUNT must be derived from MEGA_TOOLS.");

if (issues.length) {
  throw new Error(`Mega-tool catalog validation failed with ${issues.length} issue(s).\n- ${issues.join("\n- ")}`);
}

console.log(
  `Mega-tool catalog contract passed: ${expectedExecutableCount} executable variants across ${categories.length} categories; ${removedSlugs.size} deprecated variants are officially excluded.`,
);
