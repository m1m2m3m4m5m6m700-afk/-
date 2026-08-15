import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const localesDir = path.join(root, "src/lib/i18n/locales");
const reportDir = path.join(root, "reports");
const reportPath = path.join(reportDir, "localization-agent-report.json");
const instructionPath = path.join(reportDir, "LOCALIZATION_AGENT_TASK.md");

const LOCALES = [
  "ar", "es", "zh-CN", "hi", "pt", "fr", "de", "ja", "ko", "tr",
  "it", "ru", "vi", "id", "th", "pl", "nl", "sv", "uk", "ro", "he", "fa", "bn", "ms", "cs", "el",
];

function parseEntries(source) {
  const entries = {};
  const re = /"((?:[^"\\]|\\.)+)"\s*:\s*(?:"((?:[^"\\]|\\.)*)"|`([\\s\\S]*?)`)/g;
  let match;
  while ((match = re.exec(source))) entries[match[1]] = match[2] ?? match[3] ?? "";
  return entries;
}

function loadDictionary(locale) {
  const file = path.join(localesDir, `${locale}.ts`);
  if (!fs.existsSync(file)) throw new Error(`Missing locale file: ${locale}.ts`);
  return parseEntries(fs.readFileSync(file, "utf8"));
}

const en = loadDictionary("en");
const toolNameKeys = Object.keys(en).filter((key) => key.startsWith("tool.") && key.endsWith(".name"));
const issues = [];
const byLocale = {};

for (const locale of LOCALES) {
  const dict = loadDictionary(locale);
  const missingNames = [];
  const englishFallbackNames = [];
  const emptyNames = [];

  for (const key of toolNameKeys) {
    const value = dict[key];
    if (value === undefined) {
      missingNames.push(key);
      continue;
    }
    if (!String(value).trim()) emptyNames.push(key);
    if (value === en[key] && value.trim()) englishFallbackNames.push(key);
  }

  byLocale[locale] = {
    toolNameKeys: toolNameKeys.length,
    missingNames,
    emptyNames,
    englishFallbackNames,
    complete: missingNames.length === 0 && emptyNames.length === 0 && englishFallbackNames.length === 0,
  };

  for (const key of missingNames) issues.push({ locale, key, kind: "missing-name", source: en[key] });
  for (const key of emptyNames) issues.push({ locale, key, kind: "empty-name", source: en[key] });
  for (const key of englishFallbackNames) issues.push({ locale, key, kind: "english-name-fallback", source: en[key] });
}

const report = {
  generatedAt: new Date().toISOString(),
  sourceLocale: "en",
  checked: "tool names only",
  toolNameKeyCount: toolNameKeys.length,
  locales: byLocale,
  missingNameCount: issues.filter((i) => i.kind === "missing-name").length,
  englishNameFallbackCount: issues.filter((i) => i.kind === "english-name-fallback").length,
  emptyNameCount: issues.filter((i) => i.kind === "empty-name").length,
  completeLocales: LOCALES.filter((l) => byLocale[l].complete),
  incompleteLocales: LOCALES.filter((l) => !byLocale[l].complete),
  ok: issues.length === 0,
};

fs.mkdirSync(reportDir, { recursive: true });
fs.writeFileSync(reportPath, JSON.stringify({ ...report, issues }, null, 2) + "\n", "utf8");

const grouped = new Map();
for (const issue of issues) {
  const list = grouped.get(issue.locale) ?? [];
  list.push(issue);
  grouped.set(issue.locale, list);
}

const lines = [
  "# مهمة وكيل Flixo — استكمال أسماء الأدوات",
  "",
  "يُنشأ هذا الملف تلقائيًا عندما لا يتوفر اسم أداة باللغة المختارة.",
  "",
  "## قاعدة التنفيذ",
  "لا تستخدم الاسم الإنجليزي كبديل. أضف الاسم إلى قاموس اللغة نفسها، ثم اختر المصطلح الطبيعي المستخدم فعليًا في تلك اللغة.",
  "بعد الإضافة أعد تشغيل validator حتى تختفي المهمة.",
  "",
];

if (!issues.length) {
  lines.push("✅ كل أسماء الأدوات موجودة في القواميس ولا يوجد اسم إنجليزي متسرب.");
} else {
  for (const locale of LOCALES) {
    const list = grouped.get(locale);
    if (!list?.length) continue;
    lines.push(`## ${locale}`);
    for (const issue of list) {
      lines.push(`- [${issue.kind}] ${issue.key} — الاسم المصدر: ${issue.source}`);
    }
    lines.push("");
  }
}

fs.writeFileSync(instructionPath, lines.join("\n") + "\n", "utf8");

console.log(`Localization agent report: ${reportPath}`);
console.log(`Agent instructions: ${instructionPath}`);
console.log(`Missing names: ${report.missingNameCount}; English fallbacks: ${report.englishNameFallbackCount}; Empty names: ${report.emptyNameCount}`);

if (issues.length) process.exit(1);
