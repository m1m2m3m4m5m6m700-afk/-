import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const languages = ['en','zh','hi','es','fr','ar','bn','pt','ru','ur','id','de','ja','sw','mr','te','tr','ta','ko','vi'];
const tools = [
  'image-compressor','background-remover','image-upscaler','image-converter','ai-image-generator',
  'object-remover','watermark-remover','image-cropper','image-to-svg','image-ocr','photo-colorizer',
  'background-blur','passport-photo-maker','watermark-adder','meme-generator','collage-maker',
  'image-effects','exif-cleaner','svg-optimizer','mockup-generator','seed','pix',
];
const rtl = new Set(['ar', 'ur']);
const root = process.cwd();
const localeDir = join(root, 'src', 'i18n', 'locales');
const config = readFileSync(join(root, 'src', 'config', 'i18n.ts'), 'utf8');
const seo = readFileSync(join(root, 'src', 'seo', 'localized-seo.ts'), 'utf8');
const route = readFileSync(join(root, 'src', 'routes', '$lang', '$tool.tsx'), 'utf8');

if (languages.length !== 20) throw new Error(`Expected 20 languages, found ${languages.length}`);
if (tools.length !== 22) throw new Error(`Expected 22 tools, found ${tools.length}`);
if (languages.length * tools.length !== 440) throw new Error('Matrix size is not 440');

for (const lang of languages) {
  const file = join(localeDir, `${lang}.ts`);
  if (!existsSync(file)) throw new Error(`Missing locale file: ${file}`);
  const text = readFileSync(file, 'utf8');
  if (!new RegExp(`code\\s*:\\s*['\"]${lang}['\"]`).test(text)) throw new Error(`Locale ${lang} does not declare its code`);
}

for (const tool of tools) {
  if (!new RegExp(`['\"]${tool}['\"]`).test(config)) throw new Error(`Tool ${tool} is missing from the registry`);
}

if (!seo.includes("hreflang: 'x-default'")) throw new Error('x-default hreflang is missing');
if (!seo.includes("'applicationCategory': 'MultimediaApplication'" ) && !seo.includes("applicationCategory: 'MultimediaApplication'")) {
  throw new Error('WebApplication schema category is missing');
}
if (!route.includes('buildHreflangLinks')) throw new Error('Localized tool route does not use hreflang builder');
if (!route.includes('buildWebApplicationJsonLd')) throw new Error('Localized tool route does not inject WebApplication JSON-LD');
if (!route.includes('getPrivacyMessage')) throw new Error('Localized privacy signal is missing');

for (const lang of languages) {
  const expectedDir = rtl.has(lang) ? 'rtl' : 'ltr';
  const configSlice = config.match(new RegExp(`code: '${lang}'[\\s\\S]{0,100}?dir: '(rtl|ltr)'`));
  if (!configSlice || configSlice[1] !== expectedDir) throw new Error(`Direction mismatch for ${lang}`);
}

console.log(`i18n matrix contract OK: ${languages.length} languages × ${tools.length} tools = ${languages.length * tools.length} routes`);
