const PROTECTED_FILES = new Set([
  '.github/workflows/release-certification.yml',
]);

const TOOL_SCOPE = {
  qr: ['qr-independent-certification.yml', 'qr-generator'],
  pdf: ['pdf-merge-independent-certification.yml', 'pdf-merge'],
};

function hasFile(plan, file) {
  return plan.files?.includes(file);
}

function validatePackageLockPair(plan) {
  const touchesPackage = hasFile(plan, 'package.json');
  const touchesLock = hasFile(plan, 'package-lock.json');
  if (touchesPackage !== touchesLock) {
    return 'package.json and package-lock.json must be changed together';
  }
  return null;
}

function validateProtectedFiles(plan) {
  for (const file of plan.files ?? []) {
    if (PROTECTED_FILES.has(file)) {
      return `protected file requires explicit authorization: ${file}`;
    }
  }
  return null;
}

function validateToolIsolation(plan, context = {}) {
  const tool = context.tool;
  if (!tool) return null;

  const scope = TOOL_SCOPE[tool];
  if (!scope) return null;

  for (const file of plan.files ?? []) {
    if (file.startsWith('.github/workflows/')) {
      const expectedWorkflow = scope[0];
      if (!file.endsWith(expectedWorkflow)) {
        return `workflow isolation violation: ${file} is outside ${tool} scope`;
      }
    }
  }
  return null;
}

function validateChanges(plan) {
  for (const change of plan.changes ?? []) {
    if (change.type === 'dependency-sync') {
      if (!hasFile(plan, 'package.json') || !hasFile(plan, 'package-lock.json')) {
        return 'dependency-sync requires package.json and package-lock.json';
      }
      if (!change.command?.startsWith('npm install --save-dev ')) {
        return 'dependency-sync must use npm install --save-dev';
      }
    }

    if (change.type === 'insert-after' && !change.anchor) {
      return 'insert-after change requires an anchor';
    }
  }
  return null;
}

export function verifyRepairPlan(plan, context = {}) {
  const errors = [];

  if (!plan || plan.version !== 1) errors.push('unsupported or missing plan version');
  if (plan?.status !== 'planned') errors.push('plan is not executable');
  if (!Array.isArray(plan?.files)) errors.push('plan.files must be an array');
  if (!Array.isArray(plan?.changes)) errors.push('plan.changes must be an array');

  for (const validator of [validatePackageLockPair, validateProtectedFiles, validateChanges]) {
    const error = validator(plan ?? {});
    if (error) errors.push(error);
  }

  const isolationError = validateToolIsolation(plan ?? {}, context);
  if (isolationError) errors.push(isolationError);

  return {
    valid: errors.length === 0,
    errors,
    checked: {
      contracts: true,
      dependencySync: true,
      toolIsolation: true,
      protectedPaths: true,
    },
  };
}

export default verifyRepairPlan;
