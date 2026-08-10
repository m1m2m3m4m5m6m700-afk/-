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

function loadCategoryCatalog(source) {
  const hasCategoryCatalog = source.includes(
    "export const categoryCatalog: CategoryDefinition[] = [",
  );
  if (hasCategoryCatalog) {
    const iconBlock = [...source.matchAll(/import \{([\s\S]*?)\} from "([^"]+)";/g)].find(
      (match) => match[2] === "lucide-react",
    );
    const iconNames = (iconBlock?.[1] ?? "")
      .split(",")
      .map((name) => name.trim())
      .filter(Boolean);

    const stubPrelude = iconNames
      .map((name) => `const ${name} = Symbol(${JSON.stringify(name)});`)
      .join("\n");
    const body = extractBetween(
      source,
      "export const categoryCatalog: CategoryDefinition[] = [",
      "];\n\nconst toolIdsByCategory",
    );
    return Function(`${stubPrelude}\nreturn [${body}];`)();
  }

  const body = extractBetween(
    source,
    "export const categories: Category[] = [",
    "];\n\nexport const categoryById",
  );
  const categoryEntries = [];
  const objectPattern =
    /\{\s*id:\s*"([^"]+)"[\s\S]*?name:\s*"([^"]+)"[\s\S]*?description:\s*"([^"]+)"[\s\S]*?anchor:\s*"([^"]+)"[\s\S]*?order:\s*(\d+)/g;
  let match;
  while ((match = objectPattern.exec(body))) {
    categoryEntries.push({
      id: match[1],
      name: match[2],
      description: match[3],
      anchor: match[4],
      order: Number(match[5]),
    });
  }

  return categoryEntries;
}

function buildCategories(categoryCatalog, tools) {
  const toolIdsByCategory = tools.reduce((map, tool) => {
    const bucket = map.get(tool.categoryId);
    if (bucket) bucket.push(tool.id);
    else map.set(tool.categoryId, [tool.id]);
    return map;
  }, new Map());

  return categoryCatalog.map((category) => ({
    ...category,
    toolIds: toolIdsByCategory.get(category.id) ?? [],
  }));
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
  const singleValueFields = ["toolId", "recommendedToolId"];
  const arrayFields = ["toolIds", "recommendedToolIds"];

  for (const field of singleValueFields) {
    const pattern = new RegExp(String.raw`${field}:\s*"([^\"]+)"`, "g");
    let match;
    while ((match = pattern.exec(source))) references.push({ field, value: match[1] });
  }

  for (const field of arrayFields) {
    const pattern = new RegExp(String.raw`${field}:\s*\[([\s\S]*?)\]`, "g");
    let match;
    while ((match = pattern.exec(source))) {
      const values = [...match[1].matchAll(/"([^\"]+)"/g)].map((entry) => entry[1]);
      values.forEach((value) => references.push({ field, value }));
    }
  }

  return references;
}

function validateRegistry({
  tools,
  categoryCatalog,
  categories,
  toolSeoRegistry,
  seoEnterpriseReferences,
}) {
  const issues = [];
  const statuses = new Set(["placeholder", "planned", "ready"]);
  const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
  const isNonEmptyString = (value) => typeof value === "string" && value.trim().length > 0;
  const recordDuplicates = (values, label) => {
    const seen = new Set();
    const duplicates = new Set();
    values.forEach((value) => {
      if (seen.has(value)) duplicates.add(value);
      seen.add(value);
    });
    duplicates.forEach((value) => issues.push(`Duplicate ${label}: ${value}`));
  };

  recordDuplicates(
    categoryCatalog.map((category) => category.id),
    "category id",
  );
  recordDuplicates(
    categoryCatalog.map((category) => category.anchor),
    "category anchor",
  );
  recordDuplicates(
    categoryCatalog.map((category) => String(category.order)),
    "category order",
  );
  recordDuplicates(
    tools.map((tool) => tool.id),
    "tool id",
  );
  recordDuplicates(
    tools.filter((tool) => isNonEmptyString(tool.slug)).map((tool) => tool.slug.trim()),
    "tool slug",
  );

  const categoryIds = new Set();
  categoryCatalog.forEach((category) => {
    categoryIds.add(category.id);
    if (!isNonEmptyString(category.id)) issues.push("A category is missing its required id.");
    if (!isNonEmptyString(category.name))
      issues.push(`Category ${category.id || "<unknown>"} is missing its required name.`);
    if (!isNonEmptyString(category.description))
      issues.push(`Category ${category.id || "<unknown>"} is missing its required description.`);
    if (!isNonEmptyString(category.anchor))
      issues.push(`Category ${category.id || "<unknown>"} is missing its required anchor.`);
    if (!Number.isInteger(category.order))
      issues.push(`Category ${category.id || "<unknown>"} must have an integer order.`);
  });

  const toolIds = new Set();
  const toolSlugs = new Set();
  const groupedToolsByCategory = new Map();
  tools.forEach((tool) => {
    toolIds.add(tool.id);
    if (!isNonEmptyString(tool.id)) issues.push("A tool is missing its required id.");
    if (!isNonEmptyString(tool.name))
      issues.push(`Tool ${tool.id || "<unknown>"} is missing its required name.`);
    if (!isNonEmptyString(tool.description))
      issues.push(`Tool ${tool.id || "<unknown>"} is missing its required description.`);
    if (!categoryIds.has(tool.categoryId))
      issues.push(
        `Tool ${tool.id || "<unknown>"} references invalid category ${String(tool.categoryId)}.`,
      );
    if (!statuses.has(tool.status))
      issues.push(`Tool ${tool.id || "<unknown>"} has invalid status ${String(tool.status)}.`);

    const slug = tool.slug?.trim();
    if ((tool.status === "ready" || tool.status === "planned") && !slug)
      issues.push(`Tool ${tool.id} with status ${tool.status} must define a slug.`);
    if (slug && !slugPattern.test(slug))
      issues.push(`Tool ${tool.id} has an invalid slug format: ${slug}.`);
    if (slug) toolSlugs.add(slug);
    if (tool.tags && tool.tags.some((tag) => !isNonEmptyString(tag)))
      issues.push(`Tool ${tool.id} contains an empty tag.`);

    const bucket = groupedToolsByCategory.get(tool.categoryId);
    if (bucket) bucket.push(tool.id);
    else groupedToolsByCategory.set(tool.categoryId, [tool.id]);
  });

  categories.forEach((category) => {
    if (!Array.isArray(category.toolIds)) {
      issues.push(`Derived category ${category.id} must define a toolIds array.`);
      return;
    }

    recordDuplicates(category.toolIds, `tool id inside category ${category.id}`);
    category.toolIds.forEach((toolId) => {
      if (!toolIds.has(toolId))
        issues.push(`Derived category ${category.id} references missing tool ${toolId}.`);
    });

    const expected = groupedToolsByCategory.get(category.id) ?? [];
    if (
      expected.length !== category.toolIds.length ||
      expected.some((toolId, index) => toolId !== category.toolIds[index])
    ) {
      issues.push(
        `Derived toolIds for category ${category.id} are inconsistent with the canonical tool catalog.`,
      );
    }
  });

  recordDuplicates(Object.keys(toolSeoRegistry), "tool SEO registry key");
  recordDuplicates(
    Object.values(toolSeoRegistry).map((entry) => entry.slug),
    "tool SEO slug",
  );

  Object.entries(toolSeoRegistry).forEach(([key, entry]) => {
    if (!isNonEmptyString(entry.slug)) issues.push(`Tool SEO entry ${key} is missing its slug.`);
    if (entry.slug !== key)
      issues.push(`Tool SEO entry ${key} must use the same slug in its payload.`);
    if (!toolSlugs.has(entry.slug))
      issues.push(`Tool SEO entry ${key} references unknown tool slug ${entry.slug}.`);
  });

  seoEnterpriseReferences.forEach(({ field, value }) => {
    if (!toolIds.has(value))
      issues.push(`SEO enterprise field ${field} references unknown tool id ${value}.`);
  });

  if (issues.length > 0) {
    throw new Error(
      `Registry validation failed with ${issues.length} issue(s).\n- ${issues.join("\n- ")}`,
    );
  }
}

const tools = loadTools(toolsSource);
const categoryCatalog = loadCategoryCatalog(categoriesSource);
const categories = buildCategories(categoryCatalog, tools);
const toolSeoRegistry = loadToolSeoRegistry(toolSeoSource);
const seoEnterpriseReferences = collectToolReferences(seoEnterpriseSource);

validateRegistry({ tools, categoryCatalog, categories, toolSeoRegistry, seoEnterpriseReferences });
console.log(
  `Registry validation passed: ${categoryCatalog.length} categories, ${tools.length} tools, ${Object.keys(toolSeoRegistry).length} SEO entries.`,
);
