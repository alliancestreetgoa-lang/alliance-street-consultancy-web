import type { MetadataRoute } from "next";
import { SERVICES } from "@/lib/services-data";
import { SITE_URL } from "@/lib/site-url";
import { getPublishedPages } from "@/lib/content/pages";

export const dynamic = "force-static";

/**
 * Published, indexable pages plus every service page. `lastModified` is the
 * page's editorial "last reviewed" date from the CMS — never the build time,
 * which would claim every page changed on every deploy.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    ...getPublishedPages()
      .filter((page) => !page.seo.noindex)
      .map((page) => ({
        url: page.path === "/" ? SITE_URL : `${SITE_URL}${page.path}`,
        lastModified: page.seo.lastReviewed,
      })),
    ...SERVICES.map((service) => ({
      url: `${SITE_URL}/services/${service.category}/${service.slug}`,
      lastModified: "2026-10-01",
    })),
  ];
}
