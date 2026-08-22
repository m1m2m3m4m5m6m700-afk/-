import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  // E2E isolation contract: specs must not run in parallel against shared app state.
  fullyParallel: false,
  workers: process.env.CI ? 2 : undefined,
  retries: 0,
  timeout: 15_000,
  reporter: [
    ['list'],
    ['html', { outputFolder: 'playwright-report', open: 'never' }],
    ['json', { outputFile: 'playwright-report/results.json' }],
  ],
  use: {
    baseURL: 'http://127.0.0.1:3000',
    ...devices['Desktop Chrome'],
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  webServer: {
    command: 'npm run dev',
    url: 'http://127.0.0.1:3000',
    reuseExistingServer: !process.env.CI,
  },
});
