// Builds the site with the e2e fixture content into e2e-out/, then restores the
// real content files whatever happens. Run by `npm run test:e2e`.
import { execSync } from "node:child_process";
import { cpSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { hiddenPage, newPage } from "./fixtures.mjs";

const PAGES = "src/content/pages";
const saved = [`${PAGES}/home.json`, "src/content/theme.json"].map((path) => ({ path, text: readFileSync(path, "utf8") }));
const created = [`${PAGES}/e2e-test-page.json`, `${PAGES}/e2e-hidden-page.json`];

try {
  writeFileSync(created[0], JSON.stringify(newPage, null, 2));
  writeFileSync(created[1], JSON.stringify(hiddenPage, null, 2));
  // Reorder: move the FAQ up under the hero; hide the testimonials.
  const home = JSON.parse(saved[0].text);
  const [faq] = home.sections.splice(home.sections.findIndex((s) => s.type === "faq"), 1);
  home.sections.splice(1, 0, faq);
  home.sections.find((s) => s.type === "testimonials").hidden = true;
  writeFileSync(saved[0].path, JSON.stringify(home, null, 2));
  writeFileSync(saved[1].path, JSON.stringify({ ...JSON.parse(saved[1].text), accent: "crimson", motion: "off", openingAnimation: false }, null, 2));
  rmSync("out", { recursive: true, force: true });
  execSync("npm run build", {
    stdio: "inherit",
    env: {
      ...process.env,
      NEXT_PUBLIC_BASE_PATH: "/alliance-street-consultancy-web",
      NEXT_PUBLIC_SITE_URL: "https://alliancestreetgoa-lang.github.io",
      NEXT_PUBLIC_PREVIEW_LABEL: "Draft #e2e",
    },
  });
  rmSync("e2e-out", { recursive: true, force: true });
  cpSync("out", "e2e-out", { recursive: true });
} finally {
  for (const file of saved) writeFileSync(file.path, file.text);
  for (const file of created) rmSync(file, { force: true });
}
