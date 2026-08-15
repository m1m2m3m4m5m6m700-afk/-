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
const keys = [...en.keys()];
const rows = [];

for (const locale of locales) {
  const source = locale === "en"
    ? englishSource
    : fs.readFileSync(path.join(localeDir, `${locale}.ts`), "utf8");
  const explicit = locale === "en" ? new Map(en) : parseEntries(source);
  const resolved = new Map(en);
  for (const [key, value] of explicit) resolved.set(key, value);

  const explicitMissing = locale === "en" ? 0 : keys.filter((key) => !explicit.has(key)).length;
  const fallback = locale === "en" ? 0 : explicitMissing;
  const empty = keys.filter((key) => resolved.has(key) && !resolved.get(key).trim()).length;
  const identical = locale === "en"
    ? 0
    : keys.filter((key) => explicit.has(key) && explicit.get(key).trim() && explicit.get(key) === en.get(key)).length;
  const broken = keys.filter((key) => {
    if (!resolved.has(key)) return false;
    const expected = placeholders(en.get(key));
    const actual = placeholders(resolved.get(key));
    return expected.join("|") !== actual.join("|");
  }).length;

  const resolvedTranslated = Math.max(0, keys.length - empty);
  const explicitTranslated = locale === "en"
    ? keys.length
    : keys.length - explicitMissing - empty;

  rows.push({
    locale,
    keys: keys.length,
    explicitTranslated,
    resolvedTranslated,
    explicitMissing,
    fallback,
    empty,
    identical,
    broken,
  });
}

const total = en.size;
console.log("Localization health report");
console.log(`English source keys: ${total}`);
console.log("");
console.log("locale   explicit  resolved  missing  fallback  empty  identical  placeholders");
console.log("-------  --------  --------  -------  --------  -----  ---------  ------------");

for (const row of rows) {
  const explicitCoverage = total === 0 ? 100 : (row.explicitTranslated / total) * 100;
  const resolvedCoverage = total === 0 ? 100 : (row.resolvedTranslated / total) * 100;
  console.log(
    `${row.locale.padEnd(7)} ${(explicitCoverage.toFixed(1) + "%").padStart(8)} ${(resolvedCoverage.toFixed(1) + "%").padStart(9)} ${String(row.explicitMissing).padStart(8)} ${String(row.fallback).padStart(9)} ${String(row.empty).padStart(6)} ${String(row.identical).padStart(10)} ${String(row.broken).padStart(13)}`,
  );
}

const errors = rows.flatMap((row) => [
  row.empty ? `[${row.locale}] ${row.empty} resolved values empty` : null,
  row.broken ? `[${row.locale}] ${row.broken} placeholder mismatches` : null,
].filter(Boolean));

if (errors.length) {
  console.error("\nErrors:");
  for (const error of errors) console.error(`- ${error}`);
  process.exitCode = 1;
} else {
  console.log("\nResolved dictionary coverage is complete for all locales.");
  console.log("Explicit coverage below 100% means the locale intentionally inherits English via ...en.");
}
