import fs from 'node:fs/promises';
import path from 'node:path';

const DEFAULT_MAX_FILES = 8;
const FORBIDDEN_PATHS = new Set([
  '.github/workflows/release-certification.yml',
]);

function assertRepairPlan(plan) {
  if (!plan || plan.approved !== true) {
    throw new Error('Repair plan must be explicitly verified with approved=true');
  }
  if (!Array.isArray(plan.changes) || plan.changes.length === 0) {
    throw new Error('Repair plan must contain at least one change');
  }
  if (plan.changes.length > DEFAULT_MAX_FILES) {
    throw new Error(`Repair plan exceeds maximum change count (${DEFAULT_MAX_FILES})`);
  }
  for (const change of plan.changes) {
    if (!change?.file || typeof change.file !== 'string') {
      throw new Error('Every repair change must include a file path');
    }
    if (path.isAbsolute(change.file) || change.file.includes('..')) {
      throw new Error(`Unsafe path: ${change.file}`);
    }
    if (FORBIDDEN_PATHS.has(change.file)) {
      throw new Error(`Forbidden file: ${change.file}`);
    }
    if (!['replace', 'insert', 'delete'].includes(change.type)) {
      throw new Error(`Unsupported change type: ${change.type}`);
    }
  }
}

export function applyChange(source, change) {
  if (change.type === 'replace') {
    if (typeof change.find !== 'string' || change.find.length === 0) {
      throw new Error(`Replace change requires non-empty find text for ${change.file}`);
    }
    const count = source.split(change.find).length - 1;
    if (count !== 1) {
      throw new Error(`Replace target must match exactly once in ${change.file}; found ${count}`);
    }
    return source.replace(change.find, change.content ?? '');
  }

  if (change.type === 'insert') {
    if (typeof change.after !== 'string' || change.after.length === 0) {
      throw new Error(`Insert change requires non-empty after text for ${change.file}`);
    }
    const count = source.split(change.after).length - 1;
    if (count !== 1) {
      throw new Error(`Insert anchor must match exactly once in ${change.file}; found ${count}`);
    }
    return source.replace(change.after, `${change.after}${change.content ?? ''}`);
  }

  if (change.type === 'delete') {
    if (typeof change.find !== 'string' || change.find.length === 0) {
      throw new Error(`Delete change requires non-empty find text for ${change.file}`);
    }
    const count = source.split(change.find).length - 1;
    if (count !== 1) {
      throw new Error(`Delete target must match exactly once in ${change.file}; found ${count}`);
    }
    return source.replace(change.find, '');
  }

  throw new Error(`Unsupported change type: ${change.type}`);
}

export async function applyRepairPlan(plan, { rootDir = process.cwd(), dryRun = true } = {}) {
  assertRepairPlan(plan);

  const updates = [];
  for (const change of plan.changes) {
    const absolute = path.join(rootDir, change.file);
    const source = await fs.readFile(absolute, 'utf8');
    const updated = applyChange(source, change);
    updates.push({ file: change.file, before: source, after: updated });
  }

  if (!dryRun) {
    for (const update of updates) {
      await fs.writeFile(path.join(rootDir, update.file), update.after, 'utf8');
    }
  }

  return {
    applied: !dryRun,
    dryRun,
    files: updates.map(({ file }) => file),
    updates,
    note: dryRun
      ? 'Dry-run only. No files were written.'
      : 'Plan applied. Dependency synchronization and git commit must be performed by the outer execution layer after verification.',
  };
}

export default { applyRepairPlan, applyChange };
