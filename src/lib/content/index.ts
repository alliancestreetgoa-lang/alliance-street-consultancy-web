import servicesJson from "@/content/services.json";
import directAnswersJson from "@/content/direct-answers.json";
import groupImagesJson from "@/content/group-images.json";
import siteJson from "@/content/site.json";

import type { DirectAnswer, Service as ServiceBase, SiteContent } from "./schema";

/**
 * Typed access to the CMS-managed content.
 *
 * Deliberately does NOT validate at import time. Several consumers are client
 * components, so validating here would ship zod and every schema in the browser
 * bundle for a check whose answer is already fixed at build time. Validation
 * runs where it can still change the outcome instead: `npm test` and the
 * `validate-content` prebuild gate, both of which fail the build before a
 * malformed edit can be deployed.
 */

export type { DirectAnswer, SiteContent };

/** A service plus its sourced answer, where one exists. */
export type Service = ServiceBase & { directAnswer?: DirectAnswer };

/** Indexed by slug for lookup; the file itself is a list, for the CMS's sake. */
export const DIRECT_ANSWERS: Record<string, DirectAnswer> = Object.fromEntries(
  (directAnswersJson.answers as (DirectAnswer & { slug: string })[]).map(({ slug, ...answer }) => [
    slug,
    answer,
  ])
);

export const GROUP_IMAGES = groupImagesJson as Record<
  ServiceBase["group"],
  { src: string; alt: string; caption: string; aspectClassName: string }
>;

/**
 * Sourced answers are joined on slug rather than nested in services.json, so
 * the CMS can present them as a separate collection with its own stricter
 * schema — and so a service can be edited without touching its tax figures.
 */
export const SERVICES: Service[] = (servicesJson.services as ServiceBase[]).map((service) => {
  const directAnswer = DIRECT_ANSWERS[service.slug];
  return directAnswer ? { ...service, directAnswer } : service;
});

const site = siteJson as SiteContent;

export const COMPANY = site.company;
export const PRIMARY_NAV = site.primaryNav;
export const NAV_GROUPS = site.navGroups;
export const SEO = site.seo;

export function getService(category: string, slug: string) {
  return SERVICES.find((service) => service.category === category && service.slug === slug);
}
