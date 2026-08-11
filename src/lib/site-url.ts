// src/lib/site-url.ts
//
// Single source of truth for the site's absolute URL. Used by sitemap.ts,
// robots.ts, and the `metadataBase` in app/layout.tsx — all three must agree,
// so none of them should re-derive this.
//
// ---------------------------------------------------------------------------
// ACTION REQUIRED — the production domain is not configured yet.
//
// Nothing in this repo declares a real domain: no NEXT_PUBLIC_SITE_URL, no
// public/CNAME, no custom-domain step in .github/workflows/deploy-pages.yml.
// The only URL this project has ever been deployed to is the GitHub Pages
// project sub-path, which is what the fallback below points at.
//
// Absolute URLs (sitemap <loc>, canonical tags, og:url) are the one place a
// wrong value is actively harmful rather than merely missing — a canonical
// pointing at the wrong origin tells Google to consolidate ranking signals
// onto a URL you don't control. So: set NEXT_PUBLIC_SITE_URL before launch.
//
//   1. Decide the production domain.
//   2. Set NEXT_PUBLIC_SITE_URL in the build environment, and alongside
//      NEXT_PUBLIC_BASE_PATH in .github/workflows/deploy-pages.yml.
//   3. If moving to a domain root, stop setting NEXT_PUBLIC_BASE_PATH —
//      BASE_PATH then correctly resolves to "".
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
