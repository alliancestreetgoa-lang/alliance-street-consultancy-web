import { defineConfig, devices } from "@playwright/test";

/**
 * End-to-end tests of the built site (tests/e2e). `npm run test:e2e` first
 * builds the site with a few fixture content changes (a new page, a hidden and
 * a reordered section, a hidden page, theme settings) into e2e-out/, restoring
 * the real content afterwards, then serves it like GitHub Pages.
 */
export default defineConfig({
  testDir: "tests/e2e",
  fullyParallel: true,
  reporter: [["list"]],
  use: { baseURL: "http://127.0.0.1:8899/alliance-street-consultancy-web", reducedMotion: "reduce" },
  webServer: {
    command: "node scripts/serve-static.mjs e2e-out 8899 /alliance-street-consultancy-web",
    url: "http://127.0.0.1:8899/alliance-street-consultancy-web/",
    reuseExistingServer: false,
  },
  projects: [
    { name: "desktop", use: { ...devices["Desktop Chrome"], viewport: { width: 1440, height: 900 } } },
    { name: "mobile", use: { ...devices["Pixel 7"] } },
  ],
});
