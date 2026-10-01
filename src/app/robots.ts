import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site-url";

export const dynamic = "force-static";

export default function robots(): MetadataRoute.Robots {
  return {
    // Includes search and answer crawlers. No robots block: crawlers must read
    // the noindex tags on review hosts, the admin page and the style guide.
    // Training-bot permissions are unchanged by this search-visibility work.
    rules: [{ userAgent: "*", allow: "/" }],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
