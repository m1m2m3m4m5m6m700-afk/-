import { spawn } from "node:child_process";

const limitSeconds = Number(process.env.FLIXO_BUILD_MAX_SECONDS ?? 180);
const started = performance.now();
const child = spawn(process.platform === "win32" ? "npm.cmd" : "npm", ["run", "build"], { stdio: "inherit" });

child.on("exit", (code, signal) => {
  const seconds = (performance.now() - started) / 1000;
  if (code !== 0) process.exit(code ?? 1);
  console.log(`BUILD_DURATION_SECONDS=${seconds.toFixed(2)}`);
  if (seconds > limitSeconds) {
    console.error(`PERFORMANCE GATE: FAIL — build took ${seconds.toFixed(2)}s, budget is ${limitSeconds}s.`);
    process.exit(1);
  }
  if (signal) process.exit(1);
  console.log("PERFORMANCE GATE: PASS");
});
