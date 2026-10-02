import { chromium } from "@playwright/test";
import { appendFileSync } from "node:fs";
const BASE = "https://alliancestreetgoa-lang.github.io/alliance-street-consultancy-web";
const browser = await chromium.launch();
const results = [];
for (let i = 1; i <= Number(process.argv[2] ?? 5); i++) {
  const ctx = await browser.newContext();
  const page = await ctx.newPage();
  const failures = [];
  page.on("requestfailed", (r) => failures.push(`FAILED ${r.url().split("?")[0]} ${r.failure()?.errorText}`));
  page.on("response", (r) => { if (r.status() >= 400 && /googleapis|firebase|_next/.test(r.url())) failures.push(`${r.status()} ${r.url().split("?")[0]}`); });
  page.on("console", (m) => { if (m.type() === "error") failures.push(`console: ${m.text().slice(0, 200)}`); });
  const t0 = Date.now();
  await page.goto(`${BASE}/book-consultation`, { waitUntil: process.env.WAIT ?? "domcontentloaded" });
  await page.locator("#consultation-name").fill(`AUTOMATED TEST ${i} — delete`);
  await page.locator("#consultation-country").fill("United Arab Emirates");
  await page.locator("#consultation-email").fill(`form-probe-${i}@example.com`);
  await page.locator("#consultation-phone").fill("+971500000000");
  await page.locator("#consultation-address").fill("Synthetic test address, Dubai");
  await page.locator('input[value="Advisory"]').check();
  await page.locator("#consultation-notes").fill("Synthetic connectivity probe; not a real enquiry.");
  await page.getByRole("button", { name: "Continue" }).click();
  const outcome = await Promise.race([
    page.getByRole("heading", { name: /Step 2 of 2/ }).waitFor({ timeout: 30000 }).then(() => "saved"),
    page.getByText("We couldn’t save your details").waitFor({ timeout: 30000 }).then(() => "error"),
  ]).catch(() => "timeout");
  const urlAfter = page.url();
  await page.screenshot({ path: `${process.env.TMPDIR}/probe-${i}.png` });
  const uid = await page.evaluate(() => {
    for (let k = 0; k < sessionStorage.length; k++) { const key = sessionStorage.key(k); if (key?.startsWith("firebase:authUser")) return JSON.parse(sessionStorage.getItem(key)).uid; }
    return null;
  });
  let choice = "-";
  if (outcome === "saved") {
    await page.getByRole("button", { name: "Send enquiry" }).click();
    choice = await page.getByText("Your enquiry has been saved").waitFor({ timeout: 20000 }).then(() => "enquiry saved").catch(() => "enquiry FAILED");
  }
  results.push({ i, outcome, choice, ms: Date.now() - t0, uid, urlAfter, failures: failures.filter((f) => !/ERR_ABORTED/.test(f)) });
  if (uid) appendFileSync(".firebase-test-records.json.ids", uid + "\n");
  await ctx.close();
}
await browser.close();
console.log(JSON.stringify(results, null, 1));
