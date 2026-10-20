import { fileURLToPath } from "node:url";

import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./src/test/setup.ts"],
    // e2e/ holds the Playwright smoke tests, run by `yarn test:e2e` against a build.
    include: ["src/**/*.test.{ts,tsx}"],
    coverage: {
      provider: "v8",
      include: ["src/**/*.{ts,tsx}"],
      // Left out of the measurement on purpose (see docs/ai/architecture.md,
      // "Test coverage"): Next.js route files and i18n/proxy wiring, which must
      // stay thin and are exercised by `next build`, plus barrels and tests.
      exclude: [
        "src/app/**",
        "src/proxy.ts",
        "src/i18n/**",
        "src/test/**",
        "src/**/index.ts",
        "src/**/*.test.{ts,tsx}",
      ],
      reporter: ["text", "text-summary", "json-summary", "html"],
      // A floor, not a target: raise it whenever coverage goes up, never lower it.
      thresholds: {
        statements: 95,
        branches: 85,
        functions: 90,
        lines: 95,
        // Data handling (API client, schemas, dates, trajectories) is held higher.
        "src/lib/**": { statements: 95, branches: 90, functions: 95, lines: 95 },
      },
    },
  },
});
