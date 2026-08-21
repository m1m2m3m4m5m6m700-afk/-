#!/usr/bin/env node

import { spawn } from "node:child_process";

const scripts = ["typecheck", "build"];

function run(script) {
  return new Promise((resolve, reject) => {
    const npm = process.platform === "win32" ? "npm.cmd" : "npm";
    const child = spawn(npm, ["run", script], { stdio: "inherit", shell: false });
    child.on("error", reject);
    child.on("close", (code) => {
      if (code === 0) resolve();
      else reject(new Error(`npm run ${script} failed with exit code ${code ?? "unknown"}`));
    });
  });
}

console.log("\nFLIXO check: typecheck + build\n");
for (const script of scripts) {
  console.log(`▶ npm run ${script}`);
  await run(script);
}
console.log("\nFLIXO check: PASS\n");
