import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const toolsSource = fs.readFileSync(path.join(root, "src/lib/tool-platform/publicDesktopTools.ts"), "utf8");
const toolContentSource = fs.readFileSync(path.join(root, "src/data/toolContent.ts"), "utf8");
const toolSeoSource = fs.readFileSync(path.join(root, "src/data/toolSeo.ts"), "utf8");
const toolLayoutSource = fs.readFileSync(
  path.join(root, "src/components/tools/ToolLayout.tsx"),
  "utf8",
);
const toolSeoSectionSource = fs.readFileSync(
  path.join(root, "src/components/tools/ToolSeoSection.tsx"),
  "utf8",
);
const readyToolFiles = [
  ...fs
    .readdirSync(path.join(root, "src/components/tools"))
    .map((f) => path.join("src/components/tools", f)),
  ...fs
    .readdirSync(path.join(root, "src/lib/tool-runtime/tools"))
    .map((f) => path.join("src/lib/tool-runtime/tools", f)),
]
  .filter(
    (file) =>
      (file.endsWith(".tsx") || file.endsWith(".ts")) &&
      !file.endsWith("ToolLayout.tsx") &&
      !file.endsWith("ToolSeoSection.tsx"),
  )
  .map((file) => ({ file, source: fs.readFileSync(path.join(root, file), "utf8") }));

function extractBetween(source, startMarker, endMarker) {
  const start = source.indexOf(startMarker);
  if (start === -1) throw new Error(`Missing marker: ${startMarker}`);
  const fromStart = source.slice(start + startMarker.length);
  const end = fromStart.indexOf(endMarker);
  if (end === -1) throw new Error(`Missing marker: ${endMarker}`);
  return fromStart.slice(0, end).trim();
}

function loadTools(source) {
  const tools = [];
  const pattern = /\bid:\s*"([^"]+)"[\s\S]*?\bslug:\s*"([^"]+)"[\s\S]*?\bname:\s*"([^"]+)"[\s\S]*?\bcategory:\s*"([^"]+)"[\s\S]*?\blifecycle:\s*"public"/g;
  let match;
  while ((match = pattern.exec(source)) !== null) {
    tools.push({ id: match[1], slug: match[2], name: match[3], categoryId: match[4], status: "ready" });
  }
  if (!tools.length) throw new Error("Canonical public tool registry contains no public tools.");
  return tools;
}

function loadToolSeoRegistry(source) {
  const body = extractBetween(
    source,
    "const toolSeoRegistry: Record<string, ToolSeoData> = {",
    "};\n\nexport function getToolSeo",
  );
  return Function(`return ({${body}});`)();
}

function loadToolContentRegistry(source, toolSeoRegistry) {
  const body = extractBetween(
    source,
    'const toolContentRegistry: Record<string, Omit<ToolContentData, "slug">> = {',
    "};\n\nexport function getAllToolContentEntries",
  );
  return Function(
    "getToolSeo",
    "defaultAuthor",
    "defaultPlatforms",
    `return ({${body}});`,
  )((slug) => toolSeoRegistry[slug] ?? { features: [], faqs: [] }, "Flixo Team", [
    "Web",
    "Desktop",
    "Mobile",
  ]);
}

const tools = loadTools(toolsSource);
const toolSeoRegistry = loadToolSeoRegistry(toolSeoSource);
const toolContentRegistry = loadToolContentRegistry(toolContentSource, toolSeoRegistry);
const readyTools = tools.filter((tool) => tool.status === "ready" && tool.slug);
const issues = [];

for (const tool of readyTools) {
  const entry = toolContentRegistry[tool.slug];
  if (!entry) {
    issues.push(`Missing canonical tool content for ready tool ${tool.slug}.`);
    continue;
  }

  if (!entry.overview?.trim()) issues.push(`Missing Overview for ${tool.slug}.`);
  if (!Array.isArray(entry.howItWorks) || entry.howItWorks.length === 0)
    issues.push(`Missing How it works for ${tool.slug}.`);
  if (!Array.isArray(entry.features) || entry.features.length === 0)
    issues.push(`Missing Features for ${tool.slug}.`);
  if (!Array.isArray(entry.useCases) || entry.useCases.length === 0)
    issues.push(`Missing Use cases for ${tool.slug}.`);
  if (!Array.isArray(entry.faqs) || entry.faqs.length === 0)
    issues.push(`Missing FAQ for ${tool.slug}.`);
  if (!entry.eeat?.author?.trim()) issues.push(`Missing author for ${tool.slug}.`);
  if (!entry.eeat?.lastUpdated?.trim()) issues.push(`Missing lastUpdated for ${tool.slug}.`);
  if (!entry.eeat?.version?.trim()) issues.push(`Missing version for ${tool.slug}.`);
  if (!Array.isArray(entry.eeat?.supportedPlatforms) || entry.eeat.supportedPlatforms.length === 0)
    issues.push(`Missing supported platforms for ${tool.slug}.`);
  if (!entry.eeat?.privacyStatement?.trim())
    issues.push(`Missing privacy statement for ${tool.slug}.`);
  if (!entry.eeat?.processingType?.trim()) issues.push(`Missing processing type for ${tool.slug}.`);
  if (!toolSeoRegistry[tool.slug]) issues.push(`Missing canonical metadata for ${tool.slug}.`);

  const faqKeys = new Set();
  for (const faq of entry.faqs ?? []) {
    const key = `${faq.question}`.trim().toLowerCase();
    if (faqKeys.has(key)) issues.push(`Duplicate FAQ in ${tool.slug}: ${faq.question}`);
    faqKeys.add(key);
  }
}

const h1Matches = toolLayoutSource.match(/<h1\b/g) ?? [];
if (h1Matches.length !== 1)
  issues.push(`ToolLayout must render exactly one H1. Found ${h1Matches.length}.`);
if ((toolSeoSectionSource.match(/<h1\b/g) ?? []).length !== 0)
  issues.push("ToolSeoSection must not render H1 headings.");
if ((toolSeoSectionSource.match(/<h4\b/g) ?? []).length !== 0)
  issues.push("ToolSeoSection contains invalid heading hierarchy (h4 found).");

for (const { file, source } of readyToolFiles) {
  if ((source.match(/<h1\b/g) ?? []).length !== 0)
    issues.push(`${file} must not render H1 headings.`);
  for (const imgTag of source.match(/<img\b[^>]*>/g) ?? []) {
    if (!/\salt=/.test(imgTag)) issues.push(`${file} contains an image without alt text.`);
  }
}

if (issues.length > 0) {
  throw new Error(
    `Tool content validation failed with ${issues.length} issue(s).\n- ${issues.join("\n- ")}`,
  );
}

console.log(
  `Tool content validation passed: ${readyTools.length} ready tools with canonical content and E-E-A-T metadata.`,
);
