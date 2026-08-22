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
const locs = (xml) => [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1].trim());
const assertAbsoluteNoQuery = (name, xml) => {
  const urls = locs(xml);
  if (urls.length === 0) throw new Error(`${name} sitemap contains no <loc> URLs.`);
  for (const value of urls) {
    const url = new URL(value);
    if (url.origin !== origin.origin) throw new Error(`${name} sitemap contains a non-production origin: ${value}`);
    if (url.search) throw new Error(`${name} sitemap contains a query parameter: ${value}`);
    if (url.hash) throw new Error(`${name} sitemap contains a fragment: ${value}`);
  }
};

assertAbsoluteNoQuery('sitemap-index', index);
if (!robots.includes(`${origin.origin}/sitemap-index.xml`)) throw new Error('robots.txt must reference the sitemap index.');

let urlCount = 0;
for (const language of languages) {
  const xml = await readFile(`public/sitemap-${language}.xml`, 'utf8');
  assertAbsoluteNoQuery(language, xml);
  const urls = locs(xml);
  if (!index.includes(`/sitemap-${language}.xml`)) throw new Error(`Sitemap index missing ${language}.`);
  if (urls.some((url) => !url.startsWith(`${origin.origin}/${language}/`))) {
    throw new Error(`${language} sitemap contains a URL outside its language prefix.`);
  }
  urlCount += urls.length;
}
if (urlCount !== 420) throw new Error(`Expected 420 localized indexable tool URLs, got ${urlCount}.`);
if (locs(index).length !== 20) throw new Error('Sitemap index must contain exactly 20 language sitemaps.');
