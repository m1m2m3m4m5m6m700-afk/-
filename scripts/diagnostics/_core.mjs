import { execFileSync } from "node:child_process";
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";

export function headSha() {
  const sha = execFileSync("git", ["rev-parse", "HEAD"], { encoding: "utf8" }).trim();
  if (!/^[0-9a-f]{40}$/i.test(sha)) throw new Error("Cannot resolve exact git SHA.");
  return sha;
}

export function files(root = ".", pattern = /\.(ts|tsx|js|jsx|mjs|json)$/) {
  const out = [];
  const skip = new Set([".git", "node_modules", "dist", ".output", ".vercel", ".tanstack", ".nitro"]);
  function walk(dir) {
    if (!existsSync(dir)) return;
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      if (skip.has(entry.name)) continue;
      const p = join(dir, entry.name);
      if (entry.isDirectory()) walk(p);
      else if (pattern.test(p)) out.push(p);
    }
  }
  walk(root);
  return out;
}

export function text(file) { return readFileSync(file, "utf8"); }
export function rel(file) { return relative(process.cwd(), file).replaceAll("\\", "/"); }
export function json(file) { return JSON.parse(text(file)); }
export function has(file, regex) { return existsSync(file) && regex.test(text(file)); }
export function run(command, args = []) { return execFileSync(command, args, { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] }); }
export function record(scanner, severity, message, details = {}) {
  const sink = join(process.cwd(), "scripts", "error-sink.mjs");
  return run(process.execPath, [sink, "record", "--scanner", scanner, "--severity", severity, "--message", message, "--details", JSON.stringify(details)]);
}
export async function main(scanner, check) {
  try {
    const result = await check();
    const findings = result?.findings ?? [];
    const severity = result?.severity ?? (findings.length ? "CRITICAL" : "INFO");
    const message = result?.message ?? (findings.length ? `${findings.length} finding(s)` : "PASS");
    record(scanner, severity, message, { findings, ...(result?.details ?? {}) });
    if (severity === "CRITICAL" && findings.length) process.exitCode = 1;
    else process.exitCode = 0;
  } catch (error) {
    record(scanner, "CRITICAL", error instanceof Error ? error.message : String(error), { exception: true });
    process.exitCode = 1;
  }
}
