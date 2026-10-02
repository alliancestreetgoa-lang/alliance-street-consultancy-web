import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";

import { pageSchema, type Page } from "./page-schema";

/**
 * Pages are one JSON file each in src/content/pages — the CMS creates, edits and
 * deletes those files. Read from disk at build time (this module is server-only)
 * so a page added in the CMS needs no code change to get a route.
 *
 * Parsing here, not just in tests, means defaults (hidden: false, image
 * position, …) are applied the same way everywhere the page is rendered.
 */
const PAGES_DIR = path.join(process.cwd(), "src", "content", "pages");

let cache: Page[] | undefined;

export function getAllPages(): Page[] {
  if (cache) return cache;
  cache = readdirSync(PAGES_DIR)
    .filter((file) => file.endsWith(".json"))
    .sort()
    .map((file) => {
      const id = file.replace(/\.json$/, "");
      const parsed = pageSchema.safeParse(JSON.parse(readFileSync(path.join(PAGES_DIR, file), "utf8")));
      if (!parsed.success) {
        const issues = parsed.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join("; ");
        throw new Error(`src/content/pages/${file} is not publishable — ${issues}`);
      }
      return { ...parsed.data, id };
    });
  return cache;
}

/** Pages a visitor can reach. Hidden pages are not built at all. */
export function getPublishedPages() {
  return getAllPages().filter((page) => page.status === "published");
}

export function getPageByPath(pathname: string) {
  return getPublishedPages().find((page) => page.path === pathname);
}
