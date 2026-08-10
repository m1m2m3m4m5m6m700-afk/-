/**
 * Flixo Performance Test Suite — Phase 1
 * Tests the 23 "heavy" real tools (FFmpeg/PDF.js/pdf-lib/canvas/gif.js)
 * Measures: load time, process time, peak memory, output validity, failure handling.
 * Produces a PASS / WARN / FAIL table per tool.
 *
 * Usage: node tests/perf/run-perf.mjs
 * Requires: dev server running on http://localhost:3000
 */
import { chromium } from "playwright";
import { readFileSync } from "fs";

const BASE = "http://localhost:3000";
const FIX = "tests/perf/fixtures";

const FIXTURES = {
  mp4: readFileSync(`${FIX}/sample.mp4`),
  wav: readFileSync(`${FIX}/sample.wav`),
  pdf: readFileSync(`${FIX}/sample.pdf`),
  png: readFileSync(`${FIX}/sample.png`),
  jpg: readFileSync(`${FIX}/sample.jpg`),
  gif: readFileSync(`${FIX}/sample.gif`),
};

// Tool test definitions: slug -> { fixture, type, name, expectDownload?, setup? }
// expectDownload: true if the tool should produce a downloadable blob.
const TOOLS = [
  // Video (FFmpeg.wasm)
  { slug: "video-converter", name: "Video Converter", fixture: "mp4", ext: "mp4", kind: "video" },
  { slug: "video-compressor", name: "Video Compressor", fixture: "mp4", ext: "mp4", kind: "video" },
  { slug: "video-trimmer", name: "Video Trimmer", fixture: "mp4", ext: "mp4", kind: "video" },
  { slug: "video-to-gif", name: "Video to GIF", fixture: "mp4", ext: "gif", kind: "video" },
  // Audio (WebAudio)
  { slug: "audio-converter", name: "Audio Converter", fixture: "wav", ext: "mp3", kind: "audio" },
  { slug: "audio-compressor", name: "Audio Compressor", fixture: "wav", ext: "mp3", kind: "audio" },
  { slug: "audio-cutter", name: "Audio Cutter", fixture: "wav", ext: "mp3", kind: "audio" },
  // GIF (gif.js / gifuct)
  { slug: "gif-compressor", name: "GIF Compressor", fixture: "gif", ext: "gif", kind: "GIF" },
  { slug: "gif-maker", name: "GIF Maker", fixture: "png", ext: "gif", kind: "image-multi" },
  { slug: "image-to-gif", name: "Image to GIF", fixture: "png", ext: "gif", kind: "image-multi" },
  // PDF (pdf.js)
  {
    slug: "pdf-to-text",
    name: "PDF to Text",
    fixture: "pdf",
    ext: "txt",
    kind: "PDF",
    expectText: true,
  },
  { slug: "pdf-to-excel", name: "PDF to Excel", fixture: "pdf", ext: "xlsx", kind: "PDF" },
  {
    slug: "pdf-to-powerpoint",
    name: "PDF to PowerPoint",
    fixture: "pdf",
    ext: "pptx",
    kind: "PDF",
  },
  // PDF (pdf-lib)
  { slug: "pdf-crop", name: "PDF Crop", fixture: "pdf", ext: "pdf", kind: "PDF" },
  { slug: "pdf-header-footer", name: "PDF Header/Footer", fixture: "pdf", ext: "pdf", kind: "PDF" },
  { slug: "pdf-page-numbers", name: "PDF Page Numbers", fixture: "pdf", ext: "pdf", kind: "PDF" },
  // Generators (jsPDF / docx)
  { slug: "text-to-pdf", name: "Text to PDF", fixture: null, ext: "pdf", kind: "text-gen" },
  { slug: "text-to-word", name: "Text to Word", fixture: null, ext: "docx", kind: "text-gen" },
  { slug: "markdown-to-pdf", name: "Markdown to PDF", fixture: null, ext: "pdf", kind: "text-gen" },
  {
    slug: "markdown-to-word",
    name: "Markdown to Word",
    fixture: null,
    ext: "docx",
    kind: "text-gen",
  },
  // Image (canvas)
  { slug: "image-compressor", name: "Image Compressor", fixture: "jpg", ext: "jpg", kind: "image" },
  { slug: "image-enhancer", name: "Image Enhancer", fixture: "jpg", ext: "png", kind: "image" },
  {
    slug: "background-remover",
    name: "Background Remover",
    fixture: "png",
    ext: "png",
    kind: "image",
  },
];

const PERF_THRESHOLDS = {
  // ms thresholds: warn if exceeds, fail if exceeds failMs
  load: { warn: 5000, fail: 15000 },
  process: { warn: 30000, fail: 120000 },
  memMB: { warn: 300, fail: 800 },
};

function grade(value, thresholds) {
  if (value > thresholds.fail) return "FAIL";
  if (value > thresholds.warn) return "WARN";
  return "PASS";
}

async function measureMemory(page) {
  const m = await page
    .evaluate(() => {
      if (performance.memory) {
        return {
          usedJSMB: Math.round(performance.memory.usedJSHeapSize / 1048576),
          totalMB: Math.round(performance.memory.totalJSHeapSize / 1048576),
        };
      }
      return null;
    })
    .catch(() => null);
  return m;
}

async function injectConsoleCollector(page) {
  const logs = { errors: [], warnings: [] };
  page.on("console", (msg) => {
    if (msg.type() === "error") logs.errors.push(msg.text().slice(0, 200));
    if (msg.type() === "warning") logs.warnings.push(msg.text().slice(0, 120));
  });
  page.on("pageerror", (err) => logs.errors.push(("PageError: " + err.message).slice(0, 200)));
  return logs;
}

async function findAndFillTextarea(page, text) {
  // Fill the main input textarea (for text-gen tools)
  const filled = await page.evaluate((t) => {
    const ta = document.querySelector("textarea");
    if (!ta) return false;
    const setter = Object.getOwnPropertyDescriptor(
      window.HTMLTextAreaElement.prototype,
      "value",
    ).set;
    setter.call(ta, t);
    ta.dispatchEvent(new Event("input", { bubbles: true }));
    return true;
  }, text);
  return filled;
}

async function findAndUploadFile(page, fileBuffer, fileName, mimeType) {
  // Find the file input and upload
  const fileInputs = await page.locator('input[type="file"]').count();
  if (fileInputs === 0) return { ok: false, reason: "no file input found" };
  await page
    .locator('input[type="file"]')
    .first()
    .setInputFiles({
      name: fileName,
      mimeType: mimeType || "application/octet-stream",
      buffer: fileBuffer,
    });
  return { ok: true };
}

async function clickProcessButton(page) {
  // Find a button that triggers processing (Process/Generate/Convert/Compress/Crop/etc.)
  const btnTexts = [
    "Process",
    "Generate",
    "Convert",
    "Compress",
    "Crop",
    "Cut",
    "Trim",
    "Download",
    "Apply",
    "Create",
    "Start",
    "Extract",
  ];
  const clicked = await page.evaluate((texts) => {
    const btns = Array.from(document.querySelectorAll("button"));
    for (const t of texts) {
      const b = btns.find(
        (b) =>
          b.textContent && b.textContent.toLowerCase().includes(t.toLowerCase()) && !b.disabled,
      );
      if (b) {
        b.click();
        return t;
      }
    }
    // fallback: any non-disabled primary button
    const b = btns.find((b) => !b.disabled && b.textContent && b.textContent.trim().length > 0);
    if (b) {
      b.click();
      return "fallback:" + b.textContent.trim().slice(0, 20);
    }
    return null;
  }, btnTexts);
  return clicked;
}

async function waitForResultOrError(page, timeoutMs = 60000) {
  // Wait for either a success result (download triggered / result shown) or an error message
  const start = Date.now();
  const result = { outcome: "timeout", detail: "", elapsed: 0 };
  // Watch for: error alert text, OR a result/download element, OR a blob download
  let downloadCaptured = false;
  try {
    const dlPromise = page
      .waitForEvent("download", { timeout: timeoutMs })
      .then((d) => {
        downloadCaptured = true;
        return d;
      })
      .catch(() => null);
    // Poll for error text or success indicator
    while (Date.now() - start < timeoutMs) {
      const state = await page
        .evaluate(() => {
          const txt = document.body.innerText || "";
          // error indicators
          const errEl = document.querySelector(
            "[role='alert'], .text-destructive, .text-red-500, [class*='destructive']",
          );
          const errText = errEl ? errEl.textContent.trim() : "";
          // success indicators
          const hasResult = /download|ready|complete|result/i.test(txt) && /download/i.test(txt);
          const dlLink = document.querySelector("a[download], button[class*='download']");
          return { errText: errText.slice(0, 150), hasResult, hasDlLink: !!dlLink };
        })
        .catch(() => ({ errText: "", hasResult: false, hasDlLink: false }));
      if (state.errText && state.errText.length > 3) {
        result.outcome = "error";
        result.detail = state.errText;
        result.elapsed = Date.now() - start;
        return result;
      }
      if (downloadCaptured) {
        result.outcome = "download";
        result.detail = "blob downloaded";
        result.elapsed = Date.now() - start;
        return result;
      }
      if (state.hasDlLink && Date.now() - start > 3000) {
        result.outcome = "result-shown";
        result.detail = "result/download element appeared";
        result.elapsed = Date.now() - start;
        return result;
      }
      await page.waitForTimeout(800);
    }
  } catch (e) {
    result.outcome = "exception";
    result.detail = e.message.slice(0, 120);
  }
  result.elapsed = Date.now() - start;
  return result;
}

async function runToolTest(browser, tool) {
  const fixture = tool.fixture ? FIXTURES[tool.fixture] : null;
  const fileName = tool.fixture ? `test.${tool.fixture}` : null;
  const result = {
    ...tool,
    loadMs: 0,
    processMs: 0,
    memMB: null,
    outcome: "",
    detail: "",
    grade: "",
    error: "",
  };
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  const logs = await injectConsoleCollector(page);

  try {
    // 1. Load page
    const t0 = Date.now();
    await page.goto(`${BASE}/tools/${tool.slug}`, {
      waitUntil: "domcontentloaded",
      timeout: 30000,
    });
    await page.waitForLoadState("networkidle", { timeout: 20000 }).catch(() => {});
    // wait for hydration: a textarea or file input or button
    await page
      .waitForFunction(
        () => document.querySelector("textarea, input[type='file'], button") !== null,
        { timeout: 15000 },
      )
      .catch(() => {});
    result.loadMs = Date.now() - t0;

    // 2. Setup input
    if (tool.kind === "text-gen") {
      const filled = await findAndFillTextarea(
        page,
        "This is a performance test document. Lorem ipsum dolor sit amet, consectetur adipiscing elit. " +
          "Sed do eiusmod tempor incididunt ut labore. ".repeat(5),
      );
      if (!filled) {
        result.outcome = "error";
        result.detail = "no textarea found";
      }
    } else {
      const mimeType =
        tool.fixture === "mp4"
          ? "video/mp4"
          : tool.fixture === "wav"
            ? "audio/wav"
            : tool.fixture === "pdf"
              ? "application/pdf"
              : tool.fixture === "png"
                ? "image/png"
                : tool.fixture === "jpg"
                  ? "image/jpeg"
                  : tool.fixture === "gif"
                    ? "image/gif"
                    : "application/octet-stream";
      const up = await findAndUploadFile(page, fixture, fileName, mimeType);
      if (!up.ok) {
        result.outcome = "error";
        result.detail = "upload failed: " + up.reason;
      }
      // For multi-image gif tools, may need to add multiple images
      if (tool.kind === "image-multi") {
        await page.waitForTimeout(500);
        // try adding same image again
        const count = await page.locator('input[type="file"]').count();
        if (count > 0) {
          await page
            .locator('input[type="file"]')
            .first()
            .setInputFiles({ name: "test2.png", mimeType: "image/png", buffer: FIXTURES.png })
            .catch(() => {});
        }
      }
      // Wait for file to be accepted/preview
      await page.waitForTimeout(800);
    }

    // 3. Click process + measure
    if (!result.outcome) {
      const memBefore = await measureMemory(page);
      const clicked = await clickProcessButton(page);
      if (!clicked) {
        result.outcome = "error";
        result.detail = "no process button found";
      } else {
        const res = await waitForResultOrError(page, 120000);
        result.processMs = res.elapsed;
        result.outcome = res.outcome;
        result.detail = res.detail;
        const memAfter = await measureMemory(page);
        result.memMB = memAfter ? memAfter.usedJSMB : null;
        result.memBeforeMB = memBefore ? memBefore.usedJSMB : null;
      }
    }

    // 4. Grade
    const loadGrade = grade(result.loadMs, PERF_THRESHOLDS.load);
    const procGrade =
      result.outcome === "download" ||
      result.outcome === "result-shown" ||
      (result.outcome === "error" &&
        /password|encrypted|too large|empty|not supported|corrupt/i.test(result.detail))
        ? grade(result.processMs, PERF_THRESHOLDS.process)
        : result.outcome === "timeout" || result.outcome === "error"
          ? "FAIL"
          : grade(result.processMs, PERF_THRESHOLDS.process);
    const memGrade = result.memMB ? grade(result.memMB, PERF_THRESHOLDS.memMB) : "N/A";
    result.grade =
      procGrade === "FAIL" || loadGrade === "FAIL"
        ? "FAIL"
        : procGrade === "WARN" || loadGrade === "WARN" || memGrade === "WARN"
          ? "WARN"
          : "PASS";
    result.loadGrade = loadGrade;
    result.procGrade = procGrade;
    result.memGrade = memGrade;
    if (logs.errors.length) result.consoleErrors = logs.errors.slice(0, 2).join(" | ");
  } catch (e) {
    result.outcome = "exception";
    result.detail = e.message.slice(0, 150);
    result.grade = "FAIL";
    if (logs.errors.length) result.consoleErrors = logs.errors.slice(0, 2).join(" | ");
  } finally {
    await page.close().catch(() => {});
  }
  return result;
}

function printTable(results) {
  console.log("\n" + "=".repeat(110));
  console.log("FLIXO PERFORMANCE TEST RESULTS — 23 Heavy Tools");
  console.log("=".repeat(110));
  const header =
    "TOOL".padEnd(22) +
    "LOAD".padEnd(10) +
    "PROCESS".padEnd(12) +
    "MEM(MB)".padEnd(10) +
    "OUTCOME".padEnd(16) +
    "GRADE".padEnd(8) +
    "DETAIL";
  console.log(header);
  console.log("-".repeat(110));
  for (const r of results) {
    const row =
      (r.name || r.slug).slice(0, 21).padEnd(22) +
      String(r.loadMs || 0).padEnd(10) +
      String(r.processMs || 0).padEnd(12) +
      String(r.memMB ?? "-").padEnd(10) +
      (r.outcome || "").slice(0, 15).padEnd(16) +
      (r.grade || "").padEnd(8) +
      (r.detail || "").slice(0, 40);
    console.log(row);
    if (r.consoleErrors) console.log("    ⚠ console: " + r.consoleErrors);
  }
  console.log("-".repeat(110));
  const counts = results.reduce((a, r) => {
    a[r.grade] = (a[r.grade] || 0) + 1;
    return a;
  }, {});
  console.log(
    `SUMMARY: PASS=${counts.PASS || 0}  WARN=${counts.WARN || 0}  FAIL=${counts.FAIL || 0}  (of ${results.length})`,
  );
  console.log("=".repeat(110));
}

async function main() {
  const filter = process.argv[2] ? process.argv.slice(2) : null; // optional slugs
  const TOOLS_TO_RUN = filter ? TOOLS.filter((t) => filter.some((f) => t.slug.includes(f))) : TOOLS;
  const { writeFileSync, existsSync, readFileSync: rf } = await import("fs");
  // Load prior incremental results
  let results = [];
  if (existsSync("tests/perf/perf-report.json")) {
    try {
      results = JSON.parse(rf("tests/perf/perf-report.json", "utf8"));
    } catch {}
  }
  const doneSlugs = new Set(results.map((r) => r.slug));
  const pending = TOOLS_TO_RUN.filter((t) => !doneSlugs.has(t.slug));

  console.log(
    `Launching chromium... (${pending.length} pending of ${TOOLS_TO_RUN.length} requested, ${doneSlugs.size} already done)`,
  );
  const browser = await chromium.launch({
    executablePath: "/usr/bin/chromium",
    args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-dev-shm-usage", "--disable-gpu"],
  });
  // Run tools sequentially (FFmpeg/PDF.js are heavy; parallel would skew memory)
  for (const tool of pending) {
    process.stdout.write(`Testing ${tool.name}...`);
    const r = await runToolTest(browser, tool);
    // merge into results (replace if exists)
    results = results.filter((x) => x.slug !== r.slug);
    results.push(r);
    writeFileSync("tests/perf/perf-report.json", JSON.stringify(results, null, 2));
    console.log(` ${r.grade} (${r.processMs}ms, ${r.outcome})`);
  }
  await browser.close();
  // Only print full table if all tools done
  const allDone = TOOLS.every((t) => results.some((r) => r.slug === t.slug));
  printTable(results);
  console.log(
    `\nReport saved: tests/perf/perf-report.json (${results.length}/${TOOLS.length} tools tested)`,
  );
  if (allDone) {
    const fails = results.filter((r) => r.grade === "FAIL");
    if (fails.length) {
      console.log(`\n${fails.length} FAIL — review needed.`);
    }
  } else {
    console.log(`\nPartial run. Re-invoke to continue remaining tools (incremental).`);
  }
}

main().catch((e) => {
  console.error("Fatal:", e);
  process.exit(1);
});
