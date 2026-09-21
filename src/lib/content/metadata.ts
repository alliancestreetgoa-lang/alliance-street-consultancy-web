import type { Metadata } from "next";

import pagesJson from "@/content/pages.json";
import siteJson from "@/content/site.json";

/**
 * Builds a page's metadata from CMS content.
 *
 * Replaces a block that was repeated in every page file, where the title and
 * description each appeared three times — once for the page, once for
 * OpenGraph, once for Twitter. That duplication is how a page ends up with an
 * OG title that no longer matches its real one, and it made the copy
 * effectively uneditable by anyone but a developer.
 *
 * A page with no entry in pages.json inherits the site defaults from the root
 * layout, which is what the homepage deliberately does: the layout's
 * `title.default` is already the site's full title, so overriding it there
 * would only duplicate the brand name.
 */

const site = siteJson as { seo: { siteName: string; titleTemplate: string } };
const pages = pagesJson.pages as Record<string, { title?: string; description?: string }>;

export function pageMetadata(route: string): Metadata {
  const page = pages[route];

  if (!page) {
    // Canonical still has to be self-referencing — see the note in layout.tsx
    // about why no canonical is set at the layout level.
    return { alternates: { canonical: route }, openGraph: { url: route } };
  }

  const { title, description } = page;
  // The layout applies `titleTemplate` to page titles, but OpenGraph takes a
  // literal string, so the brand suffix is applied here rather than left off.
  const fullTitle = title ? site.seo.titleTemplate.replace("%s", title) : undefined;

  return {
    ...(title ? { title } : {}),
    ...(description ? { description } : {}),
    alternates: { canonical: route },
    openGraph: {
      url: route,
      ...(fullTitle ? { title: fullTitle } : {}),
      ...(description ? { description } : {}),
    },
  };
}
