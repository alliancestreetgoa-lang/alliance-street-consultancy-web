import type { Metadata } from "next";

import { absoluteUrl } from "@/lib/schema";
import siteJson from "@/content/site.json";
import type { Page } from "./page-schema";

/**
 * Builds a page's metadata from its CMS entry.
 *
 * Title and description each appear three times in the output (page, Open
 * Graph, Twitter) but once in the content, so they cannot drift apart.
 *
 * A page whose SEO title/description are left blank inherits the site defaults
 * from the root layout — which is what the homepage deliberately does, because
 * the layout's `title.default` is already the site's full title.
 *
 * `noindex` is only ever *added* here. Leaving robots unset otherwise lets the
 * layout's review-host noindex keep applying to every page.
 */
const site = siteJson as { seo: { siteName: string; titleTemplate: string; shareImage: { src: string; alt: string } } };
const FALLBACK_IMAGE = site.seo.shareImage;

export function pageMetadata(page: Page): Metadata {
  const { title, description, noindex } = page.seo;
  const fullTitle = title ? site.seo.titleTemplate.replace("%s", title) : undefined;
  const image = page.seo.image?.src ? page.seo.image : FALLBACK_IMAGE;
  const images = [{ url: absoluteUrl(image.src), alt: image.alt || fullTitle || site.seo.siteName }];

  return {
    ...(title ? { title } : {}),
    ...(description ? { description } : {}),
    ...(noindex ? { robots: { index: false, follow: true } } : {}),
    alternates: { canonical: page.path },
    twitter: {
      card: "summary_large_image",
      ...(fullTitle ? { title: fullTitle } : {}),
      ...(description ? { description } : {}),
      images,
    },
    openGraph: {
      images,
      type: "website",
      siteName: site.seo.siteName,
      url: page.path,
      ...(fullTitle ? { title: fullTitle } : {}),
      ...(description ? { description } : {}),
    },
  };
}
