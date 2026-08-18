import { execFileSync } from "node:child_process";

const current = process.env.VERCEL_GIT_COMMIT_SHA;
const previous = process.env.VERCEL_GIT_PREVIOUS_SHA;

// Vercel's ignoreCommand must return 1 when a deployment is required and 0
// when the current commit cannot affect the built application.
if (!current || !previous || current === previous) process.exit(1);

const buildRelevantPaths = [
  "src/",
  "public/",
  "package.json",
  "package-lock.json",
  "vite.config.ts",
  "vite.config.js",
  "tsconfig.json",
  "tsconfig.app.json",
  "tsconfig.node.json",
  "vercel.json",
  ".nvmrc",
  "index.html",
];

let changed = "";
try {
  changed = execFileSync("git", ["diff", "--name-only", previous, current, "--"], {
    encoding: "utf8",
  });
} catch {
  // A diff failure is unsafe to treat as ignorable: build the deployment.
  process.exit(1);
}

const files = changed
  .split("\n")
  .map((file) => file.trim())
  .filter(Boolean);

const affectsBuild = files.some((file) =>
  buildRelevantPaths.some((path) => file === path || file.startsWith(path)),
);

if (affectsBuild) {
  console.log(`Vercel build required: ${files.length} changed file(s) include build-relevant paths.`);
  process.exit(1);
}

console.log(`Vercel build skipped: ${files.length} changed file(s) are non-build changes.`);
process.exit(0);
