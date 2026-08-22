import { fileURLToPath, URL as NodeURL } from 'node:url';
import { defineConfig, type Connect, type ViteDevServer } from 'vite';
import react from '@vitejs/plugin-react';
import { SUPPORTED_LANGUAGES } from './src/i18n/languages';

const allowedHosts = (process.env.VITE_ALLOWED_HOSTS ?? '')
  .split(',')
  .map((host) => host.trim())
  .filter(Boolean);

const TOOL_IDS = new Set([
  'image-compressor', 'background-remover', 'image-upscaler', 'image-converter', 'ai-image-generator',
  'object-remover', 'watermark-remover', 'image-cropper', 'image-to-svg', 'image-ocr', 'photo-colorizer',
  'background-blur', 'passport-photo-maker', 'watermark-adder', 'meme-generator', 'collage-maker',
  'image-effects', 'exif-cleaner', 'svg-optimizer', 'mockup-generator', 'seed', 'pix',
]);
const READY_TOOL_IDS = new Set([...TOOL_IDS].filter((id) => id !== 'photo-colorizer'));

function localizedNotFoundMiddleware(): Connect.NextHandleFunction {
  return (req, res, next) => {
    const requestPath = new NodeURL(req.url ?? '/', 'http://localhost').pathname;
    if (requestPath.startsWith('/@') || requestPath.startsWith('/src/') || requestPath.startsWith('/api/')) return next();
    if (requestPath === '/' || requestPath === '/favicon.ico') return next();
    if (/\.[a-z0-9]+$/i.test(requestPath)) return next();

    const [language, toolId] = requestPath.split('/').filter(Boolean);
    if (!language || !toolId || requestPath.split('/').filter(Boolean).length !== 2) return next();

    if (!SUPPORTED_LANGUAGES.includes(language as (typeof SUPPORTED_LANGUAGES)[number]) || !READY_TOOL_IDS.has(toolId)) {
      res.statusCode = 404;
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      res.setHeader('Cache-Control', 'no-store');
      res.end(`<!doctype html><html lang="${SUPPORTED_LANGUAGES.includes(language as (typeof SUPPORTED_LANGUAGES)[number]) ? language : 'en'}"><head><meta name="robots" content="noindex, follow"><meta name="viewport" content="width=device-width,initial-scale=1"><title>FLIXO — Page not found</title></head><body><main data-testid="not-found-page"><h1>Page not found</h1><p>The requested language or tool page does not exist.</p></main></body></html>`);
      return;
    }

    next();
  };
}

function applyNotFound(server: ViteDevServer) {
  server.middlewares.use(localizedNotFoundMiddleware());
}

export default defineConfig({
  plugins: [{
    ...react(),
    configureServer: applyNotFound,
    configurePreviewServer: applyNotFound,
  }],
  resolve: {
    alias: {
      '@': fileURLToPath(new NodeURL('./src', import.meta.url)),
    },
  },
  server: {
    host: '0.0.0.0',
    port: 3000,
    strictPort: true,
    allowedHosts,
  },
});
