import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const sitemapRoot = path.join(root, 'dist');
const maxBytes = 50 * 1024 * 1024;
const maxUrls = 50000;
const errors = [];
const localeSegment = /^\/[a-z]{2}(?:\/|$)/i;
const indexEntry = /^\/sitemaps\/sitemap-[a-z]{2}\.xml$/i;

const files = fs.existsSync(sitemapRoot)
  ? fs.readdirSync(sitemapRoot, { recursive: true }).filter((file) => typeof file === 'string' && file.endsWith('.xml'))
  : [];

const indexPath = path.join(sitemapRoot, 'sitemap-index.xml');
if (!fs.existsSync(indexPath)) errors.push('[GLOBAL][SITEMAP_INDEX_MISSING] dist/sitemap-index.xml is missing');
if (!files.length) errors.push('[GLOBAL][SITEMAP_FILES_MISSING] No XML sitemap files were generated');

for (const relative of files) {
  const filePath = path.join(sitemapRoot, relative);
  const name = String(relative).replaceAll('\\', '/');
  const stat = fs.statSync(filePath);
  if (stat.size > maxBytes) errors.push(`[GLOBAL][${name}][SIZE_EXCEEDED] ${stat.size} bytes exceeds 50MB uncompressed`);
  const content = fs.readFileSync(filePath, 'utf8');
  if (!content.startsWith('<?xml')) errors.push(`[GLOBAL][${name}][XML_HEADER_MISSING] Missing XML declaration`);
  const locs = [...content.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1].trim());
  if (locs.length > maxUrls) errors.push(`[GLOBAL][${name}][URL_LIMIT_EXCEEDED] ${locs.length} loc entries exceeds 50,000`);
  const isIndex = name === 'sitemap-index.xml';
  for (const url of locs) {
    try {
      const parsed = new URL(url);
      if (parsed.protocol !== 'https:') errors.push(`[GLOBAL][${name}][HTTPS_REQUIRED] ${url}`);
      if (parsed.hostname === 'localhost' || parsed.hostname === '127.0.0.1' || parsed.hostname.endsWith('.vercel.app')) errors.push(`[GLOBAL][${name}][INVALID_DOMAIN] ${url}`);
      if (parsed.search) errors.push(`[GLOBAL][${name}][QUERY_URL] Sitemap URL contains query parameters: ${url}`);
      if (isIndex) {
        if (!indexEntry.test(parsed.pathname)) errors.push(`[GLOBAL][${name}][SUBSITEMAP_PATH] Expected /sitemaps/sitemap-<lang>.xml: ${url}`);
      } else if (!localeSegment.test(parsed.pathname)) {
        errors.push(`[GLOBAL][${name}][LOCALE_PATH] URL is not localized: ${url}`);
      }
    } catch {
      errors.push(`[GLOBAL][${name}][INVALID_URL] ${url}`);
    }
  }
}

if (fs.existsSync(indexPath)) {
  const index = fs.readFileSync(indexPath, 'utf8');
  if (!index.includes('<sitemapindex')) errors.push('[GLOBAL][SITEMAP_INDEX_INVALID] Root is not <sitemapindex>');
  const indexLocs = [...index.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1].trim());
  if (indexLocs.length !== 20) errors.push(`[GLOBAL][SITEMAP_INDEX][LOCALE_COUNT] Expected 20 localized sitemap entries, found ${indexLocs.length}`);
}

if (errors.length) {
  console.error('❌ Sitemap quality gate failed');
  for (const error of errors) console.error(`  ${error}`);
  process.exit(1);
}

console.log(`✅ Sitemap quality gate passed: ${files.length} XML files validated`);
