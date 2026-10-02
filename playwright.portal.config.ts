import { defineConfig, devices } from "@playwright/test";

/**
 * Staff portal end-to-end tests against the Firebase emulators (synthetic data,
 * fake Google accounts). Never touches the real project.
 *   npm run test:portal
 */
export default defineConfig({
  testDir: "tests/portal",
  workers: 1,
  reporter: [["list"]],
  use: { baseURL: "http://localhost:5175", reducedMotion: "reduce", acceptDownloads: true },
  webServer: {
    command: "npx vite --config admin/vite.config.ts",
    url: "http://localhost:5175/",
    reuseExistingServer: false,
  },
  projects: [
    { name: "desktop", use: { ...devices["Desktop Chrome"], viewport: { width: 1360, height: 900 } } },
    { name: "mobile", use: { ...devices["Pixel 7"] } },
  ],
});
