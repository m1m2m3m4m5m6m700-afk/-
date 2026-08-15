import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const localeDir = path.join(root, "src/lib/i18n/locales");
const indexSource = fs.readFileSync(path.join(root, "src/lib/i18n/index.tsx"), "utf8");
const englishSource = fs.readFileSync(path.join(localeDir, "en.ts"), "utf8");

function extractLocales(source) {
  const match = source.match(/export type LocaleCode =([\s\S]*?);/);
  if (!match) throw new Error("LocaleCode union not found.");
  return [...match[1].matchAll(/"([A-Za-z0-9-]+)"/g)].map((m) => m[1]);
}

function parseEntries(source) {
  const entries = new Map();
  const re = /\n\s*"((?:[^"\\]|\\.)+)"\s*:\s*"((?:[^"\\]|\\.)*)"/g;
  for (const match of source.matchAll(re)) entries.set(match[1], match[2]);
  return entries;
}

function placeholders(value) {
  return [...value.matchAll(/\{(\w+)\}/g)].map((m) => m[1]).sort();
}

const locales = extractLocales(indexSource);
const en = parseEntries(englishSource);
const rows = [];

for (const locale of locales) {
  const source = locale === "en"
    ? englishSource
    : fs.readFileSync(path.join(localeDir, `${locale}.ts`), "utf8");
  const dict = parseEntries(source);
  const keys = [...en.keys()];
  const missing = locale === "en" ? 0 : keys.filter((key) => !dict.has(key)).length;
  const empty = keys.filter((key) => dict.has(key) && !dict.get(key).trim()).length;
  const identical = locale === "en"
    ? 0
    : keys.filter((key) => dict.has(key) && dict.get(key).trim() && dict.get(key) === en.get(key)).length;
  const broken = keys.filter((key) => {
    if (!dict.has(key)) return false;
    const expected = placeholders(en.get(key));
    const actual = placeholders(dict.get(key));
    return expected.join("|") !== actual.join("|");
  }).length;
  const translated = Math.max(0, keys.length - missing - empty);

  rows.push({ locale, keys: keys.length, translated, missing, empty, identical, broken });
}

const total = en.size;
console.log("Localization health report");
console.log(`English source keys: ${total}`);
console.log("");
console.log("locale   coverage  missing  empty  identical  placeholders");
console.log("-------  --------  -------  -----  ---------  ------------");

for (const row of rows) {
  const coverage = total === 0 ? 100 : (row.translated / total) * 100;
  console.log(
    `${row.locale.padEnd(7)} ${coverage.toFixed(1).padStart(7)}% ${String(row.missing).padStart(8)} ${String(row.empty).padStart(6)} ${String(row.identical).padStart(10)} ${String(row.broken).padStart(13)}`,
  );
}

const errors = rows.flatMap((row) => [
  row.missing ? `[${row.locale}] ${row.missing} missing` : null,
  row.empty ? `[${row.locale}] ${row.empty} empty` : null,
  row.broken ? `[${row.locale}] ${row.broken} placeholder mismatches` : null,
].filter(Boolean));

if (errors.length) {
  console.error("\nErrors:");
  for (const error of errors) console.error(`- ${error}`);
  process.exitCode = 1;
} else {
  console.log("\nNo missing, empty, or placeholder-broken dictionary entries detected.");
}
