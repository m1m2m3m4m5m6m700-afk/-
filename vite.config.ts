import fs from 'node:fs';
import { fileURLToPath, URL } from 'node:url';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const allowedHosts = (process.env.VITE_ALLOWED_HOSTS ?? '')
  .split(',')
  .map((host) => host.trim())
  .filter(Boolean);

const supportedLocales = new Set(['en','zh','hi','es','fr','ar','bn','pt','ru','ur','id','de','ja','sw','mr','te','tr','ta','ko','vi']);
const toolsSource = fs.readFileSync(new URL('./src/config/tools.ts', import.meta.url), 'utf8');
const toolIds = new Set([...toolsSource.matchAll(/\bid:\s*['"]([^'"]+)['"]/g)].map((match) => match[1]));

const localized404 = (locale: string): string => {
  const dir = ['ar', 'ur'].includes(locale) ? 'rtl' : 'ltr';
  return `<!doctype html><html lang="${locale}" dir="${dir}"><head><meta charset="utf-8"><meta name="robots" content="noindex,follow"><meta name="content-language" content="${locale}"><meta name="viewport" content="width=device-width, initial-scale=1"><title>404 | FLIXO</title></head><body><main><h1>404</h1><p>Tool not found.</p></main></body></html>`;
};

const localized404Plugin = () => ({
  name: 'flixo-localized-404',
  configureServer(server) {
    server.middlewares.use((req, res, next) => {
      const pathname = new URL(req.url ?? '/', 'http://127.0.0.1').pathname;
      const match = pathname.match(/^\/([a-z]{2})\/([^/?#]+)\/?$/i);
      if (match && supportedLocales.has(match[1]) && !toolIds.has(match[2])) {
        res.statusCode = 404;
        res.setHeader('Content-Type', 'text/html; charset=utf-8');
        res.setHeader('X-Robots-Tag', 'noindex, follow');
        res.end(localized404(match[1]));
        return;
      }
      next();
    });
  },
});

export default defineConfig({
  plugins: [react(), localized404Plugin()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  server: {
    host: '0.0.0.0',
    port: 3000,
    strictPort: true,
    allowedHosts,
  },
});
