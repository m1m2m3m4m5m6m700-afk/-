export function diagnosePlaywright(log) {
  const text = String(log ?? '');

  if (!/(Executable doesn't exist at|browserType\.launch).*?(chrome-headless-shell|playwright)/i.test(text)) {
    return null;
  }

  return {
    id: 'playwright-missing-browser',
    layer: 'ENVIRONMENT',
    confidence: 0.99,
    rootCause: 'The Playwright browser executable required by the failing job is not installed on the runner.',
    repair: {
      type: 'workflow',
      invariant: 'Install the browser after npm ci and before the Playwright test command.',
      command: 'npx playwright install chromium',
      placement: 'affected job, immediately after npm ci and immediately before the browser test command',
    },
    verification: [
      'Validate workflow syntax.',
      'Run the affected job on the new SHA.',
      'Confirm Playwright reaches test execution instead of browserType.launch failure.',
      'Confirm unrelated tool gates remain unchanged.',
    ],
  };
}

export default diagnosePlaywright;
