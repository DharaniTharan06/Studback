import { defineConfig } from "@playwright/test";
export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: false,
  timeout: 120000,
  expect: { timeout: 10000 },
  workers: 1,
  use: {
    actionTimeout: 10000,
    baseURL: "http://localhost:3000",
    channel: "chrome",
    viewport: { width: 1440, height: 1000 },
    trace: "retain-on-failure",
  },
  reporter: [["list"]],
});
