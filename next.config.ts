import path from "node:path";
import type { NextConfig } from "next";

// Set by the GitHub Pages deploy workflow so the build knows it's being
// served from a sub-path (https://<user>.github.io/alliance-street-consultancy-web/)
// instead of the domain root. Empty locally, so `npm run dev`/`npm run build`
// are unaffected. src/lib/asset-path.ts reads the same env var to prefix
// hardcoded public/ asset URLs, since next/image doesn't do that automatically.
const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";

const nextConfig: NextConfig = {
  output: "export",
  // A custom loader, not `unoptimized: true`. Static export can't run Next's
  // optimizer, but it can defer to a loader — which lets next/image emit a real
  // srcset pointing at the WebP variants scripts/optimize-images.mjs builds.
  // With `unoptimized` every device downloaded the full-size original.
  images: { loader: "custom", loaderFile: "./src/image-loader.ts" },
  basePath,
  assetPrefix: basePath ? `${basePath}/` : "",
  turbopack: {
    root: path.resolve(__dirname),
  },

  // Dev only. The CMS is a static file at public/admin/index.html, which the
  // export serves correctly at /admin/ (GitHub Pages resolves a directory to
  // its index.html). `next dev` does not: it hands /admin to the app router,
  // which has no such route, so you get the site's own 404 inside the site
  // layout — confusing, and it makes the CMS config impossible to work on
  // locally.
  //
  // Rewrites are not supported under `output: "export"` and are ignored there,
  // so this is guarded to avoid a build warning that would otherwise appear on
  // every production build.
  ...(process.env.NODE_ENV === "development"
    ? {
        async rewrites() {
          return [{ source: "/admin", destination: "/admin/index.html" }];
        },
      }
    : {}),
};

export default nextConfig;
