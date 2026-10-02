import { z } from "zod";
import { hrefSchema } from "./page-schema";

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
  search: z.object({
    title: nonEmpty("search title"),
    description: nonEmpty("search description"),
    overview: nonEmpty("service overview"),
    preparation: nonEmpty("preparation checklist"),
    faqs: z.array(z.object({ question: nonEmpty("question"), answer: nonEmpty("answer") })).min(1),
  }).optional(),
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

/** A list carrying its group, for the same reason direct answers are a list. */
export const groupImagesSchema = z
  .array(groupImageSchema.extend({ group: z.enum(SERVICE_GROUPS) }))
  .superRefine((images, ctx) => {
    const seen = new Set<string>();
    for (const i of images) {
      if (seen.has(i.group)) {
        ctx.addIssue({
          code: "custom",
          message: `two images both claim the "${i.group}" section`,
          path: ["group"],
        });
      }
      seen.add(i.group);
    }
  });

const navLinkSchema = z.object({
  label: nonEmpty("label"),
  href: nonEmpty("href").startsWith("/", "must be a site-relative path"),
  description: z.string().trim().optional(),
});

const buttonSchema = z.object({ label: nonEmpty("button label"), href: hrefSchema });
const logoSchema = z.string().regex(/^\/brand\/[^/]+\.(png|webp|svg)$/i, "choose a logo from the media library");

export const siteSchema = z.object({
  seo: z.object({
    siteName: nonEmpty("site name"),
    defaultTitle: nonEmpty("default title"),
    /** Must contain %s, which Next replaces with the page's own title. */
    titleTemplate: z
      .string()
      .includes("%s", { message: "must contain %s, where the page name goes" }),
    defaultDescription: nonEmpty("default description"),
    /** Fallback social-sharing image for pages without their own. */
    shareImage: z.object({ src: z.string().regex(/^\/brand\/[^/]+\.(jpe?g|png|webp)$/i, "choose an image from the media library"), alt: nonEmpty("share image description") }),
  }),
  company: z.object({
    name: nonEmpty("company name"),
    email: z.string().email(),
    phone: nonEmpty("phone"),
    /** E.164, for `tel:` hrefs and schema.org telephone. */
    phoneHref: z.string().regex(/^\+\d{7,15}$/, "must be E.164, e.g. +97142627928"),
    whatsapp: z.string().nullable(),
    address: nonEmpty("address"),
    socialLinks: z.array(z.object({
      platform: z.enum(["LinkedIn", "Instagram", "YouTube"]),
      url: z.string().url().startsWith("https://"),
    })).max(3),
  }),
  header: z.object({
    brandName: nonEmpty("brand name"),
    logo: logoSchema,
    servicesMenuLabel: nonEmpty("services menu label"),
    button: buttonSchema,
  }),
  primaryNav: z.array(navLinkSchema).min(1),
  navGroups: z
    .array(z.object({ title: nonEmpty("group title"), links: z.array(navLinkSchema).min(1) }))
    .min(1),
  footer: z.object({
    brandName: nonEmpty("brand name"),
    logo: logoSchema,
    heading: nonEmpty("heading"),
    button: buttonSchema,
    columns: z.array(z.object({ title: nonEmpty("column title"), links: z.array(z.object({ label: nonEmpty("label"), href: hrefSchema })).min(1) })).min(1).max(4),
    copyright: nonEmpty("copyright line"),
  }),
});

const copy = (label: string) => nonEmpty(label);

export const formsSchema = z.object({
  /** Where "Open calendar" sends a visitor. Opening it is not a confirmed booking. */
  appointmentUrl: z.string().url().startsWith("https://", "must be an https:// link"),
  consultation: z.object({
    stepOneNote: copy("step one note"),
    labels: z.object({
      name: copy("name label"), country: copy("country label"), email: copy("email label"), phone: copy("phone label"),
      address: copy("address label"), services: copy("services label"), notes: copy("notes label"),
    }),
    phoneHint: copy("phone hint"), servicesHint: copy("services hint"), optionalLabel: copy("optional label"),
    notesPlaceholder: z.string(), consentText: copy("consent text"), privacyLinkLabel: copy("privacy link label"),
    continueButton: copy("continue button"), savingButton: copy("saving button"), saveError: copy("save error"),
    stepTwoHeading: copy("step two heading"), stepTwoIntro: copy("step two introduction"), reviewDetails: copy("review details"),
    enquiryHeading: copy("enquiry heading"), enquiryBody: copy("enquiry text"), enquiryButton: copy("enquiry button"),
    enquirySavedButton: copy("enquiry saved button"), enquirySavedMessage: copy("enquiry saved message"),
    appointmentHeading: copy("appointment heading"), appointmentBody: copy("appointment text"), appointmentButton: copy("appointment button"),
    appointmentSavedMessage: copy("appointment saved message"), openCalendarButton: copy("open calendar button"),
    appointmentFootnote: copy("appointment footnote"), choiceSaving: copy("choice saving"), choiceError: copy("choice error"),
    editDetails: copy("edit details"),
  }),
  contact: z.object({
    labels: z.object({ name: copy("name label"), email: copy("email label"), message: copy("message label") }),
    submitButton: copy("submit button"), sendingButton: copy("sending button"), notConnectedMessage: copy("message"),
  }),
  newsletter: z.object({
    emailLabel: copy("email label"), placeholder: z.string(), button: copy("button"),
    submittingButton: copy("submitting button"), thanksMessage: copy("thanks message"),
  }),
});

export const servicePageSchema = z.object({
  breadcrumbPrefix: copy("breadcrumb prefix"),
  bookButton: buttonSchema,
  howWeHelpHeading: copy("heading"), sourcesLabel: copy("sources label"), verifiedLabel: copy("verified label"),
  disclaimer: copy("disclaimer"), includedHeading: copy("heading"), preparationHeading: copy("heading"),
  faqHeading: copy("heading"), whoForHeading: copy("heading"), relatedHeading: copy("heading"),
  showClosingCta: z.boolean(),
});

export const themeSchema = z.object({
  accent: z.enum(["alliance-red", "crimson", "burgundy"]),
  font: z.enum(["inter", "system"]),
  textSize: z.enum(["standard", "large"]),
  sectionSpacing: z.enum(["compact", "standard", "spacious"]),
  motion: z.enum(["full", "off"]),
  openingAnimation: z.boolean(),
});

export type Service = z.infer<typeof serviceSchema>;
export type DirectAnswer = z.infer<typeof directAnswerSchema>;
export type SiteContent = z.infer<typeof siteSchema>;

/** Service-specific hero artwork, stored as a CMS-editable list. */
export const serviceHeroImagesSchema = z.array(z.object({
  service: nonEmpty("service").regex(/^(uae|uk|advisory)\/[a-z0-9]+(?:-[a-z0-9]+)*$/, "must match an area/service-slug"),
  src: nonEmpty("src").regex(/^\/brand\/[^/]+\.(jpe?g|png|webp)$/i, "use a local image in /brand/"),
  alt: nonEmpty("alt"),
}));

export const testimonialsSchema = z.array(
  z.object({
    quote: z.string().trim().min(1, "each testimonial needs a quote"),
    name: z.string().trim().min(1, "each testimonial needs a name"),
    role: z.string().trim().min(1, "each testimonial needs a role"),
    location: z.string().optional(),
    service: z.string().optional(),
    /** Only quotes the client agreed to publish. Unapproved ones show only in local development. */
    approved: z.boolean(),
  })
);
