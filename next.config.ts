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
  images: { unoptimized: true },
  basePath,
  assetPrefix: basePath ? `${basePath}/` : "",
  turbopack: {
    root: path.resolve(__dirname),
  },
};

export default nextConfig;
