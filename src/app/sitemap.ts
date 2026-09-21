// src/app/sitemap.ts
//
// Generated statically at build time (this project uses `output: "export"`
// in next.config.ts, so sitemap.ts must not use any request-time APIs —
// it doesn't). Output lands at /sitemap.xml in the exported `out/` folder.
import type { MetadataRoute } from "next";
import { SERVICES } from "@/lib/services-data";
import { SITE_URL } from "@/lib/site-url";

// Required under `output: "export"` — see the note in robots.ts. Without it
// this route throws at request time instead of rendering a static sitemap.xml.
export const dynamic = "force-static";

// Production domain is not configured yet — see src/lib/site-url.ts for the
// full explanation and the steps to set it before launch.
const BASE_URL = SITE_URL;

type ChangeFrequency = NonNullable<MetadataRoute.Sitemap[number]["changeFrequency"]>;

type StaticRoute = {
  path: string;
  /**
   * Real last-significant-change date pulled from `git log -1 --format=%cI`
   * on the route's page.tsx at the time this sitemap was authored
   * (2026-08-11). These are NOT auto-updating — if you edit a page's
   * meaningful content, update its date here (or wire this file up to a
   * build-time git script so it stays accurate automatically).
   */
  lastModified: string;
  // Ignored by Google; kept only for other engines/tools and as documentation
  // of update cadence intent. Safe to delete entirely if you'd rather not
  // carry deprecated fields at all — see audit findings.
  changeFrequency: ChangeFrequency;
  priority: number;
};

const STATIC_ROUTES: StaticRoute[] = [
  { path: "/", lastModified: "2026-08-10", changeFrequency: "monthly", priority: 1.0 },
  { path: "/about", lastModified: "2026-07-21", changeFrequency: "monthly", priority: 0.6 },
  { path: "/services", lastModified: "2026-07-22", changeFrequency: "monthly", priority: 0.9 },
  { path: "/industries", lastModified: "2026-07-22", changeFrequency: "monthly", priority: 0.7 },
  { path: "/case-studies", lastModified: "2026-07-22", changeFrequency: "monthly", priority: 0.6 },
  { path: "/pricing", lastModified: "2026-07-22", changeFrequency: "monthly", priority: 0.8 },
  // `monthly`, not `weekly`: the page is currently a "coming soon" stub with no
  // article listing. Revisit once it actually publishes on a cadence.
  { path: "/book-consultation", lastModified: "2026-08-10", changeFrequency: "yearly", priority: 0.8 },
  { path: "/contact", lastModified: "2026-07-21", changeFrequency: "yearly", priority: 0.5 },
  { path: "/privacy-policy", lastModified: "2026-07-21", changeFrequency: "yearly", priority: 0.1 },
  { path: "/terms-and-conditions", lastModified: "2026-07-21", changeFrequency: "yearly", priority: 0.1 },
];

// /style-guide is an internal design-system reference (tokens, swatches,
// component demos) — not a public marketing page. Deliberately EXCLUDED from
// the sitemap and marked `noindex` on the page itself
// (see src/app/style-guide/page.tsx). Do not add it here.

// Real, up-to-date lastModified for every generated /services/[category]/[slug]
// page: the entire catalog is driven by src/lib/services-data.ts, so the last
// commit that touched that single file IS the last significant content change
// for every service page (verified via `git log -1 -- src/lib/services-data.ts`).
const SERVICES_DATA_LAST_MODIFIED = "2026-07-22";

export default function sitemap(): MetadataRoute.Sitemap {
  const staticEntries: MetadataRoute.Sitemap = STATIC_ROUTES.map((route) => ({
    url: `${BASE_URL}${route.path}`,
    lastModified: route.lastModified,
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }));

  const serviceEntries: MetadataRoute.Sitemap = SERVICES.map((service) => ({
    url: `${BASE_URL}/services/${service.category}/${service.slug}`,
    lastModified: SERVICES_DATA_LAST_MODIFIED,
    changeFrequency: "monthly",
    priority: 0.7,
  }));

  return [...staticEntries, ...serviceEntries];
}
