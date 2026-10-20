import { defineConfig, devices } from "@playwright/test";

// Launch check: the demo script against a deployed address with the real base,
// production by default. Nothing is built or started here.
// LAUNCH_URL=https://… yarn test:launch
export default defineConfig({
  testDir: "./e2e/launch",
  fullyParallel: true,
  retries: 0,
  reporter: [["list"], ["html", { open: "never", outputFolder: "playwright-report/launch" }]],
  timeout: 60_000,
  use: {
    baseURL: process.env.LAUNCH_URL ?? "https://atlas-migracoes.vercel.app",
    trace: "retain-on-failure",
  },
  projects: [
    { name: "desktop", use: { ...devices["Desktop Chrome"] } },
    { name: "mobile", use: { ...devices["Pixel 7"] } },
  ],
});
