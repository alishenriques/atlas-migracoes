import { defineConfig, devices } from "@playwright/test";

// Smoke tests of the built app against a simulated API (e2e/mock-api.mts).
// Build first (`yarn build`): the mock listens on the API's default local URL,
// http://localhost:4000/graphql, so the default build already points to it.
export default defineConfig({
  testDir: "./e2e",
  // e2e/launch runs against a deployed address (playwright.launch.config.ts).
  testIgnore: "launch/**",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: 0,
  reporter: process.env.CI ? [["list"], ["html", { open: "never" }]] : "list",
  use: {
    baseURL: "http://localhost:3000",
    trace: "retain-on-failure",
  },
  projects: [
    { name: "desktop", use: { ...devices["Desktop Chrome"], launchOptions: { args: ["--use-gl=swiftshader", "--enable-webgl", "--ignore-gpu-blocklist"] } } },
    { name: "mobile", use: { ...devices["Pixel 7"], launchOptions: { args: ["--use-gl=swiftshader", "--enable-webgl", "--ignore-gpu-blocklist"] } } },
  ],
  webServer: [
    {
      command: "node --experimental-strip-types e2e/mock-api.mts",
      url: "http://localhost:4000/graphql",
      reuseExistingServer: !process.env.CI,
    },
    {
      command: "yarn start --port 3000",
      url: "http://localhost:3000/pt/sobre",
      reuseExistingServer: !process.env.CI,
    },
  ],
});
