import { spawnSync } from "node:child_process";

const [, , ...command] = process.argv;
if (command.length === 0) {
  console.error("Usage: node scripts/verify-timing.mjs <command> [args...]");
  process.exit(2);
}

const start = performance.now();
const result = spawnSync(command[0], command.slice(1), {
  stdio: "inherit",
  shell: process.platform === "win32",
});
const elapsedMs = performance.now() - start;
console.log(`VERIFY TIMING: ${(elapsedMs / 1000).toFixed(2)}s :: ${command.join(" ")}`);

if (result.error) {
  console.error(`VERIFY TIMING: command failed to start: ${result.error.message}`);
  process.exit(1);
}
process.exit(result.status ?? 1);
