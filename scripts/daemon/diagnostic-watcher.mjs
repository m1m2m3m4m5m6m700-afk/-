import { spawn } from "node:child_process";
import { watch } from "node:fs";
import { resolve } from "node:path";

const ROOT = process.cwd();
const WATCH_ROOTS = ["src", "scripts", "config"].map((p) => resolve(ROOT, p));
const DEBOUNCE_MS = Math.max(500, Number(process.env.FLIXO_DIAGNOSTIC_DEBOUNCE_MS || 750));
const FAST_SCANNERS = [
  "check-secrets",
  "check-typecheck",
  "check-ast-architecture",
  "check-test-quality",
];

let timer = null;
let running = false;
let queued = false;
let stopped = false;

function runScanner(name) {
  return new Promise((resolveRun) => {
    const file = resolve(ROOT, "scripts", "diagnostics", `${name}.mjs`);
    const child = spawn(process.execPath, [file], {
      cwd: ROOT,
      stdio: "inherit",
      env: { ...process.env, FLIXO_DIAGNOSTIC_DAEMON: "1" },
    });
    child.on("close", (code) => resolveRun(code ?? 1));
    child.on("error", () => resolveRun(1));
  });
}

async function runFastPass(reason = "change") {
  if (running) {
    queued = true;
    return;
  }
  running = true;
  try {
    console.log(`[diagnostic-daemon] fast pass: ${reason}`);
    for (const scanner of FAST_SCANNERS) {
      await runScanner(scanner);
    }
  } finally {
    running = false;
    if (queued && !stopped) {
      queued = false;
      queueRun("queued change");
    }
  }
}

function queueRun(reason) {
  clearTimeout(timer);
  timer = setTimeout(() => void runFastPass(reason), DEBOUNCE_MS);
}

const watchers = [];
for (const root of WATCH_ROOTS) {
  try {
    const watcher = watch(root, { recursive: true }, (_event, filename) => {
      if (!filename || stopped) return;
      queueRun(`${root}/${filename.toString()}`);
    });
    watchers.push(watcher);
  } catch (error) {
    console.warn(`[diagnostic-daemon] watcher unavailable for ${root}: ${error.message}`);
  }
}

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));

function shutdown(signal) {
  if (stopped) return;
  stopped = true;
  clearTimeout(timer);
  for (const watcher of watchers) watcher.close();
  console.log(`[diagnostic-daemon] stopped (${signal})`);
}

console.log(`[diagnostic-daemon] ACTIVE debounce=${DEBOUNCE_MS}ms roots=${WATCH_ROOTS.join(",")}`);
void runFastPass("startup");
