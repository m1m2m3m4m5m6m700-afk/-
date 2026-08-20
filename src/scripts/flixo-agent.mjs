// src/scripts/flixo-agent.mjs
/**
 * Flixo Agent — إدارة حالة الأدوات، التقارير، والفحص الصحي
 *
 * المهام:
 *   status       - عرض حالة الأدوات
 *   docs         - تحديث ملف PROJECT_STATUS.md
 *   health       - تشغيل الفحوصات الأساسية بالتوازي
 *   localization - قراءة تقرير نواقص الترجمة وإنتاج تعليمات الوكيل
 *   report       - تقرير شامل مع تشغيل الفحوصات المستقلة بالتوازي
 */
import { execFile } from "child_process";
import { promisify } from "util";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const execFileAsync = promisify(execFile);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const REPO_ROOT = path.resolve(__dirname, "../..");

async function runCommand(command, args = []) {
  return execFileAsync(command, args, {
    cwd: REPO_ROOT,
    encoding: "utf-8",
    maxBuffer: 16 * 1024 * 1024,
  });
}

function loadTools() {
  const toolsPath = path.join(REPO_ROOT, "src/data/tools.ts");
  const source = fs.readFileSync(toolsPath, "utf-8");
  const start = source.indexOf("export const tools: Tool[] = [");
  const end = source.indexOf("];\n\nexport const toolById");
  if (start === -1 || end === -1) throw new Error("❌ لم يتم العثور على مصفوفة الأدوات في tools.ts");
  let body = source.slice(start + "export const tools: Tool[] = [".length, end);
  body = body.replace(/\.\.\.chromeTools,?\s*/g, "");
  const fn = new Function("t", `const tools = [${body}]; return tools;`);
  const t = (id, name, categoryId, description, status = "placeholder", tags, slug) => ({ id, name, categoryId, description, status, tags, slug });
  const result = fn(t);
  if (!Array.isArray(result)) throw new Error("❌ فشل تحميل الأدوات: النتيجة ليست مصفوفة");
  return result;
}

function loadCategories() {
  const source = fs.readFileSync(path.join(REPO_ROOT, "src/data/categories.ts"), "utf-8");
  const results = [];
  const regex = /{\s*id:\s*['"]([^'"]+)['"],\s*name:\s*['"]([^'"]+)['"],\s*description:\s*['"]([^'"]+)['"],\s*icon:\s*[^,]+,\s*anchor:\s*['"]([^'"]+)['"],(?:\s*route:\s*['"]([^'"]+)['"],)?\s*order:\s*(\d+),\s*toolIds:\s*(\[([^\]]*)\]|([A-Za-z_][A-Za-z0-9_]*)),?\s*}/g;
  let match;
  while ((match = regex.exec(source)) !== null) {
    const toolIds = match[7] !== undefined
      ? match[7].replace(/[\[\]]/g, "").split(",").map((s) => s.trim().replace(/['"]/g, "")).filter(Boolean)
      : [];
    results.push({ id: match[1], name: match[2], description: match[3], anchor: match[4], route: match[5] || null, order: parseInt(match[6], 10), toolIds });
  }
  return results;
}

function logInfo(msg) { console.log(`ℹ️ ${msg}`); }
function logSuccess(msg) { console.log(`✅ ${msg}`); }
function logError(msg) { console.error(`❌ ${msg}`); }
function logSection(msg) { console.log(`\n${"=".repeat(50)}\n${msg}\n${"=".repeat(50)}`); }
function ensureDir(dirPath) { if (!fs.existsSync(dirPath)) fs.mkdirSync(dirPath, { recursive: true }); }

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
  console.log(`   ✅ جاهزة: ${statusCount.ready}`);
  console.log(`   📋 مخططة: ${statusCount.planned}`);
  console.log(`   ⏳ مؤقتة: ${statusCount.placeholder}`);
  console.log(`   📈 نسبة الجاهزية: ${readyPercent}%`);
  console.log(`   📂 الفئات: ${categories.length}`);
  return { task: "status", total, byStatus: statusCount, byCategory, categories: categories.length, readyPercent };
}

function taskDocs() {
  logSection("📝 المهمة: تحديث التوثيق");
  const tools = loadTools();
  const categories = loadCategories();
  const statusCount = { placeholder: 0, planned: 0, ready: 0 };
  for (const tool of tools) statusCount[tool.status] = (statusCount[tool.status] || 0) + 1;
  const total = tools.length;
  const readyPercent = total > 0 ? Math.round((statusCount.ready / total) * 100) : 0;
  const readyTools = tools.filter((t) => t.status === "ready").map((t) => `- **${t.name}** (${t.categoryId})`).join("\n");
  const plannedTools = tools.filter((t) => t.status === "planned").map((t) => `- **${t.name}** (${t.categoryId})`).join("\n");
  const placeholderTools = tools.filter((t) => t.status === "placeholder").map((t) => `- **${t.name}** (${t.categoryId})`).join("\n");
  const content = `# 📊 حالة مشروع Flixo\n\n**آخر تحديث:** ${new Date().toISOString().split("T")[0]}\n\n## 📦 ملخص الأدوات\n\n| الحالة | العدد | النسبة |\n|--------|-------|--------|\n| ✅ جاهزة | ${statusCount.ready} | ${readyPercent}% |\n| 📋 مخططة | ${statusCount.planned} | ${total > 0 ? Math.round((statusCount.planned / total) * 100) : 0}% |\n| ⏳ مؤقتة | ${statusCount.placeholder} | ${total > 0 ? Math.round((statusCount.placeholder / total) * 100) : 0}% |\n| **الإجمالي** | **${total}** | **100%** |\n\n## 📂 الفئات المدعومة\n\n${categories.map((c) => `- **${c.name}** (${c.id}): ${c.toolIds.length} أداة`).join("\n")}\n\n## ✅ الأدوات الجاهزة\n\n${readyTools || "لا توجد أدوات جاهزة"}\n\n## 📋 الأدوات المخططة\n\n${plannedTools || "لا توجد أدوات مخططة"}\n\n## ⏳ الأدوات المؤقتة\n\n${placeholderTools || "لا توجد أدوات مؤقتة"}\n`;
  const outputPath = path.join(REPO_ROOT, "PROJECT_STATUS.md");
  fs.writeFileSync(outputPath, content, "utf-8");
  logSuccess(`تم تحديث التوثيق في: ${outputPath}`);
  return { task: "docs", outputPath, total, byStatus: statusCount };
}

async function taskHealth() {
  logSection("🩺 المهمة: الفحص الصحي المتوازي");
  const checks = [
    { name: "Localization agent", command: "node", args: ["src/scripts/validate-localization-agent.mjs"] },
    { name: "TypeScript", command: "npm", args: ["run", "typecheck", "--silent"] },
    { name: "Lint", command: "npm", args: ["run", "lint", "--silent"] },
    { name: "Build", command: "npm", args: ["run", "build", "--silent"] },
  ];

  for (const check of checks) logInfo(`بدء فحص متوازٍ: ${check.name}`);

  const settled = await Promise.all(checks.map(async (check) => {
    try {
      await runCommand(check.command, check.args);
      logSuccess(`✅ ${check.name} - ناجح`);
      return [check.name, { passed: true }];
    } catch (error) {
      const output = error.stdout || error.stderr || String(error);
      logError(`❌ ${check.name} - فشل`);
      return [check.name, { passed: false, output }];
    }
  }));

  const results = Object.fromEntries(settled);
  const passedCount = Object.values(results).filter((r) => r.passed).length;
  return { task: "health", allPassed: passedCount === checks.length, passedCount, totalChecks: checks.length, results };
}

async function taskLocalization() {
  logSection("🌐 المهمة: فحص الترجمة وإبلاغ الوكيل");
  let exitCode = 0;
  try {
    await runCommand("node", ["src/scripts/validate-localization-agent.mjs"]);
  } catch (error) {
    exitCode = error.status ?? 1;
  }
  const reportPath = path.join(REPO_ROOT, "reports", "localization-agent-report.json");
  const instructionPath = path.join(REPO_ROOT, "reports", "LOCALIZATION_AGENT_TASK.md");
  const report = fs.existsSync(reportPath) ? JSON.parse(fs.readFileSync(reportPath, "utf8")) : null;
  if (report?.issues?.length) {
    logError(`وجد الوكيل ${report.issues.length} نقصًا في الترجمة. راجع ${instructionPath}`);
  } else if (report && !report.ok) {
    logError("وجد الوكيل نواقص ترجمة. راجع ملف التعليمات.");
  } else {
    logSuccess("✅ جميع القواميس مكتملة ولا يوجد fallback إنجليزي.");
  }
  return { task: "localization", exitCode, reportPath, instructionPath, report };
}

async function taskReport() {
  logSection("📊 المهمة: تقرير شامل متوازي");
  const statusPromise = Promise.resolve(taskStatus());
  const healthPromise = taskHealth();
  const localizationPromise = taskLocalization();
  const [status, health, localization] = await Promise.all([statusPromise, healthPromise, localizationPromise]);

  const report = {
    task: "report",
    timestamp: new Date().toISOString(),
    status,
    health,
    localization,
    summary: {
      totalTools: status.total,
      readyTools: status.byStatus.ready,
      plannedTools: status.byStatus.planned,
      placeholderTools: status.byStatus.placeholder,
      readyPercent: status.readyPercent,
      categories: status.categories,
      healthPassed: health.allPassed,
      localizationPassed: localization.exitCode === 0,
    },
  };
  const outputPath = path.join(REPO_ROOT, "reports", "full-report.json");
  ensureDir(path.dirname(outputPath));
  fs.writeFileSync(outputPath, JSON.stringify(report, null, 2), "utf-8");
  logSuccess(`تم إنشاء التقرير في: ${outputPath}`);
  return report;
}

const args = process.argv.slice(2);
const taskArg = args.find((arg) => arg.startsWith("--task="));
const taskName = taskArg ? taskArg.split("=")[1] : "status";
const taskMap = { status: taskStatus, docs: taskDocs, health: taskHealth, localization: taskLocalization, report: taskReport };
if (!taskMap[taskName]) {
  logError(`مهمة غير معروفة: ${taskName}`);
  process.exit(1);
}

try {
  const result = await taskMap[taskName]();
  if (taskName === "localization" && result.exitCode !== 0) process.exit(result.exitCode);
  if ((taskName === "health" || taskName === "report") && !result.health?.allPassed && taskName === "report") {
    process.exitCode = 1;
  }
  if (taskName === "health" && !result.allPassed) process.exitCode = 1;
  console.log(`\n✅ اكتملت المهمة: ${taskName}`);
} catch (error) {
  logError(`فشل تنفيذ المهمة: ${error.message}`);
  process.exit(1);
}
