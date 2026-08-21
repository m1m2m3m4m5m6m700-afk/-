import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const dist = path.join(root, 'dist');
const source = fs.readFileSync(path.join(root, 'src/config/tools.ts'), 'utf8');
const tools = [...source.matchAll(/id:\s*'([^']+)'[^\n]*?path:\s*'([^']+)'/g)].map((match) => ({ id: match[1], path: match[2] }));
const locales = ['en', 'zh', 'hi', 'es', 'fr', 'ar', 'bn', 'pt', 'ru', 'ur', 'id', 'de', 'ja', 'sw', 'mr', 'te', 'tr', 'ta', 'ko', 'vi'];
const siteUrl = (process.env.SITE_URL || (process.env.VERCEL_PROJECT_PRODUCTION_URL && `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`) || (process.env.VERCEL_URL && `https://${process.env.VERCEL_URL}`) || 'http://localhost:3000').replace(/\/$/, '');
const escapeXml = (value) => value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;');

const pages = [{ path: '/', key: 'home' }, ...tools.map((tool) => ({ path: tool.path, key: tool.id }))];
const sitemapDir = path.join(dist, 'sitemaps');
fs.mkdirSync(sitemapDir, { recursive: true });

for (const locale of locales) {
  const body = pages.map(({ path: toolPath }) => {
    const localizedPath = `/${locale}/${toolPath.replace(/^\/[a-z]{2}\//, '').replace(/^\//, '')}`;
    const alternates = locales.map((alternate) => {
      const href = `${siteUrl}/${alternate}/${toolPath.replace(/^\/[a-z]{2}\//, '').replace(/^\//, '')}`;
      return `<xhtml:link rel="alternate" hreflang="${alternate}" href="${escapeXml(href)}"/>`;
    }).join('');
    return `<url><loc>${escapeXml(`${siteUrl}${localizedPath}`)}</loc>${alternates}<xhtml:link rel="alternate" hreflang="x-default" href="${escapeXml(`${siteUrl}/en/${toolPath.replace(/^\/[a-z]{2}\//, '').replace(/^\//, '')}`)}"/></url>`;
  }).join('');
  fs.writeFileSync(path.join(sitemapDir, `sitemap-${locale}.xml`), `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">${body}</urlset>\n`);
}

const indexEntries = locales.map((locale) => `<sitemap><loc>${escapeXml(`${siteUrl}/sitemaps/sitemap-${locale}.xml`)}</loc></sitemap>`).join('');
fs.writeFileSync(path.join(dist, 'sitemap-index.xml'), `<?xml version="1.0" encoding="UTF-8"?><sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${indexEntries}</sitemapindex>\n`);

console.log(`Generated ${locales.length} localized sitemaps for ${pages.length} page patterns at ${siteUrl}`);
