import { describe, expect, it } from "vitest";
import { z } from "zod";

import services from "@/content/services.json";
import directAnswers from "@/content/direct-answers.json";
import groupImages from "@/content/group-images.json";
import site from "@/content/site.json";
import aboutExpertise from "@/content/sections/about-expertise.json";
import aboutPrinciples from "@/content/sections/about-principles.json";
import caseStudies from "@/content/sections/case-studies.json";
import differentiators from "@/content/sections/differentiators.json";
import headlines from "@/content/sections/headlines.json";
import homeFaq from "@/content/sections/home-faq.json";
import industries from "@/content/sections/industries.json";
import pricingFactors from "@/content/sections/pricing-factors.json";
import process_ from "@/content/sections/process.json";
import servicePreview from "@/content/sections/service-preview.json";

import {
  caseStudySchema,
  directAnswersSchema,
  entriesSchema,
  faqSchema,
  groupImagesSchema,
  servicesSchema,
  siteSchema,
  SERVICE_GROUPS,
} from "@/lib/content/schema";

/**
 * The publish gate.
 *
 * After handover the client edits these files through the CMS with nobody
 * reviewing the diff, so this suite is the only thing standing between a
 * malformed edit and production. It runs in `npm test` and again in `prebuild`,
 * which means a bad edit fails the build rather than deploying.
 *
 * Failures here should read as instructions to a non-developer, which is why
 * the schemas carry human-readable messages.
 */

/** Reports zod's path + message rather than a wall of JSON. */
function check(label: string, schema: z.ZodType, value: unknown) {
  const result = schema.safeParse(value);
  if (!result.success) {
    const lines = result.error.issues.map(
      (i) => `  ${label}${i.path.length ? ` → ${i.path.join(".")}` : ""}: ${i.message}`
    );
    throw new Error(`${label} is not publishable:\n${lines.join("\n")}`);
  }
}

describe("content schemas", () => {
  it("services.json", () => check("services.json", servicesSchema, services.services));
  it("direct-answers.json", () => check("direct-answers.json", directAnswersSchema, directAnswers.answers));
  it("group-images.json", () => check("group-images.json", groupImagesSchema, groupImages.images));
  it("site.json", () => check("site.json", siteSchema, site));

  it.each([
    ["about-expertise", aboutExpertise],
    ["about-principles", aboutPrinciples],
    ["differentiators", differentiators],
    ["industries", industries],
    ["pricing-factors", pricingFactors],
    ["process", process_],
  ])("sections/%s.json", (name, value) => check(`sections/${name}.json`, entriesSchema, (value as { items: unknown }).items));

  it("sections/home-faq.json", () => check("sections/home-faq.json", faqSchema, homeFaq.items));
  it("sections/case-studies.json", () =>
    check("sections/case-studies.json", caseStudySchema, caseStudies.items));

  it("sections/headlines.json", () =>
    check(
      "sections/headlines.json",
      z.object({ home: z.string().min(1), about: z.string().min(1), caseStudies: z.string().min(1) }),
      headlines
    ));

  it("sections/service-preview.json", () =>
    check(
      "sections/service-preview.json",
      z.array(z.object({ title: z.string().min(1), description: z.string().min(1), href: z.string().startsWith("/") })).min(1),
      servicePreview.items
    ));
});

describe("content integrity", () => {
  const routes = new Set(services.services.map((s) => `/services/${s.category}/${s.slug}`));

  it("attaches every sourced answer to a service that exists", () => {
    const slugs = new Set(services.services.map((s) => s.slug));
    const orphans = directAnswers.answers.map((a) => a.slug).filter((slug) => !slugs.has(slug));
    expect(orphans, "a sourced answer names a service that no longer exists").toEqual([]);
  });

  it("has an image for every service group in use", () => {
    const used = [...new Set(services.services.map((s) => s.group))];
    const have = new Set(groupImages.images.map((i) => i.group));
    const missing = used.filter((g) => !have.has(g));
    expect(missing).toEqual([]);
  });

  it("points every nav link at a page that exists", () => {
    const pages = new Set([
      ...routes,
      ...site.primaryNav.map((l) => l.href),
    ]);
    const orphans = site.navGroups
      .flatMap((g) => g.links.map((l) => l.href))
      .filter((href) => !pages.has(href));
    expect(orphans, "a dropdown link points at a service route that does not exist").toEqual([]);
  });

  it("surfaces every service somewhere in the nav", () => {
    const linked = new Set(site.navGroups.flatMap((g) => g.links.map((l) => l.href)));
    const unreachable = [...routes].filter((r) => !linked.has(r));
    expect(unreachable, "a service exists but nothing links to it").toEqual([]);
  });

  it("files every service under a nav group of the same name", () => {
    const navTitles = new Set(site.navGroups.map((g) => g.title));
    const stray = [...new Set(services.services.map((s) => s.group))].filter((g) => !navTitles.has(g));
    expect(stray).toEqual([]);
  });

  it("uses only known service groups", () => {
    const stray = [...new Set(services.services.map((s) => s.group))].filter(
      (g) => !(SERVICE_GROUPS as readonly string[]).includes(g)
    );
    expect(stray).toEqual([]);
  });

  it("links the service preview at real service pages", () => {
    const orphans = servicePreview.items.map((s) => s.href).filter((h) => !routes.has(h));
    expect(orphans).toEqual([]);
  });
});
