/* global console, process */

import { existsSync, readFileSync } from 'node:fs';

const requiredFields = ['title', 'description', 'intro', 'keywords', 'howTo', 'features', 'altText'];
const pilotLocales = ['en', 'ar'];
const pilotTools = ['image-compressor', 'background-remover'];

function fail(message) {
  console.error(`SEO manifest validation failed: ${message}`);
  process.exit(1);
}

for (const toolId of pilotTools) {
  const root = `src/tools/${toolId}`;
  const manifestPath = `${root}/manifest.ts`;
  const seoDir = `${root}/seo`;
  if (!existsSync(manifestPath)) fail(`missing ${toolId}/manifest.ts`);
  if (!existsSync(seoDir)) fail(`missing ${toolId}/seo directory`);

  const manifest = readFileSync(manifestPath, 'utf8');
  for (const token of [`toolId: '${toolId}'`, `slug: '${toolId}'`, "status: 'ready'", "seoStatus: 'pilot'"]) {
    if (!manifest.includes(token)) fail(`${toolId} manifest missing ${token}`);
  }

  for (const locale of pilotLocales) {
    const path = `${seoDir}/${locale}.ts`;
    if (!existsSync(path)) fail(`${toolId} is missing ${locale}.ts`);
    const source = readFileSync(path, 'utf8');
    for (const field of requiredFields) {
      if (!new RegExp(`\\b${field}\\s*:`).test(source)) fail(`${toolId}/${locale}.ts is missing field ${field}`);
    }
    if (!source.includes(`export const ${locale}`)) fail(`${toolId}/${locale}.ts must export ${locale}`);
    if (locale === 'ar' && (source.match(/[\u0600-\u06ff]/g) ?? []).length < 40) {
      fail(`${toolId}/ar.ts does not contain enough Arabic text for a localized SEO document`);
    }
  }

  for (const locale of pilotLocales) {
    if (!manifest.includes(`./seo/${locale}`)) fail(`${toolId} manifest must import ${locale} SEO module`);
  }
}

console.log(`SEO manifest validation passed: ${pilotTools.length} pilot tools have complete en/ar contracts.`);
