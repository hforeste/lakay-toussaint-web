import { defineConfig, devices } from "@playwright/test";
import { TEST_DATABASE_URL } from "./tests/support/test-database";

const sharedEnvironment = {
  DATABASE_URL: TEST_DATABASE_URL,
  PII_ENCRYPTION_KEY: "MDEyMzQ1Njc4OWFiY2RlZjAxMjM0NTY3ODlhYmNkZWY=",
  PII_LOOKUP_KEY: "registration-tests-lookup-key-at-least-32-characters",
  APP_URL: "http://127.0.0.1:3100",
  PUBLIC_SITE_URL: "http://127.0.0.1:3100",
  ADMIN_PASSWORD: "registration-test-admin-password",
  CRON_SECRET: "registration-test-cron-secret",
};

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: false,
  workers: 1,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [["github"], ["html", { open: "never" }]] : "list",
  globalSetup: "./tests/integration/global-setup.ts",
  use: {
    baseURL: "http://127.0.0.1:3100",
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  webServer: [
    {
      command: "npm run dev -- --hostname 127.0.0.1 --port 3100",
      url: "http://127.0.0.1:3100/events",
      timeout: 120_000,
      reuseExistingServer: false,
      env: sharedEnvironment,
    },
    {
      command: "node node_modules/next/dist/bin/next dev --hostname 127.0.0.1 --port 3101",
      cwd: "./admin",
      url: "http://127.0.0.1:3101/login",
      timeout: 120_000,
      reuseExistingServer: false,
      env: sharedEnvironment,
    },
  ],
});
