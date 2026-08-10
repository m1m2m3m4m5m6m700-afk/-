// src/scripts/flixo-agent.mjs
/**
 * Flixo Agent — إدارة حالة الأدوات، التقارير، والفحص الصحي
 *
 * المهام:
 *   status     - عرض حالة الأدوات (placeholder | planned | ready)
 *   docs       - تحديث ملف PROJECT_STATUS.md
 *   health     - تشغيل الفحوصات (TypeScript، Lint، Build)
 *   report     - تقرير شامل (JSON)
 *
 * الاستخدام:
 *   node src/scripts/flixo-agent.mjs --task=status
 *   npm run agent:status
 */

import { execSync } from "child_process";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const REPO_ROOT = path.resolve(__dirname, "../..");

// ============================================================
// 1. قراءة البيانات من الملفات المصدر (canonical pattern)
// ============================================================

function loadTools() {
  const toolsPath = path.join(REPO_ROOT, "src/data/tools.ts");
  const source = fs.readFileSync(toolsPath, "utf-8");

  const start = source.indexOf("export const tools: Tool[] = [");
  const end = source.indexOf("];\n\nexport const toolById");
  if (start === -1 || end === -1) {
    throw new Error("❌ لم يتم العثور على مصفوفة الأدوات في tools.ts");
  }

  let body = source.slice(start + "export const tools: Tool[] = [".length, end);
  body = body.replace(/\.\.\.chromeTools,?\s*/g, "");

  const fn = new Function("t", `const tools = [${body}]; return tools;`);

  const t = (id, name, categoryId, description, status = "placeholder", tags, slug) => ({
    id,
    name,
    categoryId,
    description,
    status,
    tags,
    slug,
  });

  const result = fn(t);
  if (!Array.isArray(result)) {
    throw new Error("❌ فشل تحميل الأدوات: النتيجة ليست مصفوفة");
  }
  return result;
}

function loadCategories() {
  const categoriesPath = path.join(REPO_ROOT, "src/data/categories.ts");
  const source = fs.readFileSync(categoriesPath, "utf-8");

  // استخراج كل كائن Category. الحقل route اختياري (فقط translation له route)،
  // وtoolIds قد يكون مصفوفة [...] أو مرجع متغيّر (chromeToolIds).
  const results = [];
  const regex =
    /{\s*id:\s*['"]([^'"]+)['"],\s*name:\s*['"]([^'"]+)['"],\s*description:\s*['"]([^'"]+)['"],\s*icon:\s*[^,]+,\s*anchor:\s*['"]([^'"]+)['"],(?:\s*route:\s*['"]([^'"]+)['"],)?\s*order:\s*(\d+),\s*toolIds:\s*(\[([^\]]*)\]|([A-Za-z_][A-Za-z0-9_]*)),?\s*}/g;

  let match;
  while ((match = regex.exec(source)) !== null) {
    // match[6] = toolIds ككل، match[7] = محتوى المصفوفة (إن وُجد)، match[8] = اسم المتغيّر (إن وُجد)
    let toolIds;
    if (match[7] !== undefined) {
      toolIds = match[7]
        .replace(/[\[\]]/g, "")
        .split(",")
        .map((s) => s.trim().replace(/['"]/g, ""))
        .filter((id) => id && id !== "...chromeToolIds");
    } else {
      // مرجع متغيّر مثل chromeToolIds — لا يمكننا حلّه هنا، فنعتمد على عدّ الأدوات
      toolIds = [];
    }
    results.push({
      id: match[1],
      name: match[2],
      description: match[3],
      anchor: match[4],
      route: match[5] || null,
      order: parseInt(match[6], 10),
      toolIds,
    });
  }

  return results;
}

// ============================================================
// 2. الأدوات المساعدة
// ============================================================

function logInfo(msg) {
  console.log(`ℹ️ ${msg}`);
}
function logSuccess(msg) {
  console.log(`✅ ${msg}`);
}
function logWarn(msg) {
  console.warn(`⚠️ ${msg}`);
}
function logError(msg) {
  console.error(`❌ ${msg}`);
}
function logStep(msg) {
  console.log(`\n📌 ${msg}`);
}
function logSection(msg) {
  console.log(`\n${"=".repeat(50)}\n${msg}\n${"=".repeat(50)}`);
}

function ensureDir(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

// ============================================================
// 3. المهام
// ============================================================

function taskStatus() {
  logSection("📊 المهمة: عرض حالة الأدوات");

  const tools = loadTools();
  const categories = loadCategories();

  const statusCount = { placeholder: 0, planned: 0, ready: 0 };
  const byCategory = {};

  for (const tool of tools) {
    statusCount[tool.status] = (statusCount[tool.status] || 0) + 1;
    const catId = tool.categoryId || "unknown";
    if (!byCategory[catId]) byCategory[catId] = { placeholder: 0, planned: 0, ready: 0 };
    byCategory[catId][tool.status] = (byCategory[catId][tool.status] || 0) + 1;
  }

  const total = tools.length;
  const readyPercent = total > 0 ? Math.round((statusCount.ready / total) * 100) : 0;

  console.log(`\n📦 إجمالي الأدوات: ${total}`);
  console.log(`   ✅ جاهزة (ready): ${statusCount.ready}`);
  console.log(`   📋 مخططة (planned): ${statusCount.planned}`);
  console.log(`   ⏳ مؤقتة (placeholder): ${statusCount.placeholder}`);
  console.log(`   📈 نسبة الجاهزية: ${readyPercent}%`);
  console.log(`   📂 الفئات: ${categories.length}`);

  // تفاصيل الفئات
  console.log("\n📂 تفاصيل الفئات:");
  for (const cat of categories) {
    const stats = byCategory[cat.id] || { placeholder: 0, planned: 0, ready: 0 };
    const catTotal = stats.placeholder + stats.planned + stats.ready;
    console.log(`   - ${cat.name} (${cat.id}): ${catTotal} أداة (ready: ${stats.ready})`);
  }

  return {
    task: "status",
    total,
    byStatus: statusCount,
    byCategory,
    categories: categories.length,
    readyPercent,
  };
}

function taskDocs() {
  logSection("📝 المهمة: تحديث التوثيق");

  const tools = loadTools();
  const categories = loadCategories();

  const statusCount = { placeholder: 0, planned: 0, ready: 0 };
  for (const tool of tools) {
    statusCount[tool.status] = (statusCount[tool.status] || 0) + 1;
  }
  const total = tools.length;
  const readyPercent = total > 0 ? Math.round((statusCount.ready / total) * 100) : 0;

  const readyTools = tools
    .filter((t) => t.status === "ready")
    .map((t) => `- **${t.name}** (${t.categoryId})`)
    .join("\n");
  const plannedTools = tools
    .filter((t) => t.status === "planned")
    .map((t) => `- **${t.name}** (${t.categoryId})`)
    .join("\n");
  const placeholderTools = tools
    .filter((t) => t.status === "placeholder")
    .map((t) => `- **${t.name}** (${t.categoryId})`)
    .join("\n");

  const content = `# 📊 حالة مشروع Flixo


**آخر تحديث:** ${new Date().toISOString().split("T")[0]}


## 📦 ملخص الأدوات


| الحالة | العدد | النسبة |
|--------|-------|--------|
| ✅ جاهزة (ready) | ${statusCount.ready} | ${readyPercent}% |
| 📋 مخططة (planned) | ${statusCount.planned} | ${total > 0 ? Math.round((statusCount.planned / total) * 100) : 0}% |
| ⏳ مؤقتة (placeholder) | ${statusCount.placeholder} | ${total > 0 ? Math.round((statusCount.placeholder / total) * 100) : 0}% |
| **الإجمالي** | **${total}** | **100%** |


## 📂 الفئات المدعومة


${categories.map((c) => `- **${c.name}** (${c.id}): ${c.toolIds.length} أداة`).join("\n")}


## ✅ الأدوات الجاهزة (ready)


${readyTools || "لا توجد أدوات جاهزة"}


## 📋 الأدوات المخططة (planned)


${plannedTools || "لا توجد أدوات مخططة"}


## ⏳ الأدوات المؤقتة (placeholder)


${placeholderTools || "لا توجد أدوات مؤقتة"}


---
*تم إنشاء هذا التقرير بواسطة وكيل Flixo*
`;

  const outputPath = path.join(REPO_ROOT, "PROJECT_STATUS.md");
  ensureDir(path.dirname(outputPath));
  fs.writeFileSync(outputPath, content, "utf-8");
  logSuccess(`تم تحديث التوثيق في: ${outputPath}`);

  return { task: "docs", outputPath, total, byStatus: statusCount };
}

function taskHealth() {
  logSection("🩺 المهمة: الفحص الصحي");

  const checks = [
    { name: "TypeScript", cmd: "npx tsc --noEmit" },
    { name: "Lint", cmd: "npm run lint" },
    { name: "Build", cmd: "npm run build" },
  ];

  const results = {};
  let allPassed = true;

  for (const check of checks) {
    logInfo(`تشغيل فحص: ${check.name}`);
    try {
      execSync(check.cmd, { cwd: REPO_ROOT, stdio: "pipe", encoding: "utf-8" });
      results[check.name] = { passed: true };
      logSuccess(`✅ ${check.name} - ناجح`);
    } catch (error) {
      results[check.name] = {
        passed: false,
        output: error.stdout || error.stderr || String(error),
      };
      allPassed = false;
      logError(`❌ ${check.name} - فشل`);
    }
  }

  const passedCount = Object.values(results).filter((r) => r.passed).length;
  console.log(`\n📊 ملخص: ${passedCount}/${checks.length} فحص ناجح`);

  return {
    task: "health",
    allPassed,
    passedCount,
    totalChecks: checks.length,
    results,
  };
}

function taskReport() {
  logSection("📊 المهمة: تقرير شامل");

  const status = taskStatus();
  const health = taskHealth();

  const report = {
    task: "report",
    timestamp: new Date().toISOString(),
    status: status,
    health: health,
    summary: {
      totalTools: status.total,
      readyTools: status.byStatus.ready,
      plannedTools: status.byStatus.planned,
      placeholderTools: status.byStatus.placeholder,
      readyPercent: status.readyPercent,
      categories: status.categories,
      healthPassed: health.allPassed,
    },
  };

  const outputPath = path.join(REPO_ROOT, "reports", "full-report.json");
  ensureDir(path.dirname(outputPath));
  fs.writeFileSync(outputPath, JSON.stringify(report, null, 2), "utf-8");
  logSuccess(`تم إنشاء التقرير في: ${outputPath}`);

  console.log(`\n📊 ملخص التقرير:`);
  console.log(`   - إجمالي الأدوات: ${report.summary.totalTools}`);
  console.log(`   - جاهزة: ${report.summary.readyTools}`);
  console.log(`   - الفحوصات الصحية: ${report.summary.healthPassed ? "✅ ناجحة" : "⚠️ بعضها فشل"}`);

  return report;
}

// ============================================================
// 4. التشغيل
// ============================================================

const args = process.argv.slice(2);
const taskArg = args.find((arg) => arg.startsWith("--task="));
const taskName = taskArg ? taskArg.split("=")[1] : "status";

const taskMap = {
  status: taskStatus,
  docs: taskDocs,
  health: taskHealth,
  report: taskReport,
};

if (!taskMap[taskName]) {
  logError(`مهمة غير معروفة: ${taskName}`);
  console.log("\nالمهام المتاحة: status, docs, health, report");
  process.exit(1);
}

try {
  const result = taskMap[taskName]();
  console.log(`\n✅ اكتملت المهمة: ${taskName}`);
} catch (error) {
  logError(`فشل تنفيذ المهمة: ${error.message}`);
  process.exit(1);
}
