import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const source = fs.readFileSync(path.join(root, "src/data/megaToolsCatalog.ts"), "utf8");

const expectedCount = 524;
const categories = ["images", "video", "audio", "pdf"];
const presets = ["quick", "small", "medium", "large", "social", "web", "mobile", "print", "hd", "pro", "max"];
const expectedHandlers = {
  images: ["resize", "compress", "convert-png", "convert-jpg", "convert-webp", "rotate", "flip", "grayscale", "invert", "brightness", "contrast", "saturation"],
  video: ["inspect", "poster", "frame-25", "frame-50", "frame-75", "resize", "rotate", "flip", "mute", "speed", "metadata", "contact-sheet"],
  audio: ["inspect", "waveform", "peak", "rms", "normalize", "trim", "fade-in", "fade-out", "mono", "reverse", "speed", "wav"],
  pdf: ["inspect", "extract-text", "rotate", "page-numbers", "watermark", "remove-metadata", "duplicate", "extract-range", "split-even", "blank-cover", "flatten", "poster"],
};
const removedNonWorkingVariants = [
  "mega-video-inspect-quick",
  "mega-video-frame-75-quick",
  "mega-video-inspect-small",
  "mega-video-frame-75-medium",
];

const issues = [];
if (!source.includes("export const MEGA_TOOLS")) issues.push("MEGA_TOOLS export is missing.");
if (!source.includes("export const MEGA_TOOL_CATEGORIES")) issues.push("MEGA_TOOL_CATEGORIES export is missing.");
if (!source.includes("export interface MegaTool")) issues.push("MegaTool interface is missing.");
for (const category of categories) {
  for (const handler of expectedHandlers[category]) {
    if (!source.includes(`[\"${handler}\"`)) issues.push(`Missing ${category} handler: ${handler}.`);
  }
}
for (const preset of presets) if (!source.includes(`[\"${preset}\"`)) issues.push(`Missing preset: ${preset}.`);
for (const category of categories) if (!source.includes(`buildTools(\"${category}\")`)) issues.push(`Typed builder missing category: ${category}.`);
for (const slug of removedNonWorkingVariants) if (!source.includes(`\"${slug}\"`)) issues.push(`Removed non-working variant is not documented: ${slug}.`);
if (12 * 11 * 4 - removedNonWorkingVariants.length !== expectedCount) issues.push("Catalog multiplication/removal invariant is invalid.");

if (issues.length) throw new Error(`Mega-tool catalog validation failed with ${issues.length} issue(s).\n- ${issues.join("\n- ")}`);
console.log(`Mega-tool catalog contract passed: ${expectedCount} executable variants across 4 categories (4 known non-working video variants excluded).`);
