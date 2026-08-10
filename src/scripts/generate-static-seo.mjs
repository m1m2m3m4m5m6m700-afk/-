import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const SITE_URL = "https://flixoai.vercel.app";
const today = new Date().toISOString().split("T")[0];

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
  { url: "/", priority: "1.0", changefreq: "daily" },
  { url: "/en", priority: "1.0", changefreq: "daily" },
  { url: "/ar", priority: "1.0", changefreq: "daily" },
  { url: "/contact", priority: "0.6", changefreq: "monthly" },
  { url: "/blog", priority: "0.8", changefreq: "weekly" },
  { url: "/changelog", priority: "0.7", changefreq: "weekly" },
  { url: "/compare", priority: "0.8", changefreq: "weekly" },
  { url: "/use-cases", priority: "0.8", changefreq: "weekly" },
  { url: "/file-types", priority: "0.8", changefreq: "weekly" },
  { url: "/questions", priority: "0.8", changefreq: "weekly" },
  { url: "/collections", priority: "0.8", changefreq: "weekly" },
  ...categories.map((category) => ({
    url: `/categories/${category.id}`,
    priority: "0.8",
    changefreq: "weekly",
  })),
  ...tools
    .filter((tool) => tool.status === "ready" && tool.slug)
    .flatMap((tool) => [
      { url: `/tools/${tool.slug}`, priority: "0.9", changefreq: "weekly" },
      { url: `/en/tools/${tool.slug}`, priority: "0.9", changefreq: "weekly" },
      { url: `/ar/tools/${tool.slug}`, priority: "0.9", changefreq: "weekly" },
    ]),
  ...comparisonRegistry.map((entry) => ({
    url: `/compare/${entry.slug}`,
    priority: "0.7",
    changefreq: "monthly",
  })),
  ...useCaseRegistry.map((entry) => ({
    url: `/use-cases/${entry.slug}`,
    priority: "0.7",
    changefreq: "monthly",
  })),
  ...fileTypeRegistry.map((entry) => ({
    url: `/file-types/${entry.slug}`,
    priority: "0.7",
    changefreq: "monthly",
  })),
  ...questionRegistry.map((entry) => ({
    url: `/questions/${entry.slug}`,
    priority: "0.7",
    changefreq: "monthly",
  })),
  ...collectionRegistry.map((entry) => ({
    url: `/collections/${entry.slug}`,
    priority: "0.7",
    changefreq: "monthly",
  })),
  ...blogPosts.map((entry) => ({
    url: `/blog/${entry.slug}`,
    priority: "0.7",
    changefreq: "monthly",
  })),
];

const uniquePages = Array.from(new Map(allPages.map((page) => [page.url, page])).values());

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${uniquePages
  .map(
    (page) =>
      `  <url>\n    <loc>${SITE_URL}${page.url}</loc>\n    <lastmod>${today}</lastmod>\n    <changefreq>${page.changefreq}</changefreq>\n    <priority>${page.priority}</priority>\n  </url>`,
  )
  .join("\n")}\n</urlset>\n`;

const robots = `User-agent: *\nAllow: /\nAllow: /tools/\nAllow: /en/\nAllow: /ar/\nAllow: /categories/\nAllow: /blog/\nAllow: /compare/\nAllow: /use-cases/\nAllow: /file-types/\nAllow: /questions/\nAllow: /collections/\nAllow: /sitemap.xml\n\nUser-agent: Googlebot\nAllow: /\n\nUser-agent: Bingbot\nAllow: /\n\nUser-agent: Twitterbot\nAllow: /\n\nUser-agent: facebookexternalhit\nAllow: /\n\nUser-agent: PerplexityBot\nAllow: /\n\nUser-agent: GPTBot\nAllow: /\n\nUser-agent: ChatGPT-User\nAllow: /\n\nUser-agent: ClaudeBot\nAllow: /\n\nUser-agent: Google-Extended\nAllow: /\n\nSitemap: ${SITE_URL}/sitemap.xml\n`;

fs.writeFileSync(path.join(root, "public/sitemap.xml"), sitemap);
fs.writeFileSync(path.join(root, "public/robots.txt"), robots);
console.log(`Generated static SEO artifacts: ${uniquePages.length} sitemap URLs and robots.txt.`);
