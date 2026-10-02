import { expect, test, type Page } from "@playwright/test";

const PROJECT = "demo-alliance-street";
const FS = `http://127.0.0.1:8085/v1/projects/${PROJECT}/databases/(default)/documents`;
const OWNER = { Authorization: "Bearer owner", "Content-Type": "application/json" };

type Value = { stringValue: string } | { booleanValue: boolean } | { timestampValue: string } | { arrayValue: { values: Value[] } };
const v = (x: unknown): Value =>
  typeof x === "boolean" ? { booleanValue: x }
    : Array.isArray(x) ? { arrayValue: { values: x.map(v) } }
    : x instanceof Date ? { timestampValue: x.toISOString() }
    : { stringValue: String(x) };

async function put(path: string, data: Record<string, unknown>) {
  const fields = Object.fromEntries(Object.entries(data).map(([k, x]) => [k, v(x)]));
  const res = await fetch(`${FS}/${path}`, { method: "PATCH", headers: OWNER, body: JSON.stringify({ fields }) });
  if (!res.ok) throw new Error(`seed ${path}: ${res.status} ${await res.text()}`);
}

test.beforeEach(async () => {
  await fetch(`http://127.0.0.1:8085/emulator/v1/projects/${PROJECT}/databases/(default)/documents`, { method: "DELETE" });
  await fetch(`http://127.0.0.1:9099/emulator/v1/projects/${PROJECT}/accounts`, { method: "DELETE" });
  const at = new Date("2026-09-30T09:00:00Z");
  await put("staff/admin@example.com", { role: "admin", active: true, addedBy: "bootstrap", addedAt: at });
  await put("staff/editor@example.com", { role: "editor", active: true, addedBy: "admin@example.com", addedAt: at });
  const lead = (name: string, email: string, services: string[], extra: Record<string, unknown> = {}) => ({
    name, country: "United Arab Emirates", email, phone: "+971500000000", address: "Synthetic address, Dubai",
    services, notes: "Synthetic test lead", ownerUid: "x", source: "/book-consultation", consentVersion: "2026-10-01",
    createdAt: at, updatedAt: at, enquiryRequested: false, bookingRequested: false, ...extra,
  });
  await put("leads/lead-a", { ...lead("Amira Test", "amira@example.com", ["UAE Setup"]), ownerUid: "lead-a", enquiryRequested: true });
  await put("leads/lead-b", { ...lead("Ben Test", "ben@example.com", ["UK Services", "Advisory"]), ownerUid: "lead-b", bookingRequested: true, createdAt: new Date("2026-10-01T10:00:00Z") });
  await put("leads/lead-c", { ...lead("=HYPERLINK(\"x\")", "csv@example.com", ["Advisory"]), ownerUid: "lead-c" });
});

/** Signs in through the Auth emulator's Google popup with a fake account. */
async function signIn(page: Page, email: string) {
  const popupPromise = page.waitForEvent("popup");
  await page.getByRole("button", { name: "Sign in with Google" }).first().click();
  const popup = await popupPromise;
  await popup.waitForLoadState();
  await popup.getByText("Add new account").click();
  await popup.locator("#email-input").fill(email);
  await popup.locator("#display-name-input").fill(email.split("@")[0]);
  await popup.getByRole("button", { name: /Sign in with Google/i }).click();
  await popup.waitForEvent("close").catch(() => undefined);
}

test("strangers are refused even after signing in with Google", async ({ page }) => {
  await page.goto("/leads?emulator");
  await signIn(page, "stranger@example.com");
  await expect(page.getByRole("alert")).toContainText("is not on the staff list");
  await expect(page.getByText("Amira Test")).toHaveCount(0);
});

test("an editor can search, filter and record follow-up, but not export or delete", async ({ page }) => {
  await page.goto("/leads?emulator");
  await signIn(page, "editor@example.com");
  await expect(page.getByText("Showing 3 of 3 leads")).toBeVisible();
  await expect(page.getByRole("button", { name: /Export/ })).toHaveCount(0);

  await page.getByLabel("Search").fill("ben@");
  await expect(page.getByText("Showing 1 of 3 leads")).toBeVisible();
  await page.getByLabel("Search").fill("");
  await page.getByLabel("Visitor’s next step").selectOption("calendar");
  await expect(page.getByRole("row", { name: /Ben Test/ })).toContainText("Calendar opened");
  await page.getByLabel("Visitor’s next step").selectOption("");

  await page.getByRole("row", { name: /Amira Test/ }).click();
  const drawer = page.getByRole("dialog", { name: "Amira Test" });
  await expect(drawer).toContainText("Requested a follow-up");
  await expect(drawer).toContainText("Not opened");
  await drawer.getByLabel("Status").selectOption("contacted");
  await drawer.getByLabel("Note for the history log (optional)").fill("Called, left voicemail");
  await drawer.getByRole("button", { name: "Save follow-up" }).click();
  await expect(drawer.getByRole("status")).toHaveText("Saved");
  await expect(drawer.getByRole("region", { name: "History" })).toContainText("Called, left voicemail");
  await expect(drawer.getByRole("region", { name: "History" })).toContainText("editor@example.com");
  await expect(drawer.getByRole("region", { name: "Delete" })).toHaveCount(0);
  await drawer.getByRole("button", { name: "Close lead details" }).click();
  await expect(page.getByRole("row", { name: /Amira Test/ })).toContainText("Contacted");
});

test("an admin can export safely, manage staff and delete a lead", async ({ page }) => {
  await page.goto("/leads?emulator");
  await signIn(page, "admin@example.com");
  const download = page.waitForEvent("download");
  await page.getByRole("button", { name: "Export 3 to CSV" }).click();
  const file = await download;
  const csv = await (await file.createReadStream()).toArray().then((c) => Buffer.concat(c).toString("utf8"));
  expect(csv).toContain("\"'=HYPERLINK(\"\"x\"\")\""); // formula neutralised
  expect(csv).toContain("Booking calendar opened");

  await page.getByRole("row", { name: /Ben Test/ }).click();
  const drawer = page.getByRole("dialog", { name: "Ben Test" });
  await expect(drawer).toContainText("not a confirmed meeting");
  await drawer.getByRole("button", { name: "Delete lead…" }).click();
  const confirm = page.getByRole("dialog", { name: "Delete Ben Test?" });
  await expect(confirm.getByRole("button", { name: "Delete permanently" })).toBeDisabled();
  await confirm.getByLabel(/Type “delete”/).fill("delete");
  await confirm.getByRole("button", { name: "Delete permanently" }).click();
  await expect(page.getByText("Showing 2 of 2 leads")).toBeVisible();

  await page.goto("/team?emulator");
  await page.getByLabel("Google account email").fill("New.Person@Example.com");
  await page.getByRole("button", { name: "Add person" }).click();
  await expect(page.getByRole("status")).toContainText("new.person@example.com can now sign in");
  const row = page.getByRole("row", { name: /new.person@example.com/ });
  await row.getByRole("button", { name: "Remove…" }).click();
  await page.getByRole("dialog").getByRole("button", { name: "Remove access" }).click();
  await expect(page.getByRole("row", { name: /new.person@example.com/ })).toHaveCount(0);
  // An admin cannot lock themselves out.
  await expect(page.getByRole("row").filter({ hasText: "You" }).getByRole("combobox")).toBeDisabled();
});

test("the portal works on a phone without sideways scrolling", async ({ page }) => {
  await page.goto("/leads?emulator");
  await signIn(page, "admin@example.com");
  await expect(page.getByText("Showing 3 of 3 leads")).toBeVisible();
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(overflow).toBeLessThanOrEqual(1);
});
