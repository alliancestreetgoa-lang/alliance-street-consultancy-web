// scripts/optimize-images.mjs
//
// Pre-generates responsive WebP variants of everything in public/brand/.
//
// Why this exists: `output: "export"` cannot run Next's image optimizer, so the
// project previously set `images: { unoptimized: true }` and shipped every
// source file at full size to every device — a 1672x941 hero JPEG downloaded
// onto a 390px phone. Static export *can* use a custom loader, so we generate
// the widths at build time here and let src/image-loader.ts point next/image at
// them. That restores both format conversion and srcset.
//
// Runs from `prebuild`, so `npm run build` always has fresh output. Idempotent:
// variants newer than their source are skipped.
import { mkdir, readdir, stat, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import sharp from "sharp";

const SOURCE_DIR = path.join(process.cwd(), "public", "brand");
const OUT_DIR = path.join(SOURCE_DIR, "optimized");
const WIDTHS = [640, 960, 1280, 1920];
const QUALITY = 72;

async function main() {
  if (!existsSync(SOURCE_DIR)) {
    console.log("optimize-images: no public/brand directory, nothing to do");
    return;
  }
  await mkdir(OUT_DIR, { recursive: true });

  const files = (await readdir(SOURCE_DIR)).filter((f) => /\.(jpe?g|png)$/i.test(f));
  let generated = 0;
  let skipped = 0;
  const manifest = {};

  for (const file of files) {
    const sourcePath = path.join(SOURCE_DIR, file);
    const sourceStat = await stat(sourcePath);
    const base = file.replace(/\.[^.]+$/, "");
    const meta = await sharp(sourcePath).metadata();

    // Never upscale: a 281px logo has no business being emitted at 1920.
    const widths = WIDTHS.filter((w) => w <= (meta.width ?? 0));
    if (widths.length === 0) widths.push(meta.width ?? WIDTHS[0]);
    manifest[`/brand/${file}`] = widths;

    for (const width of widths) {
      const outPath = path.join(OUT_DIR, `${base}-${width}.webp`);
      if (existsSync(outPath) && (await stat(outPath)).mtimeMs > sourceStat.mtimeMs) {
        skipped++;
        continue;
      }
      await sharp(sourcePath).resize({ width, withoutEnlargement: true }).webp({ quality: QUALITY }).toFile(outPath);
      generated++;
    }
  }

  // The loader is a pure function with no filesystem access at request time, so
  // it needs to know which widths actually exist. Emitted as a module rather
  // than hardcoded to keep the two from drifting.
  await writeFile(
    path.join(process.cwd(), "src", "lib", "image-manifest.json"),
    `${JSON.stringify(manifest, null, 2)}\n`,
  );

  console.log(`optimize-images: ${generated} generated, ${skipped} up to date, ${files.length} sources`);
}

main().catch((error) => {
  console.error("optimize-images failed:", error);
  process.exit(1);
});
