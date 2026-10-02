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

const ADMIN_EMAIL = "admin@alliance-street-leads.firebaseapp.com";
const AUTH = "http://127.0.0.1:9099/identitytoolkit.googleapis.com/v1";

/** Creates an emulator account; `verified` mirrors how the real admin account was set up. */
async function createUser(email: string, password: string, verified: boolean) {
  const res = await fetch(`${AUTH}/accounts:signUp?key=demo-key`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email, password, returnSecureToken: true }) });
  const { localId } = await res.json();
  if (verified) await fetch(`${AUTH}/projects/${PROJECT}/accounts:update`, { method: "POST", headers: OWNER, body: JSON.stringify({ localId, emailVerified: true }) });
}

async function put(path: string, data: Record<string, unknown>) {
  const fields = Object.fromEntries(Object.entries(data).map(([k, x]) => [k, v(x)]));
  const res = await fetch(`${FS}/${path}`, { method: "PATCH", headers: OWNER, body: JSON.stringify({ fields }) });
  if (!res.ok) throw new Error(`seed ${path}: ${res.status} ${await res.text()}`);
}

test.beforeEach(async () => {
  await fetch(`http://127.0.0.1:8085/emulator/v1/projects/${PROJECT}/databases/(default)/documents`, { method: "DELETE" });
  await fetch(`http://127.0.0.1:9099/emulator/v1/projects/${PROJECT}/accounts`, { method: "DELETE" });
  const at = new Date("2026-09-30T09:00:00Z");
  await put(`staff/${ADMIN_EMAIL}`, { role: "admin", active: true, addedBy: "bootstrap", addedAt: at });
  await createUser(ADMIN_EMAIL, "admin@123", true);
  await createUser("someone@example.com", "password123", true);
  const lead = (name: string, email: string, services: string[], extra: Record<string, unknown> = {}) => ({
    name, country: "United Arab Emirates", email, phone: "+971500000000", address: "Synthetic address, Dubai",
    services, notes: "Synthetic test lead", ownerUid: "x", source: "/book-consultation", consentVersion: "2026-10-01",
    createdAt: at, updatedAt: at, enquiryRequested: false, bookingRequested: false, ...extra,
  });
  await put("leads/lead-a", { ...lead("Amira Test", "amira@example.com", ["UAE Setup"]), ownerUid: "lead-a", enquiryRequested: true });
  await put("leads/lead-b", { ...lead("Ben Test", "ben@example.com", ["UK Services", "Advisory"]), ownerUid: "lead-b", bookingRequested: true, createdAt: new Date("2026-10-01T10:00:00Z") });
  await put("leads/lead-c", { ...lead("=HYPERLINK(\"x\")", "csv@example.com", ["Advisory"]), ownerUid: "lead-c" });
});

async function signIn(page: Page, username: string, password: string) {
  await page.getByLabel("Username").fill(username);
  await page.getByLabel("Password").fill(password);
  await page.getByRole("button", { name: "Sign in" }).click();
}

test("wrong usernames and passwords are refused", async ({ page }) => {
  await page.goto("/leads?emulator");
  await signIn(page, "admin", "wrong-password");
  await expect(page.getByRole("alert")).toContainText("Incorrect username or password");
  await signIn(page, "someone@example.com", "password123");
  await expect(page.getByRole("alert")).toContainText("Incorrect username or password");
  await expect(page.getByText("Amira Test")).toHaveCount(0);
});

test("the admin can search, filter, record follow-up, export safely and delete", async ({ page }) => {
  await page.goto("/leads?emulator");
  await signIn(page, "admin", "admin@123");
  await expect(page.getByText("Showing 3 of 3 leads")).toBeVisible();

  await page.getByLabel("Search").fill("ben@");
  await expect(page.getByText("Showing 1 of 3 leads")).toBeVisible();
  await page.getByLabel("Search").fill("");
  await page.getByLabel("Visitor’s next step").selectOption("calendar");
  await expect(page.getByRole("row", { name: /Ben Test/ })).toContainText("Calendar opened");
  await page.getByLabel("Visitor’s next step").selectOption("");

  await page.getByRole("row", { name: /Amira Test/ }).click();
  const drawer = page.getByRole("dialog", { name: "Amira Test" });
  await drawer.getByLabel("Status").selectOption("contacted");
  await drawer.getByLabel("Note for the history log (optional)").fill("Called, left voicemail");
  await drawer.getByRole("button", { name: "Save follow-up" }).click();
  await expect(drawer.getByRole("status")).toHaveText("Saved");
  await expect(drawer.getByRole("region", { name: "History" })).toContainText("Called, left voicemail");
  await drawer.getByRole("button", { name: "Close lead details" }).click();

  const download = page.waitForEvent("download");
  await page.getByRole("button", { name: "Export 3 to CSV" }).click();
  const csv = await (await (await download).createReadStream()).toArray().then((c) => Buffer.concat(c).toString("utf8"));
  expect(csv).toContain("\"'=HYPERLINK(\"\"x\"\")\"");

  await page.getByRole("row", { name: /Ben Test/ }).click();
  const ben = page.getByRole("dialog", { name: "Ben Test" });
  await ben.getByRole("button", { name: "Delete lead…" }).click();
  const confirm = page.getByRole("dialog", { name: "Delete Ben Test?" });
  await confirm.getByLabel(/Type “delete”/).fill("delete");
  await confirm.getByRole("button", { name: "Delete permanently" }).click();
  await expect(page.getByText("Showing 2 of 2 leads")).toBeVisible();
});

test("the admin can change the password, and the old one stops working", async ({ page }) => {
  await page.goto("/account?emulator");
  await signIn(page, "admin", "admin@123");
  await page.getByLabel("Current password").fill("admin@123");
  await page.getByLabel("New password", { exact: true }).fill("correct horse battery staple");
  await page.getByLabel("New password again").fill("correct horse battery staple");
  await page.getByRole("button", { name: "Change password" }).click();
  await expect(page.getByRole("status")).toContainText("Password changed");
  await page.getByRole("button", { name: "Sign out" }).click();
  await signIn(page, "admin", "admin@123");
  await expect(page.getByRole("alert")).toContainText("Incorrect username or password");
  await signIn(page, "admin", "correct horse battery staple");
  await expect(page.getByRole("heading", { name: "Account" })).toBeVisible();
});

test("the portal works on a phone without sideways scrolling", async ({ page }) => {
  await page.goto("/leads?emulator");
  await signIn(page, "admin", "admin@123");
  await expect(page.getByText("Showing 3 of 3 leads")).toBeVisible();
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(overflow).toBeLessThanOrEqual(1);
});
