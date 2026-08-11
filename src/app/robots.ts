// src/app/robots.ts
//
// Renders to a static /robots.txt at build time (safe under `output: "export"`
// — this is a GET-only route handler that touches no request-time APIs).
import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site-url";

// Required under `output: "export"`. Next treats robots.ts/sitemap.ts as route
// handlers, which default to dynamic; a static export has nowhere to run them,
// so without this the route throws at request time (and the export build fails)
// even though the function itself is perfectly static. Not optional here.
export const dynamic = "force-static";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      // Answer-engine crawlers — these are the ones that fetch a page in order
      // to cite it in a live answer. Allowing them is what makes the site
      // eligible to appear in ChatGPT Search, Perplexity and Claude responses.
      { userAgent: "OAI-SearchBot", allow: "/" },
      { userAgent: "ChatGPT-User", allow: "/" },
      { userAgent: "PerplexityBot", allow: "/" },
      { userAgent: "ClaudeBot", allow: "/" },
      { userAgent: "Claude-User", allow: "/" },

      // Everything else, including Googlebot and Bingbot.
      { userAgent: "*", allow: "/" },

      // ----------------------------------------------------------------------
      // NOT SET, deliberately — these are training-data crawlers, and whether to
      // allow them is a commercial decision for the firm rather than a technical
      // one. They are distinct from the answer-engine bots above: blocking them
      // costs you no citations.
      //
      //   GPTBot          OpenAI model training. Separate from OAI-SearchBot;
      //                   blocking it does not reduce ChatGPT Search citations.
      //   Google-Extended Gemini / Vertex training. Google states it does not
      //                   affect Google Search inclusion or ranking.
      //   CCBot           Common Crawl. Feeds many third-party datasets and
      //                   sends no traffic back — cheapest one to refuse.
      //
      // To opt out, add: { userAgent: "GPTBot", disallow: "/" } etc.
      // Leaving them unlisted means the "*" rule applies and they are allowed,
      // which is the current status quo.
      // ----------------------------------------------------------------------
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}

// Deliberately NO `disallow: ["/style-guide"]` here.
//
// /style-guide is kept out of search via `robots: { index: false }` in its own
// page metadata (src/app/style-guide/page.tsx), and that is the directive that
// actually deindexes. Adding a robots.txt Disallow on top of it would be
// counterproductive rather than belt-and-suspenders: a disallowed URL is never
// fetched, so the noindex tag is never read, and the URL can still surface in
// results as a bare link if anything points at it. Google's own guidance is
// explicit that the two must not be combined for this reason.
//
// Pick one: Disallow (save crawl budget, page may still appear URL-only) or
// noindex (page is fetched, then dropped from the index). For a single
// internal page, crawl budget is irrelevant and reliable deindexing is what we
// want — so it's noindex, and crawling stays allowed so the tag is seen.
