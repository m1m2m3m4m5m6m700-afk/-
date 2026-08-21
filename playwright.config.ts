import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  workers: process.env.CI ? 2 : undefined,
  retries: 0,
  timeout: 15_000,
  use: { baseURL: 'http://127.0.0.1:3000', ...devices['Desktop Chrome'] },
  webServer: {
    command: 'npm run dev',
    url: 'http://127.0.0.1:3000',
    reuseExistingServer: !process.env.CI,
  },
});
