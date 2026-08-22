import { mkdir, writeFile } from 'node:fs/promises';

const siteUrl = (process.env.VITE_SITE_URL || process.env.SEO_SITE_URL)?.trim();
if (!siteUrl) {
  console.warn('SEO assets skipped: configure VITE_SITE_URL to generate production sitemap and robots URLs.');
  process.exit(0);
}

const origin = new URL(siteUrl);
if (origin.protocol !== 'https:' || origin.hostname.endsWith('.vercel.app') || origin.hostname === 'localhost') {
  throw new Error('SEO site URL must be the final HTTPS production domain, not localhost or a Vercel preview/temporary domain.');
}

const languages = ['en','ar','zh','es','fr','de','pt','ja','ko','ru','it','nl','pl','tr','sv','id','hi','ur','vi','th'];
const readyTools = [
  'image-compressor','background-remover','image-upscaler','image-converter','ai-image-generator','object-remover',
  'watermark-remover','image-cropper','image-to-svg','image-ocr','background-blur','passport-photo-maker','watermark-adder',
  'meme-generator','collage-maker','image-effects','exif-cleaner','svg-optimizer','mockup-generator','seed','pix',
];

const routesFor = (language) => readyTools.map((tool) => `/${language}/${tool}`);
const absolute = (path) => new URL(path, origin).href;
const esc = (value) => value.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;').replaceAll("'", '&apos;');
const sitemap = (items) => `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${items.map((path) => `  <url><loc>${esc(absolute(path))}</loc></url>`).join('\n')}\n</urlset>\n`;

if (languages.length !== 20 || readyTools.length !== 21) throw new Error('SEO catalog invariant failed.');
const totalIndexable = readyTools.length * languages.length + 1;
if (totalIndexable !== 421) throw new Error(`Expected 421 indexable URLs, got ${totalIndexable}.`);

await mkdir('public', { recursive: true });
const sitemapEntries = [];
for (const language of languages) {
  const paths = routesFor(language);
  const fileName = `sitemap-${language}.xml`;
  await writeFile(`public/${fileName}`, sitemap(paths), 'utf8');
  sitemapEntries.push(`  <sitemap><loc>${esc(absolute(`/${fileName}`))}</loc></sitemap>`);
}

await writeFile('public/sitemap-index.xml', `<?xml version="1.0" encoding="UTF-8"?>\n<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${sitemapEntries.join('\n')}\n</sitemapindex>\n`, 'utf8');
await writeFile('public/robots.txt', `User-agent: *\nAllow: /\nSitemap: ${absolute('/sitemap-index.xml')}\n`, 'utf8');

const indexNowKey = process.env.INDEXNOW_KEY?.trim();
if (indexNowKey) await writeFile(`public/${indexNowKey}.txt`, indexNowKey, 'utf8');
