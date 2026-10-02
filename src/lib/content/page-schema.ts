import { z } from "zod";

/**
 * Page-builder contract.
 *
 * A page is an ordered list of typed sections. The CMS writes these files; this
 * schema decides whether they can be published. Every field the CMS exposes is
 * described here, and tests/cms-config.test.ts keeps the CMS form definitions in
 * step with it — a field the site does not read is a field an editor would fill
 * in for nothing.
 */

const text = (label: string) => z.string().trim().min(1, `${label} cannot be empty`);
const optionalText = z.string().trim().optional().default("");

/** Site-relative path, an in-page anchor, mailto:/tel:, or an https URL. */
export const hrefSchema = z
  .string()
  .trim()
  .min(1, "link cannot be empty")
  .refine(
    (href) => /^\/(?!\/)/.test(href) || /^#[\w-]+$/.test(href) || /^(mailto|tel):/.test(href) || /^https:\/\//.test(href),
    "must start with / (a page on this site), https://, mailto: or tel:"
  );

export const linkSchema = z.object({ label: text("link label"), href: hrefSchema });
/** The CMS saves an empty optional object as null or leaves it out; both mean "none". */
const absent = (v: unknown) => (v === null ? undefined : v);

const optionalLinkSchema = z.preprocess(absent, z
  .object({ label: optionalText, href: optionalText })
  .optional()
  .refine((link) => !link || !link.label === !link.href, "a button needs both a label and a link, or neither"));

export const IMAGE_POSITIONS = ["center", "top", "bottom", "left", "right"] as const;

/** Media lives in public/brand; tests also check the file actually exists. */
export const mediaPathSchema = z
  .string()
  .trim()
  .regex(/^\/brand\/[^/]+\.(jpe?g|png|webp)$/i, "choose an image from the media library");

export const imageSchema = z.object({
  src: mediaPathSchema,
  alt: text("image description (alt text)"),
  position: z.enum(IMAGE_POSITIONS).default("center"),
});

const optionalImageSchema = z.preprocess(absent, z
  .object({ src: optionalText, alt: optionalText, position: z.enum(IMAGE_POSITIONS).default("center") })
  .optional()
  .superRefine((image, ctx) => {
    if (!image?.src) return;
    if (!mediaPathSchema.safeParse(image.src).success)
      ctx.addIssue({ code: "custom", message: "choose an image from the media library", path: ["src"] });
    if (!image.alt) ctx.addIssue({ code: "custom", message: "describe the image (alt text) for screen readers", path: ["alt"] });
  }));

const entry = z.object({ title: text("title"), description: text("description") });
const faqItem = z.object({ question: text("question"), answer: text("answer") });

const base = {
  /** Kept in the file but not rendered. Lets an editor park a section rather than delete it. */
  hidden: z.boolean().default(false),
  /** Optional in-page anchor so buttons can link to #this-section. */
  anchor: z.string().trim().regex(/^([a-z0-9-]+)?$/, "lowercase letters, numbers and hyphens").optional().default(""),
};

export const SECTION_TYPES = [
  "homeHero", "pageHero", "statement", "textImage", "richText", "stats", "featureList", "numberedList",
  "cards", "servicesOverview", "servicesIndex", "testimonials", "faq", "pricing", "caseStudies", "cta",
  "leadership", "story", "consultationForm", "contact", "newsletter", "legal", "image",
] as const;

export const sectionSchema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("homeHero"), ...base,
    badge: text("badge text"), badgeLink: optionalLinkSchema,
    heading: text("heading"), body: text("body"),
    primaryButton: linkSchema, secondaryButton: optionalLinkSchema,
    video: z.string().trim().regex(/^(\/brand\/[^/]+\.(mp4|webm))?$/i, "choose an .mp4 or .webm video from the media library").optional().default(""),
    poster: mediaPathSchema,
  }),
  z.object({
    type: z.literal("pageHero"), ...base,
    badge: text("badge"), heading: text("heading"), subhead: text("subheading"),
    badgeStyle: z.enum(["eyebrow", "pill"]).default("eyebrow"),
    size: z.enum(["standard", "large"]).default("standard"),
    image: optionalImageSchema,
  }),
  z.object({
    type: z.literal("statement"), ...base,
    eyebrowLead: optionalText, eyebrowAccent: optionalText,
    statement: text("statement"), body: text("body"),
    image: optionalImageSchema, imageSide: z.enum(["left", "right"]).default("left"),
  }),
  z.object({
    type: z.literal("textImage"), ...base,
    eyebrow: optionalText, heading: text("heading"), body: text("body"),
    image: imageSchema, imageSide: z.enum(["left", "right"]).default("right"),
    button: optionalLinkSchema,
  }),
  z.object({
    type: z.literal("richText"), ...base,
    eyebrow: optionalText, heading: optionalText, body: text("body"),
    width: z.enum(["narrow", "wide"]).default("narrow"),
  }),
  z.object({
    type: z.literal("stats"), ...base,
    items: z.array(z.object({
      value: z.number().int().nonnegative(), suffix: optionalText, label: text("label"),
    })).min(1, "add at least one statistic").max(4, "at most four statistics fit the row"),
  }),
  z.object({
    type: z.literal("featureList"), ...base,
    eyebrow: optionalText, heading: optionalText,
    columns: z.enum(["2", "3"]).default("2"),
    items: z.array(entry).min(1, "add at least one item"),
  }),
  z.object({
    type: z.literal("numberedList"), ...base,
    eyebrow: optionalText, heading: text("heading"),
    style: z.enum(["steps", "areas"]).default("steps"),
    items: z.array(entry).min(1, "add at least one item"),
  }),
  z.object({
    type: z.literal("cards"), ...base,
    eyebrow: optionalText, heading: text("heading"), intro: optionalText,
    items: z.array(z.object({
      title: text("card title"), description: text("card text"),
      image: optionalImageSchema, link: optionalLinkSchema,
    })).min(1, "add at least one card"),
  }),
  z.object({
    type: z.literal("servicesOverview"), ...base,
    eyebrow: optionalText, heading: text("heading"), button: optionalLinkSchema,
  }),
  z.object({ type: z.literal("servicesIndex"), ...base }),
  z.object({ type: z.literal("testimonials"), ...base, eyebrow: optionalText, heading: text("heading") }),
  z.object({
    type: z.literal("faq"), ...base,
    eyebrow: optionalText, heading: text("heading"),
    items: z.array(faqItem).min(1, "add at least one question"),
    /** FAQPage structured data. One per page — see the page-level check. */
    structuredData: z.boolean().default(true),
  }),
  z.object({
    type: z.literal("pricing"), ...base,
    eyebrow: optionalText, heading: text("heading"),
    items: z.array(entry).min(1, "add at least one pricing factor"),
    note: optionalText,
  }),
  z.object({
    type: z.literal("caseStudies"), ...base,
    eyebrow: optionalText, heading: text("heading"),
    items: z.array(z.object({
      category: text("category"), title: text("title"),
      challenge: text("challenge"), approach: text("approach"), outcome: text("outcome"),
    })).min(1, "add at least one case study"),
  }),
  z.object({
    type: z.literal("cta"), ...base,
    eyebrow: optionalText, heading: text("heading"), description: optionalText, button: linkSchema,
  }),
  z.object({
    type: z.literal("leadership"), ...base,
    eyebrowLead: optionalText, eyebrowAccent: optionalText,
    name: text("name"), role: text("role"), organisation: optionalText,
    photo: imageSchema,
    paragraphs: z.array(text("paragraph")).min(1, "add at least one paragraph"),
    conversationButton: linkSchema,
    profileButton: optionalLinkSchema,
    profileLinks: z.array(z.object({
      platform: z.enum(["LinkedIn", "Instagram", "YouTube", "X", "Facebook", "Website"]),
      url: z.string().trim().url().startsWith("https://", "must be an https:// link"),
    })).max(6).default([]),
  }),
  z.object({
    type: z.literal("story"), ...base,
    eyebrowLead: optionalText, eyebrowAccent: optionalText,
    lead: text("opening line"), paragraphs: z.array(text("paragraph")).min(1),
    principles: z.array(entry).default([]),
  }),
  z.object({
    type: z.literal("consultationForm"), ...base,
    badge: text("badge"), heading: text("heading"), intro: text("introduction"), requiredNote: optionalText,
  }),
  z.object({
    type: z.literal("contact"), ...base,
    eyebrow: optionalText, conversationHeading: text("heading"), conversationBody: text("text"),
    conversationButton: linkSchema, showMessageForm: z.boolean().default(true),
  }),
  z.object({ type: z.literal("newsletter"), ...base, heading: text("heading"), body: text("body") }),
  z.object({
    type: z.literal("legal"), ...base,
    lastUpdated: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "must be a date, e.g. 2026-10-01"),
    notice: optionalText,
    items: z.array(z.object({ heading: text("heading"), body: text("text") })).min(1),
  }),
  z.object({
    type: z.literal("image"), ...base,
    image: imageSchema, caption: optionalText,
    shape: z.enum(["wide", "landscape", "square"]).default("wide"),
  }),
]);

export type Section = z.infer<typeof sectionSchema>;
export type SectionOf<T extends Section["type"]> = Extract<Section, { type: T }>;

/** Paths the site owns outright, so a page can never be created on top of them. */
export const RESERVED_PATHS = ["/services", "/admin", "/staff", "/style-guide", "/sitemap.xml", "/robots.txt", "/_next", "/_preview", "/brand"];

/** The pages the site cannot work without. Their file can be edited, not removed or moved. */
export const CORE_PAGES: Record<string, string> = {
  home: "/", about: "/about", services: "/services", industries: "/industries",
  "case-studies": "/case-studies", pricing: "/pricing", contact: "/contact",
  "book-consultation": "/book-consultation", "book-appointment": "/book-appointment",
  "privacy-policy": "/privacy-policy", "terms-and-conditions": "/terms-and-conditions",
};

export const pagePathSchema = z
  .string()
  .trim()
  .regex(/^\/([a-z0-9]+(-[a-z0-9]+)*(\/[a-z0-9]+(-[a-z0-9]+)*)*)?$/, "must look like /my-page — lowercase words and hyphens");

export const pageSchema = z
  .object({
    title: text("page name"),
    path: pagePathSchema,
    status: z.enum(["published", "hidden"]).default("published"),
    layout: z.enum(["standard", "flow"]).default("standard"),
    seo: z.object({
      title: optionalText,
      description: optionalText,
      image: optionalImageSchema,
      noindex: z.boolean().default(false),
      lastReviewed: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "must be a date, e.g. 2026-10-01"),
    }),
    sections: z.array(sectionSchema).min(1, "a page needs at least one section"),
  })
  .superRefine((page, ctx) => {
    const visible = page.sections.filter((s) => !s.hidden);
    if (page.status === "published" && visible.length === 0)
      ctx.addIssue({ code: "custom", message: "every section is hidden — hide the page instead", path: ["sections"] });
    const heroes = visible.filter((s) => s.type === "homeHero" || s.type === "pageHero");
    if (heroes.length > 1)
      ctx.addIssue({ code: "custom", message: "only one visible hero per page (it carries the page's main heading)", path: ["sections"] });
    if (visible.filter((s) => s.type === "faq" && s.structuredData).length > 1)
      ctx.addIssue({ code: "custom", message: "only one FAQ section per page can publish FAQ structured data", path: ["sections"] });
    const anchors = visible.map((s) => s.anchor).filter(Boolean);
    if (new Set(anchors).size !== anchors.length)
      ctx.addIssue({ code: "custom", message: "two sections share the same anchor", path: ["sections"] });
    if (page.seo.description && page.seo.description.length > 170)
      ctx.addIssue({ code: "custom", message: "search description is over 170 characters and will be cut off", path: ["seo", "description"] });
  });

export type Page = z.infer<typeof pageSchema> & { id: string };
