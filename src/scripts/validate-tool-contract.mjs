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

function hasMeaningfulTimerCleanupRisk(source) {
  const timerPattern = /\b(?:setTimeout|setInterval)\s*\(/;
  if (!timerPattern.test(source)) return false;

  // UI state timers such as "setTimeout(() => setCopied(false), 2000)"
  // are bounded presentation timers, not resource-owning timers. Treat a timer
  // as a cleanup concern only when the handle is retained or the callback
  // controls processing/resource state.
  const retainedHandle = /\b(?:const|let|var)\s+\w*timer\w*\s*=\s*set(?:Timeout|Interval)\s*\(/i.test(source);
  const processingCallback = /set(?:Result|Output|Content|Processing|Loading|Worker|Preview)\s*\(/.test(source);
  const effectTimer = /useEffect\s*\([\s\S]{0,500}\b(?:setTimeout|setInterval)\s*\(/.test(source);
  return retainedHandle || processingCallback || effectTimer;
}

for (const file of runtimeFiles) {
  const runtimeSource = fs.readFileSync(path.join(runtimeDir, file), "utf8");
  const slugMatch = runtimeSource.match(/slug:\s*"([^\"]+)"/);

  if (!slugMatch) {
    issues.push(`${file}: runtime is missing slug metadata.`);
    continue;
  }

  const slug = slugMatch[1];
  const selfContainedComponent = /component:\s*[A-Za-z_$][\w$]*\s*,/.test(runtimeSource);
  const componentMatch = runtimeSource.match(/from\s+"@\/components\/tools\/([^\"]+)"/);

  if (!selfContainedComponent && !componentMatch) {
    issues.push(`${file}: runtime does not expose a concrete component implementation.`);
    continue;
  }

  let source = runtimeSource;
  if (componentMatch) {
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
    source = fs.readFileSync(componentPath, "utf8");
  }

  if (!registry.includes(`from "./tools/${slug}"`) && !file.includes("desktop")) {
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

  if (hasAny(source, [/\bsetTimeout\s*\(/, /\bsetInterval\s*\(/])) {
    findings.timerUsers++;
    if (hasMeaningfulTimerCleanupRisk(source)) {
      const clears = /\bclearTimeout\s*\(/.test(source) || /\bclearInterval\s*\(/.test(source);
      if (!clears) {
        findings.timerCleanupGaps++;
        issues.push(`${slug}: owns a processing timer without an explicit cleanup path.`);
      }
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
    findings.timerCleanupGaps && `${findings.timerCleanupGaps} processing-timer cleanup gap(s)`,
    findings.workerCleanupGaps && `${findings.workerCleanupGaps} worker cleanup gap(s)`,
  ].filter(Boolean);
  throw new Error(`Tool contract audit failed: ${failures.join(", ")}.\n- ${issues.join("\n- ")}`);
}

if (issues.length > 0) {
  throw new Error(`Tool contract audit failed with ${issues.length} issue(s).\n- ${issues.join("\n- ")}`);
}

console.log(`Tool contract audit passed: ${findings.runtimes} classic runtime modules inspected.`);
console.log(
  `Contract signals: objectURLs=${findings.objectUrlUsers}, timers=${findings.timerUsers}, workers=${findings.workerUsers}, abortControllers=${findings.abortControllerUsers}, errorHandling=${findings.errorHandlingUsers}.`,
);