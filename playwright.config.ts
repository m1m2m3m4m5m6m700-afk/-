import { defineConfig, devices } from "playwright/test";

const isCI = process.env.CI === "true";

export default defineConfig({
  testDir: "./tests",
  fullyParallel: isCI,
  workers: isCI ? 2 : undefined,
  timeout: 5 * 60 * 1000,
  expect: { timeout: 15_000 },
  reporter: [["list"], ["html", { outputFolder: "playwright-report", open: "never" }]],
  use: {
    baseURL: "http://127.0.0.1:3000",
    headless: true,
    trace: "retain-on-failure",
    actionTimeout: 30_000,
    navigationTimeout: 30_000,
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: {
    command: "npm run dev",
    url: "http://127.0.0.1:3000",
    reuseExistingServer: false,
    timeout: 120_000,
  },
});
