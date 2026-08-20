import fs from 'node:fs';
import { execFileSync } from 'node:child_process';

function changedFiles() {
  try {
    return execFileSync('git', ['diff', '--name-only', 'HEAD~1', 'HEAD'], { encoding: 'utf8' }).split(/\r?\n/).filter(Boolean);
  } catch {
    return [];
  }
}

function infer(errorType, log) {
  if (errorType === 'TYPECHECK') return 'Deterministic TypeScript contract violation in the reported source path.';
  if (errorType === 'DEPENDENCY') return 'Dependency graph or lockfile contract is inconsistent with the declared manifest/runtime.';
  if (errorType === 'PLAYWRIGHT') return 'Browser automation or application interaction did not satisfy the expected operational contract.';
  if (errorType === 'BUILD') return 'Build graph or bundler stage failed after static checks.';
  if (errorType === 'SECURITY') return 'Security gate detected a vulnerability, policy violation, or exposed secret.';
  if (errorType === 'LOCALIZATION') return 'Translation/resource contract is incomplete or falling back unexpectedly.';
  if (errorType === 'WORKFLOW') return 'CI workflow contract or runner orchestration failed.';
  if (/timeout|timed out/i.test(log)) return 'Execution exceeded an operational timeout and requires gate-specific context.';
  return 'No deterministic root cause matched; human review is required.';
}

export function analyzeRootCause({ errorType = 'UNKNOWN', errorMessage = '', affectedFile = null, log = '', dependencyContext = {} } = {}) {
  const files = changedFiles();
  const dependencyImpact = {
    packageManifestChanged: Boolean(dependencyContext.packageManifestChanged) || /package\.json|package-lock\.json|Cannot find module|ERESOLVE/i.test(log),
    workflowChanged: /\.github\/workflows|workflow|runner|actions/i.test(log),
    affectedDependencies: dependencyContext.affectedDependencies ?? [],
  };
  const affectedFiles = [...new Set([affectedFile, ...files].filter(Boolean))].slice(0, 30);
  const confidence = errorType === 'UNKNOWN' ? 0.45 : (affectedFile ? 0.92 : 0.82);
  return {
    version: 1,
    rootCause: infer(errorType, log),
    affectedFiles,
    dependencyImpact,
    confidence,
    deterministic: errorType !== 'UNKNOWN',
    escalationRequired: confidence < 0.85 || errorType === 'UNKNOWN',
  };
}
