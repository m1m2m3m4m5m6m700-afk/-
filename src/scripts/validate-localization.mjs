/**
 * Localization coverage + staleness validator.
 *
 * Validates the REAL READY tool localization set against the English master
 * dictionary (the single source of truth) and every locale dictionary. It does
 * NOT trust registry totals — it derives the production target from the REAL
 * READY tool list (status === "ready") in src/data/tools.ts.
 *
 * Detects, per locale, for every real ready tool:
 *   - missing English master keys
 *   - missing locale keys (locale falls back to English → untranslated)
 *   - empty translations
 *   - duplicate keys within a locale file
 *   - untranslated values (locale value identical to the English value)
 *   - broken interpolation placeholders ({var} mismatch vs English)
 *   - changed English source → stale locale translations (hash-based baseline)
 *   - new English keys not present in the baseline
 *
 * Stale / new-key detection uses a committed baseline
 * (src/lib/i18n/translation-source-baseline.json) mapping each English source
 * key to a hash of its current value. When English changes, the recomputed
 * hash no longer matches the baseline and every locale translation for that
 * key is reported as STALE. New keys absent from the baseline are reported as
 * NEW KEY. Run with `--update-baseline` to refresh the baseline after an
 * intentional English change (this does NOT touch any locale translation).
 *
 * Glossary terminology consistency is reported as an advisory (warning), never
 * an error, and never auto-edits human translations — it only flags when a tool
 * name's expected concept term is absent from the localized name.
 *
 * Exit code is non-zero if any ERROR is found; advisory warnings never fail
 * the build.
 */
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

const root = process.cwd();
const updateBaseline = process.argv.includes("--update-baseline");

// ---------------------------------------------------------------------------
// Locale inventory — mirrors src/lib/i18n/index.tsx LOCALES (single source of
// truth). Hard-coded here because this script runs in plain Node (no TS loader
// for index.tsx); it is kept in sync manually. en is the master.
// ---------------------------------------------------------------------------
const PRODUCTION_LOCALES = [
  "ar",
  "es",
  "zh-CN",
  "hi",
  "pt",
  "fr",
  "de",
  "ja",
  "ko",
  "tr",
  "it",
  "ru",
  "vi",
  "id",
  "th",
  "pl",
  "nl",
  "sv",
  "uk",
  "ro",
  "he",
  "fa",
  "bn",
  "ms",
];
const EXTRA_LOCALES = ["cs", "el"]; // functional but beyond the 25 production target
const NON_EN_LOCALES = [...PRODUCTION_LOCALES, ...EXTRA_LOCALES];
const ALL_LOCALES = ["en", ...NON_EN_LOCALES];

const BASELINE_PATH = path.join(root, "src/lib/i18n/translation-source-baseline.json");

// ---------------------------------------------------------------------------
// Load REAL READY tools from tools.ts (reuses the registry loader pattern so
// the target set is the authoritative ready list, never the registry total).
// ---------------------------------------------------------------------------
function loadReadyToolSlugs() {
  const toolsSource = fs.readFileSync(path.join(root, "src/data/tools.ts"), "utf8");
  const start = toolsSource.indexOf("export const tools: Tool[] = [");
  const afterStart = toolsSource.slice(start + "export const tools: Tool[] = [".length);
  const end = afterStart.indexOf("];\n\nexport const toolById");
  if (start === -1 || end === -1) {
    throw new Error("Could not locate the tools[] array in src/data/tools.ts.");
  }
  const body = afterStart
    .slice(0, end)
    .replace(/\.\.\.chromeTools,/g, "")
    .replace(/\.\.\.([A-Za-z0-9_]+),/g, "");
  const t = (id, name, categoryId, description, status = "placeholder", tags, slug) => ({
    id,
    name,
    categoryId,
    description,
    status,
    tags,
    slug,
  });
  const tools = Function("t", `return [${body}];`)(t);
  const ready = tools.filter((tool) => tool.status === "ready" && tool.slug);
  const slugs = ready.map((tool) => tool.slug);
  const dups = slugs.filter((s, i) => slugs.indexOf(s) !== i);
  if (dups.length) throw new Error(`Duplicate ready slugs: ${dups.join(", ")}`);
  return { slugs, ready };
}

// ---------------------------------------------------------------------------
// Parse a locale dictionary source file into { key: value } for the explicit
// entries it declares (overrides). Locale files spread `...en` then list their
// own keys, so only explicitly-declared keys count as "translated"; a missing
// key means the locale falls back to English (→ untranslated).
// ---------------------------------------------------------------------------
function parseDictionaryEntries(source) {
  const entries = {};
  const seen = [];
  const keyRe =
    /"((?:[^"\\]|\\.)+)"\s*:\s*(?:"((?:[^"\\]|\\.)*)"\s*,?|[\s\S]*?"((?:[^"\\]|\\.)*)"\s*,?)/g;
  let m;
  while ((m = keyRe.exec(source)) !== null) {
    const key = m[1];
    const value = m[2] !== undefined ? m[2] : m[3];
    if (value === undefined) continue;
    if (Object.prototype.hasOwnProperty.call(entries, key)) seen.push(key);
    entries[key] = value.replace(/\\"/g, '"').replace(/\\n/g, "\n");
  }
  return { entries, duplicates: seen };
}

function loadLocaleDict(locale) {
  const file = path.join(root, "src/lib/i18n/locales", `${locale}.ts`);
  const source = fs.readFileSync(file, "utf8");
  const { entries, duplicates } = parseDictionaryEntries(source);
  return { entries, duplicates, source };
}

// ---------------------------------------------------------------------------
// Hash a source string for staleness baseline comparison.
// ---------------------------------------------------------------------------
function hashValue(value) {
  return crypto.createHash("sha256").update(value, "utf8").digest("hex").slice(0, 16);
}

// Extract {name} placeholders from a string.
function placeholders(value) {
  const set = new Set();
  const re = /\{(\w+)\}/g;
  let m;
  while ((m = re.exec(value)) !== null) set.add(m[1]);
  return set;
}

// ---------------------------------------------------------------------------
// Glossary terminology consistency (advisory). Re-implemented locally so this
// script has no TS import dependency; it mirrors src/lib/i18n/glossary.ts.
// ---------------------------------------------------------------------------
const GLOSSARY_FILE = path.join(root, "src/lib/i18n/glossary.ts");

function loadGlossaryConceptForSlug(slug) {
  // Mirrors `conceptForSlug` in src/lib/i18n/glossary.ts (the single source of
  // truth). Kept in sync manually because this .mjs script cannot import TS.
  const conceptBySuffix = {
    compressor: "compress",
    converter: "converter",
    generator: "generator",
    formatter: "formatter",
    viewer: "viewer",
    reader: "reader",
    checker: "checker",
    parser: "parser",
    tester: "tester",
    minifier: "minifier",
    calculator: "calculator",
    counter: "counter",
  };
  for (const [suffix, concept] of Object.entries(conceptBySuffix)) {
    if (slug.endsWith(suffix)) return concept;
  }
  return null;
}

function parseGlossary() {
  const src = fs.readFileSync(GLOSSARY_FILE, "utf8");
  const blockStart = src.indexOf("const GLOSSARY:");
  const blockSrc = src.slice(blockStart);
  const glossary = {};
  let i = blockStart >= 0 ? 0 : -1;
  if (i === -1) return glossary;
  const localeRe = /\n\s{2}("?[a-zA-Z-]+"?)\s*:\s*\{([\s\S]*?)\n\s{2}\},/g;
  let m;
  while ((m = localeRe.exec(blockSrc)) !== null) {
    const loc = m[1].replace(/"/g, "");
    const body = m[2];
    const termRe = /(\w+)\s*:\s*"((?:[^"\\]|\\.)*)"/g;
    let tm;
    const concepts = {};
    while ((tm = termRe.exec(body)) !== null) concepts[tm[1]] = tm[2];
    glossary[loc] = concepts;
  }
  return glossary;
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------
function main() {
  const { slugs, ready } = loadReadyToolSlugs();
  const enDict = loadLocaleDict("en").entries;

  const toolKeys = [];
  for (const slug of slugs) {
    toolKeys.push(`${slug}::name`, `${slug}::tagline`);
  }
  const keyFor = (slug, field) => `tool.${slug}.${field}`;
  const masterKeys = [];
  for (const slug of slugs) {
    masterKeys.push(keyFor(slug, "name"), keyFor(slug, "tagline"));
  }

  const errors = [];
  const warnings = [];
  const stale = [];

  // 1) English master must define every ready-tool name+tagline.
  for (const slug of slugs) {
    for (const field of ["name", "tagline"]) {
      const k = keyFor(slug, field);
      if (!enDict[k]) errors.push(`[en] missing master key: ${k}`);
      else if (!enDict[k].trim()) errors.push(`[en] empty master value: ${k}`);
    }
  }

  // 2) Baseline load / compute current English hashes.
  let baseline = {};
  if (fs.existsSync(BASELINE_PATH)) {
    try {
      baseline = JSON.parse(fs.readFileSync(BASELINE_PATH, "utf8"));
    } catch {
      baseline = {};
    }
  }
  const currentHashes = {};
  for (const k of masterKeys) {
    if (enDict[k] !== undefined) currentHashes[k] = hashValue(enDict[k]);
  }
  const newKeys = [];
  const changedKeys = [];
  for (const k of masterKeys) {
    if (!baseline[k]) newKeys.push(k);
    else if (baseline[k] !== currentHashes[k]) changedKeys.push(k);
  }

  if (updateBaseline) {
    fs.writeFileSync(BASELINE_PATH, JSON.stringify(currentHashes, null, 2) + "\n", "utf8");
    console.log(
      `Baseline updated: ${Object.keys(currentHashes).length} keys → ${path.relative(root, BASELINE_PATH)}`,
    );
    console.log(
      "(Locale translations were NOT modified. Re-run without --update-baseline to validate.)",
    );
    return;
  }

  // 3) Per-locale coverage + quality checks.
  const glossary = parseGlossary();
  const coverage = {};
  for (const locale of NON_EN_LOCALES) {
    const { entries, duplicates } = loadLocaleDict(locale);
    coverage[locale] = {
      name: 0,
      tagline: 0,
      missing: [],
      empty: [],
      untranslated: [],
      dup: [],
      broken: [],
      glossaryWarn: [],
    };
    coverage[locale].duplicates = duplicates;

    for (const slug of slugs) {
      for (const field of ["name", "tagline"]) {
        const k = keyFor(slug, field);
        const enVal = enDict[k];
        const val = entries[k];
        if (val === undefined) {
          coverage[locale].missing.push(k);
          continue;
        }
        coverage[locale][field]++;
        if (!val.trim()) coverage[locale].empty.push(k);
        else if (val === enVal) coverage[locale].untranslated.push(k);
        // placeholder mismatch
        const enVars = placeholders(enVal);
        const locVars = placeholders(val);
        if (enVars.size && ![...enVars].every((v) => locVars.has(v))) {
          coverage[locale].broken.push(`${k} (expected {${[...enVars].join("},{")}})`);
        }
      }
      // glossary advisory on the name only — terminology consistency hint,
      // never an error and never auto-edits the translation (per the glossary
      // rule that native wording stays the priority). We only flag when a tool
      // name that should carry a concept noun uses a completely different term.
      const nameKey = keyFor(slug, "name");
      const locName = entries[nameKey];
      const concept = loadGlossaryConceptForSlug(slug);
      if (locName && concept && glossary[locale] && glossary[locale][concept]) {
        const term = glossary[locale][concept];
        if (term && !locName.includes(term)) {
          coverage[locale].glossaryWarn.push(slug);
        }
      }
    }
    // duplicate keys within file
    if (duplicates.length) {
      const toolDups = duplicates.filter((k) => k.startsWith("tool."));
      if (toolDups.length) errors.push(`[${locale}] duplicate tool keys: ${toolDups.join(", ")}`);
    }
    if (coverage[locale].missing.length)
      errors.push(
        `[${locale}] missing ${coverage[locale].missing.length} ready-tool keys: ${coverage[locale].missing.slice(0, 5).join(", ")}${coverage[locale].missing.length > 5 ? " …" : ""}`,
      );
    if (coverage[locale].empty.length)
      errors.push(`[${locale}] empty translations: ${coverage[locale].empty.join(", ")}`);
    if (coverage[locale].untranslated.length)
      warnings.push(
        `[${locale}] ${coverage[locale].untranslated.length} value(s) identical to English (review): ${coverage[locale].untranslated.slice(0, 3).join(", ")}${coverage[locale].untranslated.length > 3 ? " …" : ""}`,
      );
    if (coverage[locale].broken.length)
      errors.push(`[${locale}] broken interpolation: ${coverage[locale].broken.join(", ")}`);
    if (coverage[locale].glossaryWarn.length)
      warnings.push(
        `[${locale}] glossary advisory: ${coverage[locale].glossaryWarn.length} tool name(s) not using canonical concept term (review)`,
      );
  }

  // 4) Stale / new-key reporting.
  if (newKeys.length) {
    warnings.push(
      `NEW ENGLISH KEYS (${newKeys.length}) not in baseline — translations need to be added then run with --update-baseline:`,
    );
    warnings.push(`  ${newKeys.slice(0, 8).join(", ")}${newKeys.length > 8 ? " …" : ""}`);
  }
  if (changedKeys.length) {
    stale.push(
      `CHANGED ENGLISH SOURCE (${changedKeys.length} key(s)) — locale translations may be STALE:`,
    );
    for (const k of changedKeys.slice(0, 12)) {
      const affectedLocales = NON_EN_LOCALES.length;
      stale.push(
        `  ${k} → affects ${affectedLocales} locale translations (re-translate + review, then --update-baseline)`,
      );
    }
    if (changedKeys.length > 12) stale.push(`  …and ${changedKeys.length - 12} more`);
  }

  // ---------------------------------------------------------------------------
  // Report
  // ---------------------------------------------------------------------------
  const readyCount = slugs.length;
  const prodCoverage = PRODUCTION_LOCALES.every(
    (l) =>
      coverage[l] &&
      coverage[l].missing.length === 0 &&
      coverage[l].name === readyCount &&
      coverage[l].tagline === readyCount,
  );
  const extraOk = EXTRA_LOCALES.every((l) => coverage[l] && coverage[l].missing.length === 0);

  console.log("=".repeat(72));
  console.log("LOCALIZATION VALIDATION");
  console.log("=".repeat(72));
  console.log(`Real ready tools: ${readyCount}`);
  console.log(
    `Production locales: ${PRODUCTION_LOCALES.length}  (extra functional: ${EXTRA_LOCALES.join(", ")})`,
  );
  console.log(`English master keys (name+tagline): ${masterKeys.length}`);
  console.log("");

  console.log("Coverage (name / tagline explicitly translated per locale):");
  for (const locale of NON_EN_LOCALES) {
    const c = coverage[locale];
    const tag = PRODUCTION_LOCALES.includes(locale) ? "" : " [extra]";
    const status = c.missing.length === 0 && c.empty.length === 0 ? "OK" : "MISSING";
    console.log(
      `  ${locale.padEnd(6)}: ${String(c.name).padStart(2)}/${readyCount} name, ${String(c.tagline).padStart(2)}/${readyCount} tagline  ${status}${tag}`,
    );
  }
  console.log("");

  if (errors.length) {
    console.log(`ERRORS (${errors.length}):`);
    for (const e of errors) console.log(`  ✖ ${e}`);
    console.log("");
  }
  if (warnings.length) {
    console.log(`Advisories / warnings (${warnings.length}):`);
    for (const w of warnings) console.log(`  • ${w}`);
    console.log("");
  }
  if (stale.length) {
    console.log("STALE-TRANSLATION DETECTION:");
    for (const s of stale) console.log(`  ⚠ ${s}`);
    console.log("");
  }

  const ok = errors.length === 0;
  console.log("-".repeat(72));
  console.log(`Production 25-locale coverage: ${prodCoverage ? "COMPLETE ✅" : "INCOMPLETE ✖"}`);
  console.log(`Extra locales (cs, el) coverage: ${extraOk ? "complete ✅" : "incomplete ✖"}`);
  console.log(`New English keys: ${newKeys.length}`);
  console.log(`Changed English sources (stale): ${changedKeys.length}`);
  console.log(
    `Baseline file: ${fs.existsSync(BASELINE_PATH) ? path.relative(root, BASELINE_PATH) : "(absent — run with --update-baseline to create)"}`,
  );
  console.log(`Result: ${ok ? "PASS ✅" : "FAIL ✖"}`);
  console.log("-".repeat(72));
  process.exit(ok ? 0 : 1);
}

main();
