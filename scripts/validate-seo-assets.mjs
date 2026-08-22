import { readFile } from 'node:fs/promises';

const siteUrl = (process.env.SEO_SITE_URL || process.env.VITE_SITE_URL || '').trim();
if (!siteUrl) throw new Error('SEO_SITE_URL is required for SEO validation.');

const origin = new URL(siteUrl);
if (origin.protocol !== 'https:' || origin.hostname.endsWith('.vercel.app') || origin.hostname === 'localhost') {
  throw new Error('SEO_SITE_URL must be a final HTTPS production domain.');
}

const languages = ['en','ar','zh','es','fr','de','pt','ja','ko','ru','it','nl','pl','tr','sv','id','hi','ur','vi','th'];
const files = ['public/sitemap-index.xml', ...languages.map((language) => `public/sitemap-${language}.xml`), 'public/robots.txt'];
for (const file of files) await readFile(file, 'utf8');

const index = await readFile('public/sitemap-index.xml', 'utf8');
const robots = await readFile('public/robots.txt', 'utf8');
if (index.includes('?')) throw new Error('Sitemap index must not contain query parameters.');
if (!robots.includes(`${origin.origin}/sitemap-index.xml`)) throw new Error('robots.txt must reference the sitemap index.');

let urlCount = 0;
for (const language of languages) {
  const xml = await readFile(`public/sitemap-${language}.xml`, 'utf8');
  if (!xml.includes(origin.origin)) throw new Error(`${language} sitemap contains no absolute production origin.`);
  if (xml.includes('?')) throw new Error(`${language} sitemap must not contain query parameters.`);
  urlCount += (xml.match(/<url>/g) ?? []).length;
  if (!index.includes(`/sitemap-${language}.xml`)) throw new Error(`Sitemap index missing ${language}.`);
}
if (urlCount !== 420) throw new Error(`Expected 420 localized indexable tool URLs, got ${urlCount}.`);
if ((index.match(/<sitemap>/g) ?? []).length !== 20) throw new Error('Sitemap index must contain exactly 20 language sitemaps.');
