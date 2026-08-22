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

const routes = [
  '/', '/en/image-compressor', '/ar/image-compressor', '/en/background-remover', '/en/ai-image-generator',
  '/en/image-upscaler', '/en/image-converter', '/en/image-to-text', '/en/object-remover', '/en/crop-resize',
  '/en/watermark-remover', '/en/raster-to-svg', '/en/image-cropper', '/en/image-ocr', '/en/background-blur',
  '/en/passport-photo-maker', '/en/watermark-adder', '/en/meme-generator', '/en/collage-maker', '/en/image-effects',
  '/en/exif-cleaner', '/en/svg-optimizer', '/en/mockup-generator', '/en/image-to-svg', '/en/seed', '/en/pix',
];

const absolute = (path) => new URL(path, origin).href;
const esc = (value) => value.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;').replaceAll("'", '&apos;');
const sitemap = (items) => `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${items.map((path) => `  <url><loc>${esc(absolute(path))}</loc></url>`).join('\n')}\n</urlset>\n`;

await mkdir('public', { recursive: true });
const enRoutes = routes.filter((path) => path === '/' || path.startsWith('/en/'));
const arRoutes = routes.filter((path) => path.startsWith('/ar/'));
await writeFile('public/sitemap-en.xml', sitemap(enRoutes), 'utf8');
await writeFile('public/sitemap-ar.xml', sitemap(arRoutes), 'utf8');
await writeFile('public/sitemap-index.xml', `<?xml version="1.0" encoding="UTF-8"?>\n<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n  <sitemap><loc>${esc(absolute('/sitemap-en.xml'))}</loc></sitemap>\n  <sitemap><loc>${esc(absolute('/sitemap-ar.xml'))}</loc></sitemap>\n</sitemapindex>\n`, 'utf8');
await writeFile('public/robots.txt', `User-agent: *\nAllow: /\nSitemap: ${absolute('/sitemap-index.xml')}\n`, 'utf8');

const indexNowKey = process.env.INDEXNOW_KEY?.trim();
if (indexNowKey) await writeFile(`public/${indexNowKey}.txt`, indexNowKey, 'utf8');
