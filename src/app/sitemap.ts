import type { MetadataRoute } from "next";
import { SERVICES } from "@/lib/services-data";
import { SITE_URL } from "@/lib/site-url";

export const dynamic = "force-static";

// Editorial dates: update only after a meaningful page change, never on every build.
const routes = [
  ["/", "2026-10-01"], ["/about", "2026-10-01"],
  ["/services", "2026-10-01"], ["/industries", "2026-10-01"],
  ["/case-studies", "2026-10-01"], ["/pricing", "2026-10-01"],
  ["/contact", "2026-10-01"], ["/book-appointment", "2026-10-01"], ["/book-consultation", "2026-08-10"],
  ["/privacy-policy", "2026-07-21"], ["/terms-and-conditions", "2026-07-21"],
];

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    ...routes.map(([path, lastModified]) => ({ url: path === "/" ? SITE_URL : `${SITE_URL}${path}`, lastModified })),
    ...SERVICES.map((service) => ({
      url: `${SITE_URL}/services/${service.category}/${service.slug}`,
      lastModified: "2026-10-01",
    })),
  ];
}
