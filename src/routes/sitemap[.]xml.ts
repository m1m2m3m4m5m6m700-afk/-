import { createFileRoute } from '@tanstack/react-router';
import { INTENT_SLUGS_REGISTRY } from '../config/intents';
import { TOOLS_REGISTRY } from '../config/tools';

const SITE_URL = (process.env.VITE_SITE_URL || process.env.NEXT_PUBLIC_SITE_URL || 'https://flixo.app').replace(/\/$/, '');

function escapeXml(value: string) {
  return value.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;').replaceAll("'", '&apos;');
}

function localizedPath(path: string, locale: 'en' | 'ar') {
  if (path === '/') return locale === 'ar' ? '/ar' : '/';
  return locale === 'ar' ? `/ar${path.replace(/^\/en/, '')}` : path;
}

function alternateLinks(path: string) {
  const enPath = localizedPath(path, 'en');
  const arPath = localizedPath(path, 'ar');
  return `<xhtml:link rel="alternate" hreflang="en" href="${escapeXml(`${SITE_URL}${enPath}`)}"/><xhtml:link rel="alternate" hreflang="ar" href="${escapeXml(`${SITE_URL}${arPath}`)}"/>`;
}

export const Route = createFileRoute('/sitemap.xml')({
  server: {
    handlers: {
      GET: async () => {
        const now = new Date().toISOString();
        const basePaths = [
          { path: '/', priority: '1.0', changefreq: 'daily' },
          ...TOOLS_REGISTRY.filter((tool) => tool.isReady).map((tool) => ({ path: tool.path, priority: '0.75', changefreq: 'weekly' })),
          ...INTENT_SLUGS_REGISTRY.map((intent) => ({ path: `/en/use-case/${intent.slug}`, priority: '0.85', changefreq: 'weekly' })),
        ];
        const urls = basePaths.flatMap((item) => [
          { ...item, path: localizedPath(item.path, 'en') },
          { ...item, path: localizedPath(item.path, 'ar') },
        ]);
        const body = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">${urls.map((item) => `<url><loc>${escapeXml(`${SITE_URL}${item.path}`)}</loc><lastmod>${now}</lastmod><changefreq>${item.changefreq}</changefreq><priority>${item.priority}</priority>${alternateLinks(item.path)}</url>`).join('')}</urlset>`;
        return new Response(body, { headers: { 'Content-Type': 'application/xml; charset=utf-8', 'Cache-Control': 'public, max-age=3600, s-maxage=3600' } });
      },
    },
  },
});
