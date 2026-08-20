import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const SITE_URL = "https://flixoai.vercel.app";

function read(relativePath) {
  return fs.readFileSync(path.join(root, relativePath), "utf8");
}

function parseCanonicalTools(source) {
  const ids = [];
  const pattern = /\bid:\s*"([^"]+)",\s*slug:\s*"([^"]+)",\s*name:/g;
  let match;
  while ((match = pattern.exec(source))) ids.push({ id: match[1], slug: match[2] });
  return ids;
}

function parseSeoRegistry(source) {
  const entries = [];
  const pattern = /"([^"]+)":\s*\{\s*title:\s*"([^"]*)",\s*description:\s*"([^"]*)",\s*keywords:\s*\[([\s\S]*?)\]\s*\}/g;
  let match;
  while ((match = pattern.exec(source))) {
    const keywords = [...match[4].matchAll(/"([^"]+)"/g)].map((item) => item[1]);
    entries.push({ id: match[1], title: match[2], description: match[3], keywords });
  }
  return entries;
}

function pushDuplicateIssues(records, label, issues) {
  const grouped = new Map();
  for (const { key, value } of records) {
    if (!value) continue;
    const refs = grouped.get(value) ?? [];
    refs.push(key);
    grouped.set(value, refs);
  }
  for (const [value, refs] of grouped.entries()) {
    if (refs.length > 1) issues.push(`Duplicate ${label}: ${value} (${refs.join(", ")})`);
  }
}

const platformSource = read("src/lib/tool-platform/publicDesktopTools.ts");
const seoSource = read("src/lib/tool-platform/seoRegistry.ts");
const categoriesSource = read("src/lib/tool-platform/categories.ts");
const rootRouteSource = read("src/routes/__root.tsx");
const structuredDataSource = read("src/lib/seo/structuredData.ts");
const publicRobots = read("public/robots.txt");
const publicSitemap = read("public/sitemap.xml");

const publicTools = parseCanonicalTools(platformSource);
const seoEntries = parseSeoRegistry(seoSource);
const canonicalIds = new Set(publicTools.map((tool) => tool.id));
const seoById = new Map(seoEntries.map((entry) => [entry.id, entry]));
const issues = [];

if (platformSource.includes("src/data/tools") || platformSource.includes("./tools")) {
  issues.push("Canonical public tool registry must not import the deleted legacy tool catalog.");
}
if (seoSource.includes("src/data/toolSeo") || seoSource.includes("src/data/tools")) {
  issues.push("Canonical SEO registry must not import legacy SEO/tool data.");
}

for (const tool of publicTools) {
  const seo = seoById.get(tool.id);
  if (!seo) issues.push(`Missing canonical SEO metadata for public tool ${tool.id}.`);
  else {
    if (!seo.title.trim()) issues.push(`Missing SEO title for ${tool.id}.`);
    if (!seo.description.trim()) issues.push(`Missing SEO description for ${tool.id}.`);
    if (seo.keywords.length < 3) issues.push(`Too few SEO keywords for ${tool.id}; expected at least 3.`);
  }
  const canonicalUrl = `${SITE_URL}/tools/${tool.slug}`;
  if (!publicSitemap.includes(`<loc>${canonicalUrl}</loc>`)) issues.push(`Missing sitemap URL: ${canonicalUrl}`);
}

for (const seo of seoEntries) {
  if (!canonicalIds.has(seo.id)) issues.push(`SEO registry contains non-public/unregistered tool: ${seo.id}.`);
}

pushDuplicateIssues(seoEntries.map((entry) => ({ key: entry.id, value: entry.title })), "tool SEO title", issues);
pushDuplicateIssues(seoEntries.map((entry) => ({ key: entry.id, value: entry.description })), "tool SEO description", issues);

if (!categoriesSource.includes("export const categories")) issues.push("Canonical category registry is missing its categories export.");
if (!rootRouteSource.includes("buildOrganizationSchema()")) issues.push("Root route is missing Organization structured data.");
if (!rootRouteSource.includes("buildWebSiteSchema()")) issues.push("Root route is missing WebSite structured data.");
if (!structuredDataSource.includes("SearchAction")) issues.push("Root structured data is missing SearchAction.");
if (!publicRobots.includes("Sitemap: https://flixoai.vercel.app/sitemap.xml")) issues.push("robots.txt must reference the canonical sitemap.xml URL.");

if (issues.length) {
  throw new Error(`SEO validation failed with ${issues.length} issue(s).\n- ${issues.join("\n- ")}`);
}

console.log(`SEO validation passed: ${publicTools.length} public tool registrations with canonical SEO metadata.`);
