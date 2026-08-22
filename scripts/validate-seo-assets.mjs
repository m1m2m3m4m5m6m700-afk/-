import { readFile } from 'node:fs/promises';

const siteUrl = (process.env.SEO_SITE_URL || process.env.VITE_SITE_URL || '').trim();
if (!siteUrl) throw new Error('SEO_SITE_URL is required for SEO validation.');

const origin = new URL(siteUrl);
if (origin.protocol !== 'https:' || origin.hostname.endsWith('.vercel.app') || origin.hostname === 'localhost') {
  throw new Error('SEO_SITE_URL must be a final HTTPS production domain.');
}

const files = ['public/sitemap-index.xml', 'public/sitemap-en.xml', 'public/sitemap-ar.xml', 'public/robots.txt'];
for (const file of files) {
  await readFile(file, 'utf8');
}

const index = await readFile('public/sitemap-index.xml', 'utf8');
const en = await readFile('public/sitemap-en.xml', 'utf8');
const ar = await readFile('public/sitemap-ar.xml', 'utf8');
const robots = await readFile('public/robots.txt', 'utf8');

for (const [name, xml] of [['index', index], ['en', en], ['ar', ar]]) {
  if (!xml.includes(origin.origin)) throw new Error(`${name} sitemap contains no absolute production origin.`);
  if (xml.includes('?')) throw new Error(`${name} sitemap must not contain query parameters.`);
}
if (!index.includes('/sitemap-en.xml') || !index.includes('/sitemap-ar.xml')) throw new Error('Sitemap index must reference both language sitemaps.');
if (!robots.includes(`${origin.origin}/sitemap-index.xml`)) throw new Error('robots.txt must reference the sitemap index.');
