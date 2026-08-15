import { MEGA_TOOLS } from "../data/megaTools.mjs";

const expectedCount = 528;
const categories = ["images", "video", "audio", "pdf"];
const requiredPresets = ["quick", "small", "medium", "large", "social", "web", "mobile", "print", "hd", "pro", "max"];
const handlersByCategory = {
  images: ["resize", "compress", "convert-png", "convert-jpg", "convert-webp", "rotate", "flip", "grayscale", "invert", "brightness", "contrast", "saturation"],
  video: ["inspect", "poster", "frame-25", "frame-50", "frame-75", "resize", "rotate", "flip", "mute", "speed", "contact-sheet", "aspect"],
  audio: ["inspect", "waveform", "peak", "rms", "normalize", "trim", "fade-in", "fade-out", "mono", "reverse", "speed", "wav"],
  pdf: ["inspect", "extract-text", "rotate", "page-numbers", "watermark", "remove-metadata", "duplicate", "extract-range", "split-even", "blank-cover", "flatten", "poster"],
};

const issues = [];
const seen = new Set();
for (const tool of MEGA_TOOLS) {
  if (!tool.slug || seen.has(tool.slug)) issues.push(`Missing/duplicate slug: ${tool.slug}`);
  seen.add(tool.slug);
  if (!categories.includes(tool.category)) issues.push(`Invalid category: ${tool.slug}`);
  if (!handlersByCategory[tool.category]?.includes(tool.handler)) issues.push(`Invalid handler: ${tool.slug}`);
  if (!requiredPresets.includes(tool.preset)) issues.push(`Invalid preset: ${tool.slug}`);
  if (!tool.name?.trim() || !tool.description?.trim()) issues.push(`Incomplete metadata: ${tool.slug}`);
}
if (MEGA_TOOLS.length !== expectedCount) issues.push(`Expected ${expectedCount} mega tools, found ${MEGA_TOOLS.length}.`);
for (const category of categories) {
  const items = MEGA_TOOLS.filter((tool) => tool.category === category);
  if (items.length !== 132) issues.push(`${category} must contain 132 tools, found ${items.length}.`);
  const handlers = new Set(items.map((tool) => tool.handler));
  for (const handler of handlersByCategory[category]) if (!handlers.has(handler)) issues.push(`${category} missing handler family ${handler}.`);
  const presets = new Set(items.map((tool) => tool.preset));
  for (const preset of requiredPresets) if (!presets.has(preset)) issues.push(`${category} missing preset ${preset}.`);
}

if (issues.length) throw new Error(`Mega-tool validation failed with ${issues.length} issue(s).\n- ${issues.join("\n- ")}`);
console.log(`Mega-tool catalog validation passed: ${MEGA_TOOLS.length} tools across 4 categories.`);
