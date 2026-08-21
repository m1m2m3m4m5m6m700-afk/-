/**
 * Versioned English-source tracking for localized tool content.
 *
 * English tool content is canonical. Every locale override is a derivative of
 * that source. The committed state file records the English source fingerprint
 * that was last approved for each locale/tool pair.
 *
 * Normal mode:
 *   - blocks new overrides for unsupported/non-ready tools
 *   - blocks when an approved source fingerprint is stale
 *   - warns for existing unapproved translations and known obsolete overrides
 *
 * Approval mode:
 *   node src/scripts/validate-tool-content-localization.mjs --update-state
 *
 * Approval changes metadata only; it never edits translations.
 */
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

const root = process.cwd();
const updateState = process.argv.includes("--update-state");
const canonicalToolsPath = path.join(root, "src/lib/tool-platform/publicDesktopTools.ts");
const contentPath = path.join(root, "src/data/toolContent.ts");
const localesPath = path.join(root, "src/lib/i18n/index.tsx");
const overridesPath = path.join(root, "src/data/toolContentLocales.ts");
const statePath = path.join(root, "src/data/tool-content-localization-state.json");

// Historical overrides for tools intentionally removed from the public registry.
// They remain advisory until their content files are cleaned up, but new obsolete
// overrides are still blocking so this debt cannot grow.
const baselineObsoleteOverrides = new Set([
  "ar/password-generator",
  "ar/background-remover",
  "es/password-generator",
  "es/background-remover",
  "fr/password-generator",
  "fr/background-remover",
  "de/password-generator",
  "de/background-remover",
  "pt/password-generator",
  "pt/background-remover",
  "ja/password-generator",
  "ja/background-remover",
]);

function read(file) {
  return fs.readFileSync(file, "utf8");
}

function hash(value) {
  return crypto.createHash("sha256").update(value.replace(/\r\n/g, "\n"), "utf8").digest("hex").slice(0, 16);
}

function loadReadySlugs() {
  const source = read(canonicalToolsPath);
  const slugs = new Set();
  const manifestRe = /\bid:\s*"([^"]+)"[\s\S]*?\bslug:\s*"([^"]+)"[\s\S]*?\blifecycle:\s*"public"/g;
  let match;
  while ((match = manifestRe.exec(source)) !== null) slugs.add(match[2]);
  if (!slugs.size) throw new Error("Could not locate canonical public tool registrations.");
  return slugs;
}

function loadLocales() {
  const source = read(localesPath);
  const codes = new Set();
  const codeRe = /\{\s*code:\s*"([A-Za-z-]+)"/g;
  let match;
  while ((match = codeRe.exec(source)) !== null) codes.add(match[1]);
  if (!codes.size) throw new Error("Could not read LOCALES from i18n registry.");
  return codes;
}

function extractEnglishSourceBlocks() {
  const source = read(contentPath);
  const headerRe = /^  "([^"]+)": \{$/gm;
  const matches = [...source.matchAll(headerRe)];
  const blocks = new Map();

  for (let i = 0; i < matches.length; i += 1) {
    const match = matches[i];
    const slug = match[1];
    const start = match.index;
    const end = i + 1 < matches.length ? matches[i + 1].index : source.indexOf("\n};", start);
    const block = source.slice(start, end >= 0 ? end : source.length);
    blocks.set(slug, block);
  }
  return blocks;
}

function extractLocaleOverrides() {
  const source = read(overridesPath);
  const locales = new Map();
  const localeRe = /^  ([A-Za-z-]+): \{$/gm;
  const localeMatches = [...source.matchAll(localeRe)];

  for (let i = 0; i < localeMatches.length; i += 1) {
    const locale = localeMatches[i][1];
    const start = localeMatches[i].index;
    const end = i + 1 < localeMatches.length ? localeMatches[i + 1].index : source.indexOf("\n};", start);
    const body = source.slice(start, end >= 0 ? end : source.length);
    const slugRe = /^    "([^"]+)": \{$/gm;
    const entries = new Set();
    for (const match of body.matchAll(slugRe)) entries.add(match[1]);
    locales.set(locale, entries);
  }
  return locales;
}

function loadState() {
  if (!fs.existsSync(statePath)) return { version: 1, entries: {} };
  const parsed = JSON.parse(read(statePath));
  return parsed && parsed.version === 1 && parsed.entries ? parsed : { version: 1, entries: {} };
}

function saveState(state) {
  fs.writeFileSync(statePath, JSON.stringify(state, null, 2) + "\n", "utf8");
}

function main() {
  const readySlugs = loadReadySlugs();
  const supportedLocales = loadLocales();
  const sourceBlocks = extractEnglishSourceBlocks();
  const overrides = extractLocaleOverrides();
  const state = loadState();

  const errors = [];
  const warnings = [];
  const nextEntries = {};
  let overrideCount = 0;
  let untrackedCount = 0;
  let staleCount = 0;
  let obsoleteBaselineCount = 0;

  for (const [locale, slugs] of overrides) {
    if (locale === "en") {
      errors.push("English must remain canonical; do not add an English override locale.");
      continue;
    }
    if (!supportedLocales.has(locale)) {
      errors.push(`[${locale}] locale is not registered in i18n.`);
      continue;
    }

    nextEntries[locale] = {};
    for (const slug of slugs) {
      overrideCount += 1;
      const key = `${locale}/${slug}`;
      if (!readySlugs.has(slug)) {
        if (baselineObsoleteOverrides.has(key)) {
          obsoleteBaselineCount += 1;
          warnings.push(`[${key}] historical override targets a non-ready tool; cleanup is advisory.`);
        } else {
          errors.push(`[${key}] localized content exists for a non-ready tool.`);
        }
        continue;
      }
      const sourceBlock = sourceBlocks.get(slug);
      if (!sourceBlock) {
        errors.push(`[${key}] English canonical content block is missing.`);
        continue;
      }

      const currentHash = hash(sourceBlock);
      const approvedHash = state.entries?.[locale]?.[slug];
      nextEntries[locale][slug] = currentHash;

      if (!approvedHash) {
        untrackedCount += 1;
        warnings.push(`[${key}] existing translation has no approved English source revision.`);
      } else if (approvedHash !== currentHash) {
        staleCount += 1;
        errors.push(
          `[${key}] translation is stale: approved source ${approvedHash}, current source ${currentHash}.`,
        );
      }
    }
  }

  if (updateState) {
    saveState({ version: 1, entries: nextEntries });
    console.log(`CONTENT LOCALIZATION STATE UPDATED: ${overrideCount} locale/tool overrides recorded.`);
    console.log("Translations were not modified.");
    return;
  }

  console.log("CONTENT LOCALIZATION VALIDATION");
  console.log(`Ready English tools: ${readySlugs.size}`);
  console.log(`Localized tool overrides: ${overrideCount}`);
  console.log(`Untracked overrides: ${untrackedCount}`);
  console.log(`Stale overrides: ${staleCount}`);
  console.log(`Historical obsolete overrides: ${obsoleteBaselineCount}`);

  if (warnings.length) {
    console.log("WARNINGS:");
    for (const warning of warnings.slice(0, 20)) console.log(`- ${warning}`);
    if (warnings.length > 20) console.log(`- …and ${warnings.length - 20} more warnings`);
  }

  if (errors.length) {
    console.error("RESULT: FAIL");
    for (const error of errors.slice(0, 20)) console.error(`- ${error}`);
    if (errors.length > 20) console.error(`- …and ${errors.length - 20} more errors`);
    process.exit(1);
  }

  console.log("RESULT: PASS");
}

main();
