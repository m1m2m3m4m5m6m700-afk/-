import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const runtimeDir = path.join(root, "src/lib/tool-runtime/tools");
const registryPath = path.join(root, "src/lib/tool-runtime/readyTools.ts");

const runtimeFiles = fs
  .readdirSync(runtimeDir)
  .filter((file) => file.endsWith(".ts") || file.endsWith(".tsx"))
  .sort();
const registry = fs.readFileSync(registryPath, "utf8");
const issues = [];
const findings = {
  runtimes: runtimeFiles.length,
  objectUrlUsers: 0,
  objectUrlCleanupGaps: 0,
  timerUsers: 0,
  timerCleanupGaps: 0,
  workerUsers: 0,
  workerCleanupGaps: 0,
  abortControllerUsers: 0,
  errorHandlingUsers: 0,
};

function hasAny(source, patterns) {
  return patterns.some((pattern) => pattern.test(source));
}

for (const file of runtimeFiles) {
  const runtimeSource = fs.readFileSync(path.join(runtimeDir, file), "utf8");
  const componentMatch = runtimeSource.match(/from\s+"@\/components\/tools\/([^\"]+)"/);
  const slugMatch = runtimeSource.match(/slug:\s*"([^\"]+)"/);

  if (!componentMatch) {
    issues.push(`${file}: runtime does not declare a concrete tool component import.`);
    continue;
  }
  if (!slugMatch) {
    issues.push(`${file}: runtime is missing slug metadata.`);
    continue;
  }

  const componentBase = componentMatch[1];
  const candidates = [
    path.join(root, "src/components/tools", componentBase),
    path.join(root, "src/components/tools", `${componentBase}.tsx`),
    path.join(root, "src/components/tools", `${componentBase}.ts`),
  ];
  const componentPath = candidates.find((candidate) => fs.existsSync(candidate));
  if (!componentPath) {
    issues.push(`${file}: component source not found for ${componentBase}.`);
    continue;
  }

  const source = fs.readFileSync(componentPath, "utf8");
  const slug = slugMatch[1];

  if (!registry.includes(`from "./tools/${slug}"`)) {
    issues.push(`${file}: ${slug} is not registered in readyTools.ts.`);
  }

  const objectUrls = (source.match(/URL\.createObjectURL\s*\(/g) ?? []).length;
  if (objectUrls > 0) {
    findings.objectUrlUsers++;
    if (!/URL\.revokeObjectURL\s*\(/.test(source)) {
      findings.objectUrlCleanupGaps++;
      issues.push(`${slug}: creates object URLs but has no URL.revokeObjectURL cleanup.`);
    }
  }

  const timers = hasAny(source, [/\bsetTimeout\s*\(/, /\bsetInterval\s*\(/]);
  if (timers) {
    findings.timerUsers++;
    const clears = /\bclearTimeout\s*\(/.test(source) || /\bclearInterval\s*\(/.test(source);
    if (!clears) {
      findings.timerCleanupGaps++;
      issues.push(`${slug}: creates timers without an explicit clearTimeout/clearInterval cleanup path.`);
    }
  }

  const workers = hasAny(source, [/\bnew\s+Worker\s*\(/, /\bnew\s+SharedWorker\s*\(/]);
  if (workers) {
    findings.workerUsers++;
    if (!/\.terminate\s*\(/.test(source)) {
      findings.workerCleanupGaps++;
      issues.push(`${slug}: creates a Worker without an explicit terminate() cleanup path.`);
    }
  }

  if (/\bnew\s+AbortController\s*\(/.test(source) || /\babortRef\b/.test(source)) {
    findings.abortControllerUsers++;
  }

  if (
    hasAny(source, [
      /\btry\s*\{/, /\.catch\s*\(/, /catch\s*\(/, /\.onerror\s*=/, /setError\s*\(/,
    ])
  ) {
    findings.errorHandlingUsers++;
  }
}

if (findings.objectUrlCleanupGaps || findings.timerCleanupGaps || findings.workerCleanupGaps) {
  const failures = [
    findings.objectUrlCleanupGaps && `${findings.objectUrlCleanupGaps} object-URL cleanup gap(s)`,
    findings.timerCleanupGaps && `${findings.timerCleanupGaps} timer cleanup gap(s)`,
    findings.workerCleanupGaps && `${findings.workerCleanupGaps} worker cleanup gap(s)`,
  ].filter(Boolean);
  throw new Error(`Tool contract audit failed: ${failures.join(", ")}.\n- ${issues.join("\n- ")}`);
}

if (issues.length > 0) {
  throw new Error(`Tool contract audit failed with ${issues.length} issue(s).\n- ${issues.join("\n- ")}`);
}

console.log(`Tool contract audit passed: ${findings.runtimes} runtime modules inspected.`);
console.log(
  `Contract signals: objectURLs=${findings.objectUrlUsers}, timers=${findings.timerUsers}, workers=${findings.workerUsers}, abortControllers=${findings.abortControllerUsers}, errorHandling=${findings.errorHandlingUsers}.`,
);
