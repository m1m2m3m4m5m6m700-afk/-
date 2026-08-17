import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const source = fs.readFileSync(path.join(root, "src/data/megaToolsCatalog.ts"), "utf8");
const deprecated = JSON.parse(
  fs.readFileSync(path.join(root, "src/data/deprecated-tools.json"), "utf8"),
);

const categories = ["images", "video", "audio", "pdf"];
const presets = ["quick", "small", "medium", "large", "social", "web", "mobile", "print", "hd", "pro", "max"];
const expectedHandlers = {
  images: ["resize", "compress", "convert-png", "convert-jpg", "convert-webp", "rotate", "flip", "grayscale", "invert", "brightness", "contrast", "saturation"],
  video: ["inspect", "poster", "frame-25", "frame-50", "frame-75", "resize", "rotate", "flip", "mute", "speed", "metadata", "contact-sheet"],
  audio: ["inspect", "waveform", "peak", "rms", "normalize", "trim", "fade-in", "fade-out", "mono", "reverse", "speed", "wav"],
  pdf: ["inspect", "extract-text", "rotate", "page-numbers", "watermark", "remove-metadata", "duplicate", "extract-range", "split-even", "blank-cover", "flatten", "poster"],
};

const issues = [];
if (!source.includes("export const MEGA_TOOLS")) issues.push("MEGA_TOOLS export is missing.");
if (!source.includes("export const MEGA_TOOL_CATEGORIES")) issues.push("MEGA_TOOL_CATEGORIES export is missing.");
if (!source.includes("export interface MegaTool")) issues.push("MegaTool interface is missing.");
if (!Array.isArray(deprecated)) issues.push("deprecated-tools.json must contain an array.");

const removedSlugs = new Set();
for (const entry of deprecated) {
  if (!entry || typeof entry.slug !== "string" || typeof entry.category !== "string" || typeof entry.reason !== "string") {
    issues.push("Every deprecated tool entry must include slug, category and reason.");
    continue;
  }
  if (removedSlugs.has(entry.slug)) issues.push(`Duplicate deprecated variant: ${entry.slug}.`);
  removedSlugs.add(entry.slug);
}

for (const category of categories) {
  for (const handler of expectedHandlers[category]) {
    if (!source.includes(`[\"${handler}\"`)) issues.push(`Missing ${category} handler: ${handler}.`);
  }
}
for (const preset of presets) if (!source.includes(`[\"${preset}\"`)) issues.push(`Missing preset: ${preset}.`);
for (const category of categories) if (!source.includes(`buildTools(\"${category}\")`)) issues.push(`Typed builder missing category: ${category}.`);
if (!source.includes("DEPRECATED_SLUGS")) issues.push("Catalog is not wired to the official deprecated-tools registry.");

const generatedCount = categories.reduce((total, category) => total + expectedHandlers[category].length * presets.length, 0);
const expectedExecutableCount = generatedCount - removedSlugs.size;
if (removedSlugs.size >= generatedCount) issues.push("Deprecated registry removes every generated variant.");
if (!source.includes("export const MEGA_TOOL_COUNT = MEGA_TOOLS.length")) issues.push("MEGA_TOOL_COUNT must be derived from MEGA_TOOLS.");

if (issues.length) {
  throw new Error(`Mega-tool catalog validation failed with ${issues.length} issue(s).\n- ${issues.join("\n- ")}`);
}

console.log(
  `Mega-tool catalog contract passed: ${expectedExecutableCount} executable variants across ${categories.length} categories; ${removedSlugs.size} deprecated variants are officially excluded.`,
);
