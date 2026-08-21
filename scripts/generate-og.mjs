import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const localeDir = path.join(root, 'src', 'i18n', 'locales');
const toolsSource = fs.readFileSync(path.join(root, 'src', 'config', 'tools.ts'), 'utf8');
const locales = ['en','zh','hi','es','fr','ar','bn','pt','ru','ur','id','de','ja','sw','mr','te','tr','ta','ko','vi'];
const outputRoot = path.join(root, 'public', 'og');
fs.mkdirSync(outputRoot, { recursive: true });

const tools = [...toolsSource.matchAll(/id:\s*'([^']+)'/g)].map((m) => m[1]);
const escapeXml = (value) => value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/\"/g, '&quot;').replace(/'/g, '&apos;');

function localeToolTitle(locale, toolId) {
  const file = fs.readFileSync(path.join(localeDir, `${locale}.ts`), 'utf8');
  const escaped = toolId.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const pattern = `['"]${escaped}['"]\\s*:\\s*\\{\\s*title:\s*['"]([^'"]+)['"]`;
  const match = file.match(new RegExp(pattern));
  return match?.[1] ?? toolId;
}

for (const locale of locales) {
  const dir = path.join(outputRoot, locale);
  fs.mkdirSync(dir, { recursive: true });
  for (const toolId of tools) {
    const title = localeToolTitle(locale, toolId);
    const direction = locale === 'ar' || locale === 'ur' ? 'rtl' : 'ltr';
    const anchor = direction === 'rtl' ? 1160 : 80;
    const textAnchor = direction === 'rtl' ? 'end' : 'start';
    const svg = `<?xml version="1.0" encoding="UTF-8"?>\n<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">\n  <defs>\n    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">\n      <stop offset="0%" stop-color="#071017"/>\n      <stop offset="100%" stop-color="#102330"/>\n    </linearGradient>\n  </defs>\n  <rect width="1200" height="630" fill="url(#bg)"/>\n  <circle cx="${direction === 'rtl' ? 1080 : 120}" cy="110" r="70" fill="#67e8f9" opacity="0.14"/>\n  <text x="${anchor}" y="110" text-anchor="${textAnchor}" fill="#67e8f9" font-family="system-ui, sans-serif" font-size="30" font-weight="800">FLIXO</text>\n  <text x="${anchor}" y="290" text-anchor="${textAnchor}" fill="#ffffff" font-family="system-ui, sans-serif" font-size="64" font-weight="900">${escapeXml(title)}</text>\n  <text x="${anchor}" y="355" text-anchor="${textAnchor}" fill="#9fb0be" font-family="system-ui, sans-serif" font-size="28">Browser-first image tools</text>\n</svg>\n`;
    fs.writeFileSync(path.join(dir, `${toolId}.svg`), svg);
  }
}

console.log(`Generated localized OG assets for ${locales.length} locales × ${tools.length} tools = ${locales.length * tools.length} files`);
