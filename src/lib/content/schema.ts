import { z } from "zod";

/**
 * Schemas for everything the CMS can edit.
 *
 * These are the contract between the editor and the site. The CMS writes JSON;
 * these decide whether that JSON is publishable. Validation runs in
 * `npm test` and again in `prebuild`, so a malformed or incomplete edit fails
 * the build instead of reaching production — which matters more than usual
 * here, because after handover nobody is reviewing a diff before it ships.
 *
 * Rules encoded here rather than left to editorial discipline:
 *  - a sourced tax answer cannot exist without sources and a verification date
 *  - a nav link cannot point at a service that does not exist
 *  - a slug cannot collide with another slug
 */

const nonEmpty = (label: string) => z.string().trim().min(1, `${label} cannot be empty`);

/** URL-safe, lowercase, hyphenated. Becomes a public route segment. */
export const slugSchema = z
  .string()
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "must be lowercase words separated by single hyphens");

export const SERVICE_CATEGORIES = ["uae", "uk", "advisory"] as const;
export const SERVICE_GROUPS = [
  "UAE Setup",
  "UAE Tax & Compliance",
  "UK Services",
  "Advisory",
] as const;

/**
 * A sourced answer to the regulatory question a service page implies.
 *
 * Every field is required. This is the guardrail on YMYL content: an editor can
 * change a rate or a threshold, but cannot publish one without naming the
 * primary source it came from and the date a human last checked it. A figure
 * with no source fails the build rather than going live unattributed.
 */
export const directAnswerSchema = z.object({
  question: nonEmpty("question"),
  answer: nonEmpty("answer"),
  sources: z
    .array(
      z.object({
        label: nonEmpty("source label"),
        // http(s) only: a source a reader cannot open is not a source.
        url: z.string().url("must be a full URL").startsWith("http"),
      })
    )
    .min(1, "a figure needs at least one primary source"),
  verifiedOn: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "must be an ISO date, e.g. 2026-09-21")
    .refine((d) => !Number.isNaN(Date.parse(d)), "is not a real date"),
});

export const serviceSchema = z.object({
  category: z.enum(SERVICE_CATEGORIES),
  group: z.enum(SERVICE_GROUPS),
  slug: slugSchema,
  title: nonEmpty("title"),
  tagline: nonEmpty("tagline"),
  includes: z.array(nonEmpty("an included item")).min(1, "list at least one thing included"),
  whoFor: nonEmpty("whoFor"),
});

export const servicesSchema = z
  .array(serviceSchema)
  .min(1)
  .superRefine((services, ctx) => {
    const seen = new Set<string>();
    for (const s of services) {
      if (seen.has(s.slug)) {
        ctx.addIssue({ code: "custom", message: `duplicate slug "${s.slug}"`, path: ["slug"] });
      }
      seen.add(s.slug);
    }
  });

/**
 * A list, not an object keyed by slug. A CMS form can add a row to a list; it
 * cannot invent a new object key, which made the keyed shape uneditable.
 * `slug` says which service the answer belongs to, and the validator checks
 * that the service exists.
 */
export const directAnswersSchema = z
  .array(directAnswerSchema.extend({ slug: slugSchema }))
  .superRefine((answers, ctx) => {
    const seen = new Set<string>();
    for (const a of answers) {
      if (seen.has(a.slug)) {
        ctx.addIssue({
          code: "custom",
          message: `two sourced answers both claim the service "${a.slug}"`,
          path: ["slug"],
        });
      }
      seen.add(a.slug);
    }
  });

export const groupImageSchema = z.object({
  src: nonEmpty("src"),
  alt: nonEmpty("alt"),
  caption: nonEmpty("caption"),
  aspectClassName: nonEmpty("aspectClassName"),
});

export const groupImagesSchema = z.record(z.enum(SERVICE_GROUPS), groupImageSchema);

const navLinkSchema = z.object({
  label: nonEmpty("label"),
  href: nonEmpty("href").startsWith("/", "must be a site-relative path"),
  description: z.string().trim().optional(),
});

export const siteSchema = z.object({
  company: z.object({
    name: nonEmpty("company name"),
    email: z.string().email(),
    phone: nonEmpty("phone"),
    /** E.164, for `tel:` hrefs and schema.org telephone. */
    phoneHref: z.string().regex(/^\+\d{7,15}$/, "must be E.164, e.g. +97142627928"),
    whatsapp: z.string().nullable(),
    address: nonEmpty("address"),
  }),
  primaryNav: z.array(navLinkSchema).min(1),
  navGroups: z
    .array(z.object({ title: nonEmpty("group title"), links: z.array(navLinkSchema).min(1) }))
    .min(1),
});

/** A heading plus body, the shape most of the site's section datasets share. */
export const entrySchema = z.object({
  title: nonEmpty("title"),
  description: nonEmpty("description"),
});

export const entriesSchema = z.array(entrySchema).min(1);

export const faqSchema = z
  .array(z.object({ question: nonEmpty("question"), answer: nonEmpty("answer") }))
  .min(1);

export const caseStudySchema = z
  .array(
    z.object({
      // Named `category` but holds a service *group* — the label the case study
      // is filed under in the UI. Kept as-is rather than renamed: the component
      // and the CMS field label both read fine, and renaming would churn the
      // content file for no editorial gain.
      category: z.enum(SERVICE_GROUPS),
      title: nonEmpty("title"),
      challenge: nonEmpty("challenge"),
      approach: nonEmpty("approach"),
      outcome: nonEmpty("outcome"),
    })
  )
  .min(1);

export type Service = z.infer<typeof serviceSchema>;
export type DirectAnswer = z.infer<typeof directAnswerSchema>;
export type SiteContent = z.infer<typeof siteSchema>;
export type Entry = z.infer<typeof entrySchema>;
