import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const SITE_URL = "https://flixoai.vercel.app";

function read(relativePath) {
  return fs.readFileSync(path.join(root, relativePath), "utf8");
}

function loadArrayFromExport(source, exportName, options = {}) {
  const regex = new RegExp(`export const ${exportName}[^=]*= \\[([\\s\\S]*?)\\n\\];`);
  const match = source.match(regex);
  if (!match) throw new Error(`Missing export array: ${exportName}`);
  const body = match[1].trim();
  return Function(options.args ?? "", `${options.prelude ?? ""}\nreturn [${body}];`)(...(options.values ?? []));
}

function loadObjectFromConst(source, constName) {
  const regex = new RegExp(`const ${constName}[^=]*= \\{([\\s\\S]*?)\\n\\};`);
  const match = source.match(regex);
  if (!match) throw new Error(`Missing const object: ${constName}`);
  return Function(`return ({${match[1].trim()}});`)();
}

function loadTools(source) {
  const toolsMatch = source.match(/export const tools: Tool\[\] = \[([\s\S]*?)\n\];/);
  if (!toolsMatch) throw new Error("Missing tools export array.");
  const sanitizedBody = toolsMatch[1].trim().replace(/\.\.\.chromeTools,/g, "").replace(/\.\.\.([A-Za-z0-9_]+),/g, "");
  const t = (id, name, categoryId, description, status = "placeholder", tags, slug) => ({ id, name, categoryId, description, status, tags, slug });
  return Function("t", `return [${sanitizedBody}];`)(t);
}

function loadCategoryCatalog(source) {
  const hasCategoryCatalog = source.includes("export const categoryCatalog: CategoryDefinition[] = [");
  if (hasCategoryCatalog) {
    const iconBlock = [...source.matchAll(/import \{([\s\S]*?)\} from "([^"]+)";/g)].find((match) => match[2] === "lucide-react");
    const iconNames = (iconBlock?.[1] ?? "").split(",").map((name) => name.trim()).filter(Boolean);
    const prelude = iconNames.map((name) => `const ${name} = Symbol(${JSON.stringify(name)});`).join("\n");
    return loadArrayFromExport(source, "categoryCatalog", { prelude });
  }

  const body = source.match(/export const categories: (?:Category|ToolCategoryPresentation)\[\] = \[([\s\S]*?)\n\];/);
  if (!body) throw new Error("Missing canonical categories export array.");

  const categoryEntries = [];
  const objectPattern = /\{\s*id:\s*"([^"]+)"[\s\S]*?name:\s*"([^"]+)"[\s\S]*?description:\s*"([^"]+)"[\s\S]*?anchor:\s*"([^"]+)"[\s\S]*?order:\s*(\d+)/g;
  let match;
  while ((match = objectPattern.exec(body[1]))) {
    categoryEntries.push({ id: match[1], name: match[2], description: match[3], anchor: match[4], order: Number(match[5]) });
  }

  return categoryEntries;
}

function titleCaseFromSlug(slug) { return slug.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()); }

function getToolSeo(tool, toolSeoRegistry, categories) {
  if (tool.slug && toolSeoRegistry[tool.slug]) return toolSeoRegistry[tool.slug];
  const name = tool.name || titleCaseFromSlug(tool.slug || tool.id);
  const category = categories.find((entry) => entry.id === tool.categoryId);
  const categoryName = category?.name || "Utility Tools";
  return { slug: tool.slug || tool.id, title: `${name} — Online ${categoryName} | Flixo`, description: `${tool.description} Use Flixo for fast, private, and secure browser-based tools with no sign-up.` };
}

function pushDuplicateIssues(records, label, issues) {
  const grouped = new Map();
  records.forEach(({ key, value }) => { if (!value) return; const refs = grouped.get(value) ?? []; refs.push(key); grouped.set(value, refs); });
  for (const [value, refs] of grouped.entries()) if (refs.length > 1) issues.push(`Duplicate ${label}: ${value} (${refs.join(", ")})`);
}

const tools = loadTools(read("src/data/tools.ts"));
const categories = loadCategoryCatalog(read("src/lib/tool-platform/categories.ts"));
const toolSeoRegistry = loadObjectFromConst(read("src/data/toolSeo.ts"), "toolSeoRegistry");
const seoEnterpriseSource = read("src/data/seoEnterpriseData.ts");
const blogSource = read("src/data/blogData.ts");
const rootRouteSource = read("src/routes/__root.tsx");
const structuredDataSource = read("src/lib/seo/structuredData.ts");
const publicRobots = read("public/robots.txt");
const publicSitemap = read("public/sitemap.xml");

const comparisonRegistry = loadArrayFromExport(seoEnterpriseSource, "comparisonRegistry");
const useCaseRegistry = loadArrayFromExport(seoEnterpriseSource, "useCaseRegistry");
const fileTypeRegistry = loadArrayFromExport(seoEnterpriseSource, "fileTypeRegistry");
const questionRegistry = loadArrayFromExport(seoEnterpriseSource, "questionRegistry");
const collectionRegistry = loadArrayFromExport(seoEnterpriseSource, "collectionRegistry");
const blogPosts = loadArrayFromExport(blogSource, "blogPosts");

const issues = [];
const toolSeoEntries = tools.filter((tool) => tool.slug).map((tool) => {
  const seo = getToolSeo(tool, toolSeoRegistry, categories);
  return { toolId: tool.id, slug: tool.slug, title: seo.title, description: seo.description, canonicalUrl: `${SITE_URL}/tools/${tool.slug}` };
});

for (const entry of toolSeoEntries) {
  if (!entry.title?.trim()) issues.push(`Missing SEO title for tool ${entry.toolId}.`);
  if (!entry.description?.trim()) issues.push(`Missing SEO description for tool ${entry.toolId}.`);
  if (!entry.canonicalUrl.endsWith(`/${entry.slug}`)) issues.push(`Invalid canonical URL for tool ${entry.toolId}.`);
}

pushDuplicateIssues(toolSeoEntries.map((entry) => ({ key: entry.toolId, value: entry.title })), "tool SEO title", issues);
pushDuplicateIssues(toolSeoEntries.map((entry) => ({ key: entry.toolId, value: entry.description })), "tool SEO description", issues);
pushDuplicateIssues(toolSeoEntries.map((entry) => ({ key: entry.toolId, value: entry.slug })), "tool slug", issues);
pushDuplicateIssues(toolSeoEntries.map((entry) => ({ key: entry.toolId, value: entry.canonicalUrl })), "tool canonical URL", issues);

for (const [entries, prefix] of [[comparisonRegistry, "/compare/"], [useCaseRegistry, "/use-cases/"], [fileTypeRegistry, "/file-types/"], [questionRegistry, "/questions/"], [collectionRegistry, "/collections/"], [blogPosts, "/blog/"]]) {
  pushDuplicateIssues(entries.map((entry) => ({ key: `${prefix}${entry.id ?? entry.slug}`, value: `${SITE_URL}${prefix}${entry.slug}` })), `${prefix} canonical URL`, issues);
}

if (!rootRouteSource.includes("buildOrganizationSchema()")) issues.push("Root route is missing Organization structured data.");
if (!rootRouteSource.includes("buildWebSiteSchema()")) issues.push("Root route is missing WebSite structured data.");
if (!rootRouteSource.includes("buildRootWebApplicationSchema()")) issues.push("Root route is missing WebApplication structured data.");
if (!structuredDataSource.includes("SearchAction")) issues.push("Root structured data is missing SearchAction.");
if (!publicRobots.includes("Sitemap: https://flixoai.vercel.app/sitemap.xml")) issues.push("public/robots.txt must reference the canonical sitemap.xml URL.");

const expectedUrls = [
  `${SITE_URL}/`, `${SITE_URL}/ar`, `${SITE_URL}/contact`, `${SITE_URL}/blog`, `${SITE_URL}/changelog`, `${SITE_URL}/compare`, `${SITE_URL}/use-cases`, `${SITE_URL}/file-types`, `${SITE_URL}/questions`, `${SITE_URL}/collections`,
  ...categories.map((category) => `${SITE_URL}/categories/${category.id}`),
  ...tools.filter((tool) => tool.status === "ready" && tool.slug).flatMap((tool) => [`${SITE_URL}/tools/${tool.slug}`, `${SITE_URL}/ar/tools/${tool.slug}`]),
  ...comparisonRegistry.map((entry) => `${SITE_URL}/compare/${entry.slug}`),
  ...useCaseRegistry.map((entry) => `${SITE_URL}/use-cases/${entry.slug}`),
  ...fileTypeRegistry.map((entry) => `${SITE_URL}/file-types/${entry.slug}`),
  ...questionRegistry.map((entry) => `${SITE_URL}/questions/${entry.slug}`),
  ...collectionRegistry.map((entry) => `${SITE_URL}/collections/${entry.slug}`),
  ...blogPosts.map((entry) => `${SITE_URL}/blog/${entry.slug}`),
];

for (const url of expectedUrls) if (!publicSitemap.includes(`<loc>${url}</loc>`)) issues.push(`Missing sitemap URL: ${url}`);

if (issues.length > 0) throw new Error(`SEO validation failed with ${issues.length} issue(s).\n- ${issues.join("\n- ")}`);
console.log(`SEO validation passed: ${toolSeoEntries.length} tool pages and ${expectedUrls.length} canonical URLs.`);
