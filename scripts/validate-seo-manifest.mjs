/* global console, process */

import { existsSync, readFileSync } from 'node:fs';

const root = 'src/tools/image-compressor';
const manifestPath = `${root}/manifest.ts`;
const seoDir = `${root}/seo`;
const requiredFields = ['title', 'description', 'intro', 'keywords', 'howTo', 'features', 'altText'];
const pilotLocales = ['en', 'ar'];

function fail(message) {
  console.error(`SEO manifest validation failed: ${message}`);
  process.exit(1);
}

if (!existsSync(manifestPath)) fail('missing image-compressor/manifest.ts');
if (!existsSync(seoDir)) fail('missing image-compressor/seo directory');

const manifest = readFileSync(manifestPath, 'utf8');
for (const token of ["toolId: 'image-compressor'", "slug: 'image-compressor'", "status: 'ready'", "seoStatus: 'pilot'"]) {
  if (!manifest.includes(token)) fail(`manifest missing ${token}`);
}

const fileLocales = pilotLocales.filter((locale) => existsSync(`${seoDir}/${locale}.ts`));
if (fileLocales.length !== pilotLocales.length) fail(`pilot must contain exactly ${pilotLocales.length} locale files: ${pilotLocales.join(', ')}`);

for (const locale of pilotLocales) {
  const path = `${seoDir}/${locale}.ts`;
  const source = readFileSync(path, 'utf8');
  for (const field of requiredFields) {
    if (!new RegExp(`\\b${field}\\s*:`).test(source)) fail(`${locale}.ts is missing field ${field}`);
  }
  if (!source.includes(`export const ${locale}`)) fail(`${locale}.ts must export ${locale}`);
  const localizedText = source.replace(/^[^'\"]*$/gm, '');
  if (locale === 'ar' && (localizedText.match(/[\u0600-\u06ff]/g) ?? []).length < 40) {
    fail('ar.ts does not contain enough Arabic text to be treated as a real localized SEO document');
  }
}

const seoFiles = readFileSync(manifestPath, 'utf8').match(/import \{ (en|ar) \} from '\.\/seo\/(en|ar)'/g) ?? [];
if (seoFiles.length !== 2) fail('manifest must import both en and ar SEO modules');

console.log('SEO manifest validation passed: image-compressor pilot has complete en/ar contracts.');
