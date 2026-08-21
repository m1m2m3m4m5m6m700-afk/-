import { spawn } from "node:child_process";

const root = process.cwd();
const target = new URL("./diagnostic-watcher.mjs", import.meta.url).pathname;
const MAX_BACKOFF_MS = 30_000;
const RESTART_BASE_MS = 1_000;

let stopping = false;
let child = null;
let restartCount = 0;
let timer = null;

function start() {
  if (stopping) return;
  child = spawn(process.execPath, [target], {
    cwd: root,
    stdio: "inherit",
    env: {
      ...process.env,
      FLIXO_DIAGNOSTIC_SUPERVISED: "1",
    },
  });

  child.on("error", (error) => {
    console.error(`[diagnostic-supervisor] child error: ${error.message}`);
  });

  child.on("exit", (code, signal) => {
    child = null;
    if (stopping) return;

    restartCount += 1;
    const delay = Math.min(MAX_BACKOFF_MS, RESTART_BASE_MS * 2 ** Math.min(restartCount - 1, 5));
    console.warn(
      `[diagnostic-supervisor] watcher stopped code=${code ?? "null"} signal=${signal ?? "null"}; restarting in ${delay}ms`,
    );
    timer = setTimeout(start, delay);
  });
}

function stop(signal) {
  if (stopping) return;
  stopping = true;
  if (timer) clearTimeout(timer);
  if (child) child.kill(signal === "SIGINT" ? "SIGINT" : "SIGTERM");
  console.log(`[diagnostic-supervisor] stopped (${signal})`);
}

process.on("SIGINT", () => stop("SIGINT"));
process.on("SIGTERM", () => stop("SIGTERM"));
process.on("SIGHUP", () => stop("SIGHUP"));

console.log("[diagnostic-supervisor] ACTIVE — watcher will restart automatically after unexpected exits");
start();
