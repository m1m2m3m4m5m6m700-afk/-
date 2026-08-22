import { createFileRoute } from '@tanstack/react-router';
import { INTENT_SLUGS_REGISTRY } from '../config/intents';
import { WORKFLOW_REGISTRY } from '../lib/workflows/registry';

const SITE_URL = (process.env.VITE_SITE_URL || process.env.NEXT_PUBLIC_SITE_URL || 'https://flixo.app').replace(/\/$/, '');

function escapeXml(value: string) {
  return value.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;').replaceAll("'", '&apos;');
}

export const Route = createFileRoute('/sitemap.xml')({
  server: {
    handlers: {
      GET: async () => {
        const now = new Date().toISOString();
        const urls = [
          { path: '/', priority: '1.0', changefreq: 'daily' },
          ...WORKFLOW_REGISTRY.map((workflow) => ({ path: `/en/quickflow/${workflow.id}`, priority: '0.8', changefreq: 'weekly' })),
          ...INTENT_SLUGS_REGISTRY.map((intent) => ({ path: `/en/use-case/${intent.slug}`, priority: '0.85', changefreq: 'weekly' })),
        ];
        const body = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls.map((item) => `<url><loc>${escapeXml(`${SITE_URL}${item.path}`)}</loc><lastmod>${now}</lastmod><changefreq>${item.changefreq}</changefreq><priority>${item.priority}</priority></url>`).join('')}</urlset>`;
        return new Response(body, { headers: { 'Content-Type': 'application/xml; charset=utf-8', 'Cache-Control': 'public, max-age=3600, s-maxage=3600' } });
      },
    },
  },
});
