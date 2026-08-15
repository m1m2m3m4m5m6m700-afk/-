import fs from "node:fs";
import path from "node:path";

const source = JSON.parse(fs.readFileSync(path.join(process.cwd(), "src/data/megaToolsCatalog.json"), "utf8"));
const presets = source.presets;
const categories = source.categories;
const expectedCount = 528;
const categoryNames = ["images", "video", "audio", "pdf"];
const requiredPresets = ["quick", "small", "medium", "large", "social", "web", "mobile", "print", "hd", "pro", "max"];

const tools = Object.entries(categories).flatMap(([category, definitions]) =>
  definitions.flatMap(([handler, name, description]) =>
    presets.map(([preset, presetName]) => ({
      slug: `mega-${category}-${handler}-${preset}`,
      name: `${name} · ${presetName}`,
      category,
      description: `${description} Preset: ${presetName}.`,
      handler,
      preset,
    })),
  ),
);

const issues = [];
const seen = new Set();
for (const tool of tools) {
  if (!tool.slug || seen.has(tool.slug)) issues.push(`Missing/duplicate slug: ${tool.slug}`);
  seen.add(tool.slug);
  if (!categoryNames.includes(tool.category)) issues.push(`Invalid category: ${tool.slug}`);
  if (!requiredPresets.includes(tool.preset)) issues.push(`Invalid preset: ${tool.slug}`);
  if (!tool.name.trim() || !tool.description.trim()) issues.push(`Incomplete metadata: ${tool.slug}`);
}

if (tools.length !== expectedCount) issues.push(`Expected ${expectedCount} mega tools, found ${tools.length}.`);
for (const category of categoryNames) {
  const items = tools.filter((tool) => tool.category === category);
  if (items.length !== 132) issues.push(`${category} must contain 132 tools, found ${items.length}.`);
  const familyCount = categories[category].length;
  if (familyCount !== 12) issues.push(`${category} must contain 12 handler families, found ${familyCount}.`);
  const presetSet = new Set(items.map((tool) => tool.preset));
  for (const preset of requiredPresets) if (!presetSet.has(preset)) issues.push(`${category} missing preset ${preset}.`);
}

if (issues.length) throw new Error(`Mega-tool catalog validation failed with ${issues.length} issue(s).\n- ${issues.join("\n- ")}`);
console.log(`Mega-tool catalog validation passed: ${tools.length} tools across 4 categories.`);
