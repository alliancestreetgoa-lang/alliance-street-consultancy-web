// src/image-loader.ts
//
// Custom next/image loader. `output: "export"` cannot run Next's optimizer, but
// it does support a custom loader — which lets next/image emit a real srcset
// pointing at the WebP variants that scripts/optimize-images.mjs generates at
// build time. Without this the project has to set `images.unoptimized`, and
// every device downloads the full-size original.
//
// Anything without a pre-generated variant falls through to the original path,
// so this is safe for assets outside public/brand.
import manifest from "@/lib/image-manifest.json";

const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH || "";

type LoaderArgs = { src: string; width: number; quality?: number };

export default function imageLoader({ src, width }: LoaderArgs): string {
  // Callers may already have run the src through asset(), which prepends
  // basePath. Strip it so manifest lookups use a stable key, then put it back.
  const bare = BASE_PATH && src.startsWith(BASE_PATH) ? src.slice(BASE_PATH.length) : src;

  const available = (manifest as Record<string, number[]>)[bare];
  if (!available || available.length === 0) return src;

  // Smallest generated width that still covers the requested one, so we never
  // upscale a variant; fall back to the largest we have.
  const chosen = available.find((w) => w >= width) ?? available[available.length - 1];

  const base = bare.replace(/^\/brand\//, "").replace(/\.[^.]+$/, "");
  return `${BASE_PATH}/brand/optimized/${base}-${chosen}.webp`;
}
