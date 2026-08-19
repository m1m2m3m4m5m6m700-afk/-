const PROTECTED = new Set(['.github/workflows/release-certification.yml']);
export function verify(plan, { tool = null } = {}) {
  const errors = [];
  if (plan?.status !== 'planned') errors.push('plan is not executable');
  for (const change of plan?.changes ?? []) {
    if (PROTECTED.has(change.file)) errors.push(`protected file: ${change.file}`);
    if (change.file.includes('..') || change.file.startsWith('/')) errors.push(`unsafe path: ${change.file}`);
  }
  const touchesPackage = (plan?.changes ?? []).some((c) => c.file === 'package.json');
  const touchesLock = (plan?.changes ?? []).some((c) => c.file === 'package-lock.json');
  if (touchesPackage !== touchesLock) errors.push('package.json and package-lock.json must move together');
  return { valid: errors.length === 0, approved: errors.length === 0, errors, tool };
}
