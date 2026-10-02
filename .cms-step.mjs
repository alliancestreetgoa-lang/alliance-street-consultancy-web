import { chromium } from "@playwright/test";
import { execSync } from "node:child_process";
const dir = process.env.TMPDIR + "/cms-e2e";
const ctx = await chromium.launchPersistentContext(dir + "/profile", { viewport: { width: 1440, height: 1000 } });
const page = ctx.pages()[0] ?? await ctx.newPage();
const shot = async (name) => page.screenshot({ path: `${dir}/${name}.png` });
const step = process.argv[2];
try {
  if (step === "login") {
    await page.goto("https://alliance-street-leads.web.app/cms/", { waitUntil: "networkidle" });
    await page.getByRole("button", { name: /Sign In Using Access Token/ }).click();
    const token = execSync("gh auth token").toString().trim();
    await page.locator('input[type="password"], input[type="text"]').last().fill(token);
    await page.getByRole("button", { name: /Sign In/ }).last().click();
    await page.waitForTimeout(8000);
    await shot("login");
    console.log((await page.locator("body").innerText()).replace(/\s+/g, " ").slice(0, 800));
  } else {
    const mod = await import(`${dir}/${step}.mjs`);
    await mod.default(page, shot);
  }
} catch (e) { console.log("ERROR", e.message.slice(0, 500)); await shot("error"); }
await ctx.close();
