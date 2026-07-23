// next/image and next/font do not automatically prepend `basePath` to public
// asset URLs the way next/link does — see next.config.ts for the matching
// basePath/assetPrefix setup used when building for GitHub Pages.
export function asset(path: string) {
  return `${process.env.NEXT_PUBLIC_BASE_PATH || ""}${path}`;
}
