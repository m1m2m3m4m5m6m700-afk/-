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
  return Function(
    options.args ?? "",
    `${options.prelude ?? ""}\nreturn [${body}];`,
  )(...(options.values ?? []));
}

function loadTools(source) {
  const toolsMatch = source.match(/export const tools: Tool\[\] = \[([\s\S]*?)\n\];/);
  if (!toolsMatch) throw new Error("Missing tools export array.");
  const sanitizedBody = toolsMatch[1]
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
  const iconBlock = [...source.matchAll(/import \{([\s\S]*?)\} from \"([^\"]+)\";/g)].find(
    (match) => match[2] === "lucide-react",
  );
  const iconNames = (iconBlock?.[1] ?? "")
    .split(",")
    .map((name) => name.trim())
    .filter(Boolean);
  const prelude =
    "const chromeToolIds = [];\n" +
    iconNames.map((name) => `const ${name} = Symbol(${JSON.stringify(name)});`).join("\n");
  return loadArrayFromExport(source, "categories", { prelude });
}

const tools = loadTools(read("src/data/tools.ts"));
const categories = loadCategoryCatalog(read("src/data/categories.ts"));
const seoEnterpriseSource = read("src/data/seoEnterpriseData.ts");
const blogSource = read("src/data/blogData.ts");

const comparisonRegistry = loadArrayFromExport(seoEnterpriseSource, "comparisonRegistry");
const useCaseRegistry = loadArrayFromExport(seoEnterpriseSource, "useCaseRegistry");
const fileTypeRegistry = loadArrayFromExport(seoEnterpriseSource, "fileTypeRegistry");
const questionRegistry = loadArrayFromExport(seoEnterpriseSource, "questionRegistry");
const collectionRegistry = loadArrayFromExport(seoEnterpriseSource, "collectionRegistry");
const blogPosts = loadArrayFromExport(blogSource, "blogPosts");

const allPages = [
  { url: "/" },
  { url: "/ar" },
  { url: "/es" },
  { url: "/fr" },
  { url: "/de" },
  { url: "/pt" },
  { url: "/it" },
  { url: "/nl" },
  { url: "/pl" },
  { url: "/sv" },
  { url: "/tr" },
  { url: "/ro" },
  { url: "/uk" },
  { url: "/ru" },
  { url: "/zh-CN" },
  { url: "/ja" },
  { url: "/ko" },
  { url: "/el" },
  { url: "/cs" },
  { url: "/vi" },
  { url: "/id" },
  { url: "/th" },
  { url: "/hi" },
  { url: "/he" },
  { url: "/fa" },
  { url: "/bn" },
  { url: "/ms" },
  { url: "/contact" },
  { url: "/blog" },
  { url: "/changelog" },
  { url: "/compare" },
  { url: "/use-cases" },
  { url: "/file-types" },
  { url: "/questions" },
  { url: "/collections" },
  ...categories.map((category) => ({ url: `/categories/${category.id}` })),
  ...tools
    .filter((tool) => tool.status === "ready" && tool.slug)
    .flatMap((tool) => [
      { url: `/tools/${tool.slug}` },
      { url: `/ar/tools/${tool.slug}` },
      { url: `/es/tools/${tool.slug}` },
      { url: `/fr/tools/${tool.slug}` },
      { url: `/de/tools/${tool.slug}` },
      { url: `/pt/tools/${tool.slug}` },
      { url: `/it/tools/${tool.slug}` },
      { url: `/nl/tools/${tool.slug}` },
      { url: `/pl/tools/${tool.slug}` },
      { url: `/sv/tools/${tool.slug}` },
      { url: `/tr/tools/${tool.slug}` },
      { url: `/ro/tools/${tool.slug}` },
      { url: `/uk/tools/${tool.slug}` },
      { url: `/ru/tools/${tool.slug}` },
      { url: `/zh-CN/tools/${tool.slug}` },
      { url: `/ja/tools/${tool.slug}` },
      { url: `/ko/tools/${tool.slug}` },
      { url: `/el/tools/${tool.slug}` },
      { url: `/cs/tools/${tool.slug}` },
      { url: `/vi/tools/${tool.slug}` },
      { url: `/id/tools/${tool.slug}` },
      { url: `/th/tools/${tool.slug}` },
      { url: `/hi/tools/${tool.slug}` },
      { url: `/he/tools/${tool.slug}` },
      { url: `/fa/tools/${tool.slug}` },
      { url: `/bn/tools/${tool.slug}` },
      { url: `/ms/tools/${tool.slug}` },
    ]),
  ...comparisonRegistry.map((entry) => ({ url: `/compare/${entry.slug}` })),
  ...useCaseRegistry.map((entry) => ({ url: `/use-cases/${entry.slug}` })),
  ...fileTypeRegistry.map((entry) => ({ url: `/file-types/${entry.slug}` })),
  ...questionRegistry.map((entry) => ({ url: `/questions/${entry.slug}` })),
  ...collectionRegistry.map((entry) => ({ url: `/collections/${entry.slug}` })),
  ...blogPosts.map((entry) => ({ url: `/blog/${entry.slug}` })),
];

const uniquePages = Array.from(new Map(allPages.map((page) => [page.url, page])).values());

// Do not emit synthetic lastmod/changefreq/priority values. A build timestamp is
// not a content modification timestamp, and the old generator marked every URL
// as changed on every deployment. Search engines should receive only truthful
// sitemap signals.
const sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${uniquePages
  .map((page) => `  <url>\n    <loc>${SITE_URL}${page.url}</loc>\n  </url>`)
  .join("\n")}\n</urlset>\n`;

const robots = `User-agent: *\nAllow: /\nAllow: /tools/\nAllow: /ar/\nAllow: /es/\nAllow: /fr/\nAllow: /de/\nAllow: /pt/\nAllow: /it/\nAllow: /nl/\nAllow: /pl/\nAllow: /sv/\nAllow: /tr/\nAllow: /ro/\nAllow: /uk/\nAllow: /ru/\nAllow: /zh-CN/\nAllow: /ja/\nAllow: /ko/\nAllow: /el/\nAllow: /cs/\nAllow: /vi/\nAllow: /id/\nAllow: /th/\nAllow: /hi/\nAllow: /he/\nAllow: /fa/\nAllow: /bn/\nAllow: /ms/\nAllow: /categories/\nAllow: /blog/\nAllow: /compare/\nAllow: /use-cases/\nAllow: /file-types/\nAllow: /questions/\nAllow: /collections/\nAllow: /sitemap.xml\n\nUser-agent: Googlebot\nAllow: /\n\nUser-agent: Bingbot\nAllow: /\n\nUser-agent: Twitterbot\nAllow: /\n\nUser-agent: facebookexternalhit\nAllow: /\n\nUser-agent: PerplexityBot\nAllow: /\n\nUser-agent: GPTBot\nAllow: /\n\nUser-agent: ChatGPT-User\nAllow: /\n\nUser-agent: ClaudeBot\nAllow: /\n\nUser-agent: Google-Extended\nAllow: /\n\nSitemap: ${SITE_URL}/sitemap.xml\n`;

fs.writeFileSync(path.join(root, "public/sitemap.xml"), sitemap);
fs.writeFileSync(path.join(root, "public/robots.txt"), robots);
console.log(`Generated static SEO artifacts: ${uniquePages.length} sitemap URLs and robots.txt.`);
