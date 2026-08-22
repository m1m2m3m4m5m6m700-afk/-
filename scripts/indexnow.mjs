const siteUrl = process.env.VITE_SITE_URL?.trim();
const key = process.env.INDEXNOW_KEY?.trim();
if (!siteUrl || !key) {
  console.log('IndexNow skipped: VITE_SITE_URL and INDEXNOW_KEY are required.');
  process.exit(0);
}

const origin = new URL(siteUrl);
if (origin.protocol !== 'https:' || origin.hostname.endsWith('.vercel.app') || origin.hostname === 'localhost') {
  throw new Error('IndexNow requires the final HTTPS production domain.');
}

const paths = [
  '/', '/en/image-compressor', '/ar/image-compressor', '/en/background-remover', '/en/ai-image-generator',
  '/en/image-upscaler', '/en/image-converter', '/en/image-to-text', '/en/object-remover', '/en/crop-resize',
  '/en/watermark-remover', '/en/raster-to-svg', '/en/image-cropper', '/en/image-ocr', '/en/background-blur',
  '/en/passport-photo-maker', '/en/watermark-adder', '/en/meme-generator', '/en/collage-maker', '/en/image-effects',
  '/en/exif-cleaner', '/en/svg-optimizer', '/en/mockup-generator', '/en/image-to-svg', '/en/seed', '/en/pix',
];

const body = JSON.stringify({
  host: origin.host,
  key,
  keyLocation: `${origin.origin}/${key}.txt`,
  urlList: paths.map((path) => new URL(path, origin).href),
});

const response = await fetch('https://api.indexnow.org/indexnow', {
  method: 'POST',
  headers: { 'content-type': 'application/json; charset=utf-8' },
  body,
});

if (!response.ok) throw new Error(`IndexNow request failed: ${response.status} ${await response.text()}`);
console.log(`IndexNow notified ${paths.length} URLs.`);
