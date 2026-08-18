import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const toolsSource = fs.readFileSync(path.join(root, "src/data/tools.ts"), "utf8");
const categoriesSource = fs.readFileSync(path.join(root, "src/data/categories.ts"), "utf8");
const toolSeoSource = fs.readFileSync(path.join(root, "src/data/toolSeo.ts"), "utf8");
const seoEnterpriseSource = fs.readFileSync(
  path.join(root, "src/data/seoEnterpriseData.ts"),
  "utf8",
);
const readyToolsSource = fs.readFileSync(
  path.join(root, "src/lib/tool-runtime/readyTools.ts"),
  "utf8",
);

function extractBetween(source, startMarker, endMarker) {
  const start = source.indexOf(startMarker);
  if (start === -1) throw new Error(`Missing marker: ${startMarker}`);
  const fromStart = source.slice(start + startMarker.length);
  const end = fromStart.indexOf(endMarker);
  if (end === -1) throw new Error(`Missing marker: ${endMarker}`);
  return fromStart.slice(0, end).trim();
}

function loadLegacyTools(source) {
  const marker = "export const tools: Tool[] = [";
  if (!source.includes(marker)) return { isolated: true, tools: [] };

  const endMarker = "];\n\nexport const toolById";
  if (!source.includes(endMarker)) return { isolated: true, tools: [] };

  const body = extractBetween(source, marker, endMarker);
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
  try {
    return { isolated: false, tools: Function("t", `return [${sanitizedBody}];`)(t) };
  } catch {
    return { isolated: true, tools: [] };
  }
}

function loadCategories(source) {
  const body = extractBetween(
    source,
    "export const categories: Category[] = [",
    "];\n\nexport const categoryById",
  );
  const categories = [];
  const objectPattern = /\{([\s\S]*?)\n  \},?/g;
  let match;
  while ((match = objectPattern.exec(body))) {
    const object = match[1];
    const id = object.match(/\bid:\s*"([^"]+)"/)?.[1];
    const name = object.match(/\bname:\s*"([^"]+)"/)?.[1];
    const description = object.match(/\bdescription:\s*"([^"]+)"/)?.[1];
    const anchor = object.match(/\banchor:\s*"([^"]+)"/)?.[1];
    const order = Number(object.match(/\border:\s*(\d+)/)?.[1]);
    const toolIdsBody = object.match(/\btoolIds:\s*\[([\s\S]*?)\]/)?.[1] ?? "";
    const toolIds = [...toolIdsBody.matchAll(/"([^"]+)"/g)].map((entry) => entry[1]);
    if (id) categories.push({ id, name, description, anchor, order, toolIds });
  }
  return categories;
}

function loadToolSeoRegistry(source) {
  const body = extractBetween(
    source,
    "const toolSeoRegistry: Record<string, ToolSeoData> = {",
    "};\n\nexport function getToolSeo",
  );
  return Function(`return ({${body}});`)();
}

function collectToolReferences(source) {
  const references = [];
  for (const field of ["toolId", "recommendedToolId"]) {
    const pattern = new RegExp(String.raw`${field}:\s*"([^\"]+)"`, "g");
    let match;
    while ((match = pattern.exec(source))) references.push({ field, value: match[1] });
  }
  for (const field of ["toolIds", "recommendedToolIds"]) {
    const pattern = new RegExp(String.raw`${field}:\s*\[([\s\S]*?)\]`, "g");
    let match;
    while ((match = pattern.exec(source))) {
      for (const value of [...match[1].matchAll(/"([^\"]+)"/g)].map((entry) => entry[1])) {
        references.push({ field, value });
      }
    }
  }
  return references;
}

function loadPublicRuntimes(source) {
  const runtimes = [];
  const imports = [...source.matchAll(/import\s+\{\s*(\w+)\s*\}\s+from\s+"\.\/tools\/([^"\"]+)";/g)];
  for (const [, symbol, fileBase] of imports) {
    const candidatePaths = [
      path.join(root, "src/lib/tool-runtime/tools", `${fileBase}.tsx`),
      path.join(root, "src/lib/tool-runtime/tools", `${fileBase}.ts`),
    ];
    const filePath = candidatePaths.find((candidate) => fs.existsSync(candidate));
    if (!filePath) throw new Error(`Public runtime import ${fileBase} has no matching source file.`);
    const runtimeSource = fs.readFileSync(filePath, "utf8");
    const symbolPattern = new RegExp(
      String.raw`export const ${symbol}: ReadyToolRuntimeDefinition = \{([\s\S]*?)\n\};`,
    );
    const body = runtimeSource.match(symbolPattern)?.[1];
    if (!body) throw new Error(`Could not parse public runtime definition ${symbol}.`);
    const toolId = body.match(/\btoolId:\s*"([^"]+)"/)?.[1];
    const slug = body.match(/\bslug:\s*"([^"]+)"/)?.[1];
    const categoryId = body.match(/\bcategoryId:\s*"([^"]+)"/)?.[1];
    if (!toolId || !slug || !categoryId) {
      throw new Error(`Public runtime ${symbol} must define toolId, slug, and categoryId.`);
    }
    runtimes.push({ symbol, toolId, slug, categoryId });
  }
  return runtimes;
}

function validateRegistry({ categories, legacyTools, publicRuntimes, toolSeoRegistry, seoEnterpriseReferences }) {
  const issues = [];
  const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
  const nonEmpty = (value) => typeof value === "string" && value.trim().length > 0;
  const duplicates = (values, label) => {
    const seen = new Set();
    for (const value of values) {
      if (seen.has(value)) issues.push(`Duplicate ${label}: ${value}`);
      seen.add(value);
    }
  };

  if (categories.length === 0) issues.push("Category catalog is empty.");
  duplicates(categories.map((category) => category.id), "category id");
  duplicates(categories.map((category) => category.anchor), "category anchor");
  duplicates(categories.map((category) => String(category.order)), "category order");

  const categoryIds = new Set();
  const categoryToolIds = new Set();
  for (const category of categories) {
    categoryIds.add(category.id);
    if (!nonEmpty(category.id)) issues.push("A category is missing its id.");
    if (!nonEmpty(category.name)) issues.push(`Category ${category.id || "<unknown>"} is missing its name.`);
    if (!nonEmpty(category.description)) issues.push(`Category ${category.id || "<unknown>"} is missing its description.`);
    if (!nonEmpty(category.anchor)) issues.push(`Category ${category.id || "<unknown>"} is missing its anchor.`);
    if (!Number.isInteger(category.order)) issues.push(`Category ${category.id || "<unknown>"} must have an integer order.`);
    if (!Array.isArray(category.toolIds)) issues.push(`Category ${category.id || "<unknown>"} must define toolIds.`);
    else {
      duplicates(category.toolIds, `tool id inside category ${category.id}`);
      category.toolIds.forEach((toolId) => categoryToolIds.add(toolId));
    }
  }

  if (!legacyTools.isolated) {
    const statuses = new Set(["placeholder", "planned", "ready"]);
    duplicates(legacyTools.tools.map((tool) => tool.id), "legacy tool id");
    duplicates(legacyTools.tools.map((tool) => tool.slug).filter(Boolean), "legacy tool slug");
    for (const tool of legacyTools.tools) {
      if (!nonEmpty(tool.id)) issues.push("A legacy tool is missing its id.");
      if (!nonEmpty(tool.name)) issues.push(`Legacy tool ${tool.id || "<unknown>"} is missing its name.`);
      if (!nonEmpty(tool.description)) issues.push(`Legacy tool ${tool.id || "<unknown>"} is missing its description.`);
      if (!categoryIds.has(tool.categoryId)) issues.push(`Legacy tool ${tool.id} references invalid category ${tool.categoryId}.`);
      if (!statuses.has(tool.status)) issues.push(`Legacy tool ${tool.id} has invalid status ${tool.status}.`);
      if (tool.slug && !slugPattern.test(tool.slug)) issues.push(`Legacy tool ${tool.id} has invalid slug ${tool.slug}.`);
    }
  }

  duplicates(publicRuntimes.map((runtime) => runtime.toolId), "public runtime tool id");
  duplicates(publicRuntimes.map((runtime) => runtime.slug), "public runtime slug");
  for (const runtime of publicRuntimes) {
    if (!slugPattern.test(runtime.slug)) issues.push(`Public runtime ${runtime.symbol} has invalid slug ${runtime.slug}.`);
    if (!categoryIds.has(runtime.categoryId)) issues.push(`Public runtime ${runtime.symbol} references invalid category ${runtime.categoryId}.`);
    const category = categories.find((entry) => entry.id === runtime.categoryId);
    if (category && !category.toolIds.includes(runtime.toolId)) {
      issues.push(`Public runtime ${runtime.toolId} is missing from category ${runtime.categoryId}.`);
    }
  }

  const seoKeys = Object.keys(toolSeoRegistry);
  duplicates(seoKeys, "tool SEO registry key");
  duplicates(Object.values(toolSeoRegistry).map((entry) => entry.slug), "tool SEO slug");
  for (const [key, entry] of Object.entries(toolSeoRegistry)) {
    if (!nonEmpty(entry.slug)) issues.push(`Tool SEO entry ${key} is missing its slug.`);
    if (entry.slug !== key) issues.push(`Tool SEO entry ${key} must use the same slug in its payload.`);
    if (!slugPattern.test(entry.slug)) issues.push(`Tool SEO entry ${key} has invalid slug ${entry.slug}.`);
  }

  const publicIds = new Set(publicRuntimes.map((runtime) => runtime.toolId));
  for (const { field, value } of seoEnterpriseReferences) {
    if (!publicIds.has(value) && !categoryToolIds.has(value)) {
      issues.push(`SEO enterprise field ${field} references unknown tool id ${value}.`);
    }
  }

  if (issues.length) {
    throw new Error(`Registry validation failed with ${issues.length} issue(s).\n- ${issues.join("\n- ")}`);
  }
}

const legacyTools = loadLegacyTools(toolsSource);
const categories = loadCategories(categoriesSource);
const publicRuntimes = loadPublicRuntimes(readyToolsSource);
const toolSeoRegistry = loadToolSeoRegistry(toolSeoSource);
const seoEnterpriseReferences = collectToolReferences(seoEnterpriseSource);

validateRegistry({
  categories,
  legacyTools,
  publicRuntimes,
  toolSeoRegistry,
  seoEnterpriseReferences,
});

console.log(
  `Registry validation passed: ${categories.length} categories, ${publicRuntimes.length} public runtimes, ${Object.keys(toolSeoRegistry).length} SEO entries.`,
);
