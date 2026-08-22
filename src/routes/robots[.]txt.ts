import { createAPIFileRoute } from '@tanstack/react-start/api';

const SITE_URL = (process.env.VITE_SITE_URL || process.env.NEXT_PUBLIC_SITE_URL || 'https://flixo.app').replace(/\/$/, '');

export const APIRoute = createAPIFileRoute('/robots.txt')({
  GET: async () => {
    const body = `User-agent: *\nAllow: /\nDisallow: /en/quickflow/\nDisallow: /ar/quickflow/\n\nSitemap: ${SITE_URL}/sitemap.xml\n`;
    return new Response(body, { headers: { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'public, max-age=3600, s-maxage=3600' } });
  },
});
