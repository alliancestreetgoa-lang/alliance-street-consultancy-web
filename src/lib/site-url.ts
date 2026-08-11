// src/lib/site-url.ts
//
// Single source of truth for the site's absolute URL. Used by sitemap.ts,
// robots.ts, and the `metadataBase` in app/layout.tsx — all three must agree,
// so none of them should re-derive this.
//
// ---------------------------------------------------------------------------
// Current deploy target is GitHub Pages, at the project sub-path. That is set
// explicitly as NEXT_PUBLIC_SITE_URL in .github/workflows/deploy-pages.yml, so
// the fallback below is only used for local builds.
//
// Absolute URLs (sitemap <loc>, canonical tags, og:url, schema @id) are the one
// place a wrong value is actively harmful rather than merely missing — a
// canonical pointing at the wrong origin tells Google to consolidate ranking
// signals onto a URL you don't control.
//
// To move to a custom domain, all three steps are required:
//   1. Set NEXT_PUBLIC_SITE_URL to the new origin in the deploy workflow.
//   2. Add public/CNAME containing that hostname.
//   3. DELETE NEXT_PUBLIC_BASE_PATH from the workflow — basePath must be empty
//      at a domain root, or every canonical carries a sub-path segment that
//      does not exist there.
// ---------------------------------------------------------------------------
const SITE_ORIGIN =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ||
  "https://alliancestreetgoa-lang.github.io";

// Mirrors `basePath` in next.config.ts. next/link and next/image apply basePath
// automatically; sitemap.ts, robots.ts and metadataBase do NOT — they emit
// whatever string they're given. Omitting this is the single most likely way to
// ship a sitemap where every URL 404s, because it works fine locally (where
// NEXT_PUBLIC_BASE_PATH is unset) and only breaks once deployed.
const BASE_PATH = (process.env.NEXT_PUBLIC_BASE_PATH || "").replace(/\/$/, "");

/** Absolute origin + basePath, no trailing slash. e.g. https://example.com/repo */
export const SITE_URL = `${SITE_ORIGIN}${BASE_PATH}`;

/** True once a real production domain has been configured via env. */
export const HAS_PRODUCTION_DOMAIN = Boolean(process.env.NEXT_PUBLIC_SITE_URL);
