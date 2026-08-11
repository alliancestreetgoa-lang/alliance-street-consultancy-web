// src/lib/schema.ts
//
// JSON-LD builders. Everything absolute routes through SITE_URL so the schema,
// the sitemap and `metadataBase` can never disagree about what this site is.
//
// Guiding rule for this file: emit nothing that isn't true. Several obvious
// fields are deliberately absent rather than filled with plausible values —
// each omission is commented where it occurs. A schema block that asserts a
// fake phone number or an invented office is worse than no schema at all,
// because it's machine-readable and gets believed.
import { COMPANY } from "@/lib/site-config";
import type { Service } from "@/lib/services-data";
import { SITE_URL } from "@/lib/site-url";

export const ORGANIZATION_ID = `${SITE_URL}/#organization`;
export const WEBSITE_ID = `${SITE_URL}/#website`;

export function absoluteUrl(path: string) {
  return `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}

/** XSS-safe props for injecting JSON-LD, per the Next.js json-ld guide. */
export function jsonLdScriptProps(data: unknown) {
  return {
    type: "application/ld+json" as const,
    dangerouslySetInnerHTML: {
      __html: JSON.stringify(data).replace(/</g, "\\u003c"),
    },
  };
}

export function buildOrganizationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "ProfessionalService",
    "@id": ORGANIZATION_ID,
    name: COMPANY.name,
    url: SITE_URL,
    logo: absoluteUrl("/brand/logo-mark.png"),
    image: absoluteUrl("/brand/logo-mark.png"),
    email: COMPANY.email,
    telephone: COMPANY.phone,
    address: {
      "@type": "PostalAddress",
      // Business Bay is a district, not a street address. This is the most
      // precise value that is actually true today; upgrade to building/office
      // once the real address is available, and add `geo` at the same time.
      streetAddress: "Business Bay",
      addressLocality: "Dubai",
      addressRegion: "Dubai",
      addressCountry: "AE",
    },
    // The firm sells into both markets but no UK address or UK phone exists
    // anywhere in this codebase. Modelling the UK as `areaServed` is honest;
    // inventing a second PostalAddress to look established would be fake-NAP.
    areaServed: [
      { "@type": "Country", name: "United Arab Emirates" },
      { "@type": "Country", name: "United Kingdom" },
    ],
    serviceType: [
      "Company formation",
      "Corporate tax advisory",
      "VAT compliance",
      "Bookkeeping and accounting",
      "CFO advisory services",
    ],
    // No `sameAs`: there are no social profiles linked anywhere on the site to
    // point at. Add them when they exist — sameAs is one of the strongest
    // entity-corroboration signals available and it's currently unused.
  };
}

export function buildWebsiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": WEBSITE_ID,
    name: COMPANY.name,
    url: SITE_URL,
    publisher: { "@id": ORGANIZATION_ID },
    inLanguage: "en",
    // No `potentialAction`/SearchAction: the site has no search endpoint.
  };
}

type BreadcrumbItem = { name: string; path: string };

export function buildBreadcrumbJsonLd(items: BreadcrumbItem[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}

const SERVICE_AREA: Record<Service["category"], object | object[]> = {
  uae: { "@type": "Country", name: "United Arab Emirates" },
  uk: { "@type": "Country", name: "United Kingdom" },
  advisory: [
    { "@type": "Country", name: "United Arab Emirates" },
    { "@type": "Country", name: "United Kingdom" },
  ],
};

export function buildServiceJsonLd(service: Service) {
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    name: service.title,
    description: service.tagline,
    serviceType: service.title,
    provider: { "@id": ORGANIZATION_ID },
    areaServed: SERVICE_AREA[service.category],
    url: absoluteUrl(`/services/${service.category}/${service.slug}`),
    audience: { "@type": "Audience", audienceType: service.whoFor },
    // No `offers`/`price`: /pricing publishes no figures by design. Inventing
    // one to win a rich result would be a spam-policy problem, not a shortcut.
  };
}
