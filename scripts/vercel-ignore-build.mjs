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

function gitObjectExists(ref) {
  try {
    execFileSync("git", ["cat-file", "-e", `${ref}^{commit}`], {
      stdio: ["ignore", "ignore", "ignore"],
    });
    return true;
  } catch {
    return false;
  }
}

if (!gitObjectExists(previous) || !gitObjectExists(current)) {
  console.log("Vercel build required: previous/current Git commit is unavailable in the checkout.");
  process.exit(1);
}

let changed = "";
try {
  changed = execFileSync("git", ["diff", "--name-only", previous, current, "--"], {
    encoding: "utf8",
    stdio: ["ignore", "pipe", "ignore"],
  });
} catch {
  // A diff failure is unsafe to treat as ignorable: build the deployment.
  console.log("Vercel build required: Git diff could not be resolved safely.");
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
