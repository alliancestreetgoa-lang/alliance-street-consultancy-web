import { expect, test } from "@playwright/test";
import { HIDDEN_PAGE_PATH, NEW_PAGE_PATH } from "./fixtures.mjs";

const CORE = ["/", "/about", "/services", "/industries", "/case-studies", "/pricing", "/contact", "/book-consultation",
  "/book-appointment", "/privacy-policy", "/terms-and-conditions", "/services/uae/e-invoicing"];

test.describe("every page", () => {
  for (const path of [...CORE, NEW_PAGE_PATH]) {
    test(`${path} renders cleanly`, async ({ page }) => {
      const errors: string[] = [];
      page.on("pageerror", (e) => errors.push(e.message));
      page.on("console", (m) => { if (m.type() === "error" && !/Failed to load resource/.test(m.text())) errors.push(m.text()); });
      const res = await page.goto(`.${path === "/" ? "/" : path}`);
      expect(res?.status()).toBe(200);
      await expect(page.locator("h1")).toHaveCount(1);
      await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", new RegExp(`alliance-street-consultancy-web${path === "/" ? "/?$" : `${path}$`}`));
      // The review host and draft previews must never be indexed.
      await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", /noindex/);
      // No sideways scrolling on any viewport.
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
      expect(overflow).toBeLessThanOrEqual(1);
      expect(errors).toEqual([]);
    });
  }
});

test.describe("page builder", () => {
  test("a page created in content gets a working public route", async ({ page }) => {
    await page.goto(`.${NEW_PAGE_PATH}`);
    await expect(page).toHaveTitle(/E2E test page title/);
    await expect(page.locator('meta[name="description"]')).toHaveAttribute("content", "A page created only for automated tests.");
    const headings = await page.locator("main h2").allInnerTexts();
    expect(headings.slice(0, 3)).toEqual(["Text and image section", "Cards section", "Test questions"]);
    await expect(page.getByText("This hidden section must not render")).toHaveCount(0);
    // Formatting and links typed in the editor.
    await expect(page.locator("#intro strong", { hasText: "bold" })).toBeVisible();
    await expect(page.locator('#intro a[href$="/pricing"]')).toHaveText("link to pricing");
    await expect(page.locator("#intro li")).toHaveText(["One", "Two"]);
    await expect(page.locator('#intro img[alt="Two people shaking hands"]')).toHaveClass(/object-top/);
    // FAQ structured data and the breadcrumb.
    const ld = await page.locator('script[type="application/ld+json"]').allTextContents();
    expect(ld.some((t) => t.includes('"FAQPage"') && t.includes("Is this a test?"))).toBe(true);
    expect(ld.some((t) => t.includes('"BreadcrumbList"') && t.includes("E2E Test Page"))).toBe(true);
  });

  test("a hidden page is not published", async ({ page }) => {
    const res = await page.goto(`.${HIDDEN_PAGE_PATH}`);
    expect(res?.status()).toBe(404);
  });

  test("the sitemap lists published pages only", async ({ request }) => {
    const xml = await (await request.get("./sitemap.xml")).text();
    expect(xml).toContain(`alliance-street-consultancy-web${NEW_PAGE_PATH}<`);
    expect(xml).not.toContain(HIDDEN_PAGE_PATH);
    expect(xml).toContain("/services/uae/e-invoicing<");
  });

  test("reordered and hidden sections show on the home page", async ({ page }) => {
    await page.goto("./");
    const order = await page.locator("[data-section]").evaluateAll((els) => els.map((e) => e.getAttribute("data-section")));
    expect(order.slice(0, 3)).toEqual(["homeHero", "faq", "stats"]);
    expect(order).not.toContain("testimonials");
    await expect(page.getByText("What founders say once the paperwork is done.")).toHaveCount(0);
  });
});

test.describe("brand settings and preview", () => {
  test("theme presets reach the page", async ({ page }) => {
    await page.goto("./");
    await expect(page.locator("html")).toHaveAttribute("data-motion", "off");
    const brand = await page.evaluate(() => getComputedStyle(document.documentElement).getPropertyValue("--brand").trim());
    expect(brand).toBe("#c8102e");
    await expect(page.locator(".as-intro")).toHaveCount(0);
  });

  test("a draft preview says it is not the live site", async ({ page }) => {
    await page.goto("./about");
    await expect(page.getByRole("note")).toContainText("not the live website");
  });
});

test.describe("navigation and forms", () => {
  test("menus reach every primary page", async ({ page, isMobile }) => {
    await page.goto("./");
    if (isMobile) {
      await page.getByRole("button", { name: "Open menu" }).click();
      await page.getByRole("dialog").getByRole("link", { name: "Pricing" }).click();
    } else {
      await page.locator("header").getByRole("link", { name: "Pricing" }).click();
    }
    await expect(page).toHaveURL(/\/pricing$/);
    await expect(page.locator("h1")).toContainText("quote");
  });

  test("consultation form validates before saving anything", async ({ page }) => {
    let firebaseCalls = 0;
    page.on("request", (r) => { if (/googleapis\.com|firebase/.test(r.url())) firebaseCalls++; });
    await page.goto("./book-consultation");
    await page.getByRole("button", { name: "Continue" }).click();
    await expect(page.getByText("Enter your full name.")).toBeVisible();
    await expect(page.getByText("Choose at least one service.")).toBeVisible();
    expect(firebaseCalls).toBe(0);
  });

  test("keyboard users can reach the main call to action", async ({ page, isMobile }) => {
    test.skip(isMobile, "desktop keyboard path");
    await page.goto("./");
    for (let i = 0; i < 12; i++) {
      await page.keyboard.press("Tab");
      const text = await page.evaluate(() => document.activeElement?.textContent ?? "");
      if (/Book Consultation/i.test(text)) return;
    }
    throw new Error("Book Consultation was not reachable by keyboard in the first 12 tab stops");
  });
});

test.describe("forms before the page is interactive", () => {
  // Regression: pressing Continue before hydration used to submit natively,
  // saving nothing and putting every entered detail into the URL.
  test("cannot submit details into the URL without JavaScript", async ({ browser, baseURL }) => {
    const ctx = await browser.newContext({ javaScriptEnabled: false });
    const page = await ctx.newPage();
    for (const [path, button] of [["/book-consultation", "Continue"], ["/book-appointment", "Continue"], ["/contact", "Send Message"]] as const) {
      await page.goto(`${baseURL}${path}`);
      await expect(page.locator("main form").first()).toHaveAttribute("method", "post");
      await expect(page.getByRole("button", { name: button })).toBeDisabled();
    }
    await ctx.close();
  });
});
