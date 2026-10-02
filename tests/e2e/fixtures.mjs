/** Content changes applied for the e2e build only (restored afterwards). */
export const NEW_PAGE_PATH = "/e2e-test-page";
export const HIDDEN_PAGE_PATH = "/e2e-hidden-page";

export const newPage = {
  title: "E2E Test Page",
  path: NEW_PAGE_PATH,
  status: "published",
  layout: "standard",
  seo: { title: "E2E test page title", description: "A page created only for automated tests.", image: null, noindex: false, lastReviewed: "2026-10-02" },
  sections: [
    { type: "pageHero", hidden: false, anchor: "", badge: "Test", heading: "Automated test page", subhead: "Built from content only.", badgeStyle: "eyebrow", size: "standard", image: null },
    { type: "textImage", hidden: false, anchor: "intro", eyebrow: "First", heading: "Text and image section", body: "Some **bold** words and a [link to pricing](/pricing).\n\n- One\n- Two", image: { src: "/brand/handshake.jpg", alt: "Two people shaking hands", position: "top" }, imageSide: "left", button: { label: "Contact us", href: "/contact" } },
    { type: "cards", hidden: false, anchor: "", eyebrow: "", heading: "Cards section", intro: "", items: [{ title: "Card one", description: "Card text", image: null, link: { label: "Read", href: "/about" } }] },
    { type: "richText", hidden: true, anchor: "", eyebrow: "", heading: "This hidden section must not render", body: "Hidden", width: "narrow" },
    { type: "faq", hidden: false, anchor: "", eyebrow: "", heading: "Test questions", items: [{ question: "Is this a test?", answer: "Yes." }], structuredData: true },
  ],
};

export const hiddenPage = { ...newPage, title: "E2E Hidden Page", path: HIDDEN_PAGE_PATH, status: "hidden" };
