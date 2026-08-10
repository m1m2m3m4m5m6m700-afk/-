import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const toolsSource = fs.readFileSync(path.join(root, "src/data/tools.ts"), "utf8");
const runtimeDir = path.join(root, "src/lib/tool-runtime/tools");
const routeDir = path.join(root, "src/routes/tools");

function extractBetween(source, startMarker, endMarker) {
  const start = source.indexOf(startMarker);
  if (start === -1) throw new Error(`Missing marker: ${startMarker}`);
  const fromStart = source.slice(start + startMarker.length);
  const end = fromStart.indexOf(endMarker);
  if (end === -1) throw new Error(`Missing marker: ${endMarker}`);
  return fromStart.slice(0, end).trim();
}

function loadTools(source) {
  const body = extractBetween(
    source,
    "export const tools: Tool[] = [",
    "];\n\nexport const toolById",
  );
  const sanitizedBody = body
    .replace(/\.\.\.chromeTools,/g, "")
    .replace(/\.\.\.([A-Za-z0-9_]+),/g, "");
  const t = (id, name, categoryId, description, status = "placeholder", tags, slug) => ({
    id,
    name,
    categoryId,
    description,
    status,
    tags,
    slug,
  });
  return Function("t", `return [${sanitizedBody}];`)(t);
}

function recordDuplicates(values, label, issues) {
  const seen = new Set();
  const duplicates = new Set();
  values.forEach((value) => {
    if (seen.has(value)) duplicates.add(value);
    seen.add(value);
  });
  duplicates.forEach((value) => issues.push(`Duplicate ${label}: ${value}`));
}

const tools = loadTools(toolsSource);
const readyTools = tools.filter((tool) => tool.status === "ready");
const runtimeFiles = fs
  .readdirSync(runtimeDir)
  .filter((file) => file.endsWith(".ts") || file.endsWith(".tsx"))
  .sort();
const issues = [];
const runtimeEntries = [];

for (const file of runtimeFiles) {
  const source = fs.readFileSync(path.join(runtimeDir, file), "utf8");
  const slugMatch = source.match(/slug:\s*"([^"]+)"/);
  const toolIdMatch = source.match(/toolId:\s*"([^"]+)"/);

  if (!slugMatch) issues.push(`Runtime file ${file} is missing a slug.`);
  if (!toolIdMatch) issues.push(`Runtime file ${file} is missing a toolId.`);
  if (!slugMatch || !toolIdMatch) continue;

  const slug = slugMatch[1];
  const toolId = toolIdMatch[1];
  runtimeEntries.push({ file, slug, toolId });

  const routePath = path.join(routeDir, `${slug}.tsx`);
  if (!fs.existsSync(routePath)) {
    issues.push(`Ready tool runtime ${slug} is missing route file src/routes/tools/${slug}.tsx.`);
  }
}

recordDuplicates(
  runtimeEntries.map((entry) => entry.slug),
  "runtime slug",
  issues,
);
recordDuplicates(
  runtimeEntries.map((entry) => entry.toolId),
  "runtime tool id",
  issues,
);

for (const tool of readyTools) {
  const entry = runtimeEntries.find((runtime) => runtime.toolId === tool.id);
  if (!entry) {
    issues.push(`Ready tool ${tool.id} is missing a runtime definition.`);
    continue;
  }
  if (entry.slug !== tool.slug) {
    issues.push(`Runtime definition for ${tool.id} has slug ${entry.slug}, expected ${tool.slug}.`);
  }
}

// Runtimes may exist for non-ready (hidden) tools — their source is retained
// while the route layer blocks public access. Only flag runtimes that reference
// a tool id that does not exist at all.
for (const entry of runtimeEntries) {
  const tool = tools.find((item) => item.id === entry.toolId);
  if (!tool) {
    issues.push(`Runtime definition ${entry.file} references unknown tool ${entry.toolId}.`);
  }
}

if (issues.length > 0) {
  throw new Error(
    `Tool runtime validation failed with ${issues.length} issue(s).\n- ${issues.join("\n- ")}`,
  );
}

console.log(
  `Tool runtime validation passed: ${runtimeEntries.length} runtimes for ${readyTools.length} ready tools.`,
);
