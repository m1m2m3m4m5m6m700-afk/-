export const dependencyRules = Object.freeze([
  {
    id: 'missing-jsqr',
    knownPattern: 'jsqr',
    layer: 'DEPENDENCY',
    pattern: /(Cannot find module ['\"]jsqr['\"]|Cannot find package ['\"]jsqr['\"])/i,
    summary: 'QR Node certification requires jsqr but the dependency is unavailable.',
    recommendation: 'Declare jsqr in package.json and update package-lock.json together; do not patch only the workflow.',
  },
  {
    id: 'vite-missing',
    knownPattern: null,
    layer: 'DEPENDENCY',
    pattern: /(?:vite: not found|Cannot find (?:module|package).*vite)/i,
    summary: 'Vite is unavailable to a certification job that requires development tooling.',
    recommendation: 'Verify devDependencies and the lockfile, then ensure the job installs dev dependencies with npm ci --include=dev.',
  },
  {
    id: 'playwright-package-missing',
    knownPattern: null,
    layer: 'DEPENDENCY',
    pattern: /Cannot find (?:module|package).*playwright/i,
    summary: 'Playwright package is unavailable to the certification job.',
    recommendation: 'Verify @playwright/test/playwright declarations, lockfile integrity, and npm ci --include=dev.',
  },
  {
    id: 'package-lock-mismatch',
    knownPattern: null,
    layer: 'CONTRACT',
    pattern: /(package-lock|out of date.*lockfile|npm ci.*lock)/i,
    summary: 'package.json and package-lock.json are not aligned.',
    recommendation: 'Update both files together using npm install and rerun the repository dependency contract checks.',
  },
]);

export function matchDependencyRule(log) {
  const text = String(log ?? '');
  return dependencyRules.find((rule) => rule.pattern.test(text)) ?? null;
}
