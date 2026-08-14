/**
 * Truthfulness contract validator.
 *
 * Runs real static checks (no mocks) that encode the "FULL TRUTHFULNESS"
 * principles the codebase was repaired under. Each assertion documents a
 * concrete anti-pattern that was removed; failing here means a regression
 * reintroduced a misleading claim or fake implementation into production.
 *
 * Run: `npm run test:truthfulness`
 */

import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const failures = [];
let checks = 0;

function check(name, condition, detail) {
  checks += 1;
  if (!condition) {
    failures.push({ name, detail });
    console.log(`  ✗ ${name}${detail ? ` — ${detail}` : ""}`);
  } else {
    console.log(`  ✓ ${name}`);
  }
}

function read(rel) {
  return fs.readFileSync(path.join(root, rel), "utf8");
}

console.log("\nTruthfulness contract checks\n");

// --- A. No fake/mock implementations in production tool runtimes ---
const runtimeDir = path.join(root, "src/lib/tool-runtime/tools");
const runtimeFiles = fs
  .readdirSync(runtimeDir)
  .filter((f) => f.endsWith(".tsx"))
  .map((f) => path.join(runtimeDir, f));

let mockInRuntime = [];
for (const file of runtimeFiles) {
  const src = fs.readFileSync(file, "utf8");
  // A ready tool runtime must contain real client logic, not a stub that
  // pretends to compute via setTimeout + hardcoded result.
  if (
    /setTimeout\s*\(\s*(?:\(\)\s*=>|function\s*\([^)]*\))\s*=>?\s*\{?([\s\S]*?)\}\s*,\s*\d{3,}\s*\)/.test(
      src,
    )
  ) {
    const hasHardcodedResult = /setResult\s*\(\s*\{[\s\S]*name:[\s\S]*size:\s*\d/.test(src);
    if (hasHardcodedResult) {
      mockInRuntime.push(path.basename(file));
    }
  }
}
check(
  "No mock setTimeout stubs with hardcoded results in tool runtimes",
  mockInRuntime.length === 0,
  mockInRuntime.length ? `Found in: ${mockInRuntime.join(", ")}` : "",
);

// --- B. The six AI text tools are NOT marked ready with fake runtimes ---
const toolsSource = read("src/data/tools.ts");
const aiToolSlugs = ["translator"];
// translator is genuinely wired to the generate RPC; the other 5 AI text
// tools (slugger, rewriter, summarizer, etc.) must remain planned until wired.
const plannedAiSlugs = [
  "ai-slug-generator",
  "ai-content-rewriter",
  "ai-summarizer",
  "ai-meta-description",
  "ai-title-generator",
];
let nonPlannedAi = [];
for (const slug of plannedAiSlugs) {
  // Each should appear with status planned (not ready) in tools.ts.
  const slugSegment = toolsSource.includes(`slug: "${slug}"`);
  if (!slugSegment) continue; // slug name may differ; skip if absent
  // Find the nearest status after the slug occurrence.
  const idx = toolsSource.indexOf(`slug: "${slug}"`);
  const after = toolsSource.slice(idx, idx + 400);
  if (/status:\s*"ready"/.test(after)) {
    nonPlannedAi.push(slug);
  }
}
check(
  "AI text tools not falsely promoted to ready without real runtimes",
  nonPlannedAi.length === 0,
  nonPlannedAi.length ? `Promoted without runtime: ${nonPlannedAi.join(", ")}` : "",
);

// --- C. No fabricated usage metrics in the stats widget / registry ---
const seoEnterpriseSource = read("src/data/seoEnterpriseData.ts");
const statsWidgetSource = read("src/components/seo/ToolStatsWidget.tsx");
check(
  "ToolStatItem type carries no fabricated metric fields (processedCount/avgTimeMs/userRating)",
  !/processedCount|avgTimeMs|userRating/.test(seoEnterpriseSource),
);
check(
  "ToolStatsWidget does not render fabricated execution counts or ratings",
  !/processedCount|avgTimeMs|userRating|Total Executions|User Satisfaction|Real-time Performance/i.test(
    statsWidgetSource,
  ),
);

// --- D. UUID v4 uses a CSPRNG (crypto.getRandomValues), not Math.random ---
const uuidSource = read("src/lib/tool-runtime/tools/uuid-generator.tsx");
check(
  "UUID v4 fallback uses crypto.getRandomValues (CSPRNG), not Math.random",
  /crypto\.getRandomValues/.test(uuidSource) && !/Math\.random\s*\(/.test(uuidSource),
);

// --- E. Translator uses the real generate RPC, no local mock engine ---
const translateSource = read("src/lib/tools/translate.ts");
check(
  "Translator calls server-side generate RPC (no local mock engine)",
  /import\s*\{\s*generate\s*\}\s*from\s*"@\/lib\/ai\/rpc\/generate"/.test(translateSource) &&
    !/mock/i.test(translateSource),
);

// --- F. Docs do not claim a local mock fallback for translation ---
const readme = read("README.md");
const replit = read("replit.md");
check(
  "README does not claim translator uses a local mock engine",
  !/local mock engine/i.test(readme),
);
check(
  "replit.md does not advertise a local mock fallback for translation",
  !/local mock fallback/i.test(replit),
);

// --- G. DB config reads the canonical DATABASE_URL env var ---
const dbConfig = read("src/lib/server/db/config.ts");
check(
  "DB config reads DATABASE_URL (canonical) with POSTGRES_URL legacy alias",
  /DATABASE_URL/.test(dbConfig),
);

// --- H. Non-AI image tools do not claim AI / face restoration ---
const toolSeo = read("src/data/toolSeo.ts");
const enhancerBlock = toolSeo.slice(
  toolSeo.indexOf('"image-enhancer"'),
  toolSeo.indexOf('"image-enhancer"') + 1200,
);
check(
  "image-enhancer copy does not claim AI / face restoration",
  !/\bAI\b|restore faces|photo restoration/i.test(enhancerBlock),
);
const bgRemoverBlock = toolSeo.slice(
  toolSeo.indexOf('"background-remover"'),
  toolSeo.indexOf('"background-remover"') + 1200,
);
check(
  "background-remover copy does not claim automatic subject extraction (AI-free wording)",
  !/automatically extracts subjects/i.test(bgRemoverBlock),
);

// --- I. audio-compressor copy is honest about WAV-only output ---
const audioBlock = toolSeo.slice(
  toolSeo.indexOf('"audio-compressor"'),
  toolSeo.indexOf('"audio-compressor"') + 1000,
);
check(
  "audio-compressor copy does not claim MP3 compression / bitrate control",
  !/compress mp3|bitrate/i.test(audioBlock),
);

// --- J. gif-maker does not claim video input support ---
const gifBlock = toolSeo.slice(
  toolSeo.indexOf('"gif-maker"'),
  toolSeo.indexOf('"gif-maker"') + 1000,
);
check("gif-maker copy does not claim video input (images only)", !/video input/i.test(gifBlock));

// --- K. AI Translator does not claim client-side / in-browser privacy ---
const translatorSeoBlock = toolSeo.slice(
  toolSeo.indexOf("translator:"),
  toolSeo.indexOf("translator:") + 1600,
);
const enSource = read("src/lib/i18n/locales/en.ts");
check(
  "Translator SEO copy does not claim client-side / in-browser privacy (AI runs server-side)",
  !/100% client-side|in your browser|browser session/i.test(translatorSeoBlock),
);
check(
  "English FAQ does not describe the translator as a local demo engine",
  !/local demo engine/i.test(enSource),
);
check(
  "English FAQ privacy answer does not claim all input stays in the browser tab",
  !/live only in your browser tab/i.test(enSource),
);

// --- L. image-enhancer carries no AI / super-res / face-restoration claims ---
const enhancerEnBlock = enSource.slice(
  enSource.indexOf('"imageEnhancer.'),
  enSource.indexOf('"imageEnhancer.controls"') + 40,
);
check(
  "image-enhancer i18n carries no AI / Super-Res / Face Restoration wording",
  !/Auto AI|AI Presets|AI Super-Res|Face Enhancement|Restore facial|Face & Skin Restoration/i.test(
    enhancerEnBlock,
  ),
);
check(
  'image-enhancer canonical name is "Image Enhancer" (not "AI Image Enhancer")',
  /"tool\.image-enhancer\.name":\s*"Image Enhancer"/.test(enSource),
);

// --- Summary ---
console.log("");
if (failures.length === 0) {
  console.log(`Result: PASS ✅  (${checks} truthfulness assertions)`);
  process.exit(0);
} else {
  console.log(`Result: FAIL ❌  (${failures.length}/${checks} assertions failed)`);
  process.exit(1);
}
