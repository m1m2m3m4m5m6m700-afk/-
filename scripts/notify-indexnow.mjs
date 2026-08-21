import fs from 'node:fs';
import path from 'node:path';

const siteUrl = (process.env.SITE_URL || '').replace(/\/$/, '');
const key = process.env.INDEXNOW_KEY?.trim();
const keyLocation = (process.env.INDEXNOW_KEY_LOCATION || (key ? `${siteUrl}/${key}.txt` : '')).trim();

if (!siteUrl || !key || !keyLocation) {
  console.log('IndexNow notification skipped: SITE_URL, INDEXNOW_KEY and INDEXNOW_KEY_LOCATION are required.');
  process.exit(0);
}

const toolsSource = fs.readFileSync(path.join(process.cwd(), 'src', 'config', 'tools.ts'), 'utf8');
const locales = ['en','zh','hi','es','fr','ar','bn','pt','ru','ur','id','de','ja','sw','mr','te','tr','ta','ko','vi'];
const tools = [...toolsSource.matchAll(/path:\s*'([^']+)'/g)].map((m) => m[1]);
const urls = [];
for (const locale of locales) {
  urls.push(`${siteUrl}/${locale}`);
  for (const toolPath of tools) urls.push(`${siteUrl}/${locale}/${toolPath.replace(/^\//, '').replace(/^[a-z]{2}\//, '')}`);
}

const response = await fetch('https://api.indexnow.org/indexnow', {
  method: 'POST',
  headers: { 'content-type': 'application/json; charset=utf-8' },
  body: JSON.stringify({ host: new URL(siteUrl).host, key, keyLocation, urlList: urls }),
});

if (!response.ok) {
  const body = await response.text();
  console.error(`IndexNow notification failed: HTTP ${response.status} ${body}`);
  process.exit(1);
}

console.log(`IndexNow notified ${urls.length} URLs for ${new URL(siteUrl).host}.`);
