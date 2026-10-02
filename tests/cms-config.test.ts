import { describe, expect, it } from "vitest";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { load } from "js-yaml";
import { z } from "zod";

import { SECTION_TYPES, sectionSchema, pageSchema } from "@/lib/content/page-schema";

/**
 * Keeps the CMS config honest against the content it edits and the schemas
 * that validate it.
 *
 * Sveltia reads config.yml in the browser. A wrong path or misspelled field
 * does not fail any build — the editor just shows an empty form, or saves a key
 * the site never reads. This suite turns each of those into a failing test.
 */

type Field = { name: string; widget?: string; fields?: Field[]; field?: Field; types?: Field[]; required?: boolean; options?: unknown[] };
type FileDef = { name: string; label: string; file: string; fields: Field[] };
type Collection = { name: string; label: string; files?: FileDef[]; folder?: string; fields?: Field[] };
type Config = {
  backend: Record<string, string>; collections: Collection[]; media_folder: string; publish_mode?: string;
};

const config = load(readFileSync("admin/public/cms/config.yml", "utf8")) as Config;
const fileDefs = config.collections.flatMap((c) => c.files ?? []);
const pagesCollection = config.collections.find((c) => c.folder === "src/content/pages")!;
const sectionsField = pagesCollection.fields!.find((f) => f.name === "sections")!;

/** Field names a zod object accepts, unwrapping optional/default/preprocess wrappers. */
function shapeKeys(schema: z.ZodType): string[] {
  let s: unknown = schema;
  for (let i = 0; i < 6; i++) {
    const def = (s as { _zod?: { def?: { type?: string; innerType?: unknown; out?: unknown; in?: unknown; schema?: unknown } } })._zod?.def;
    if (!def) break;
    if (def.type === "object") break;
    s = def.innerType ?? def.out ?? def.in ?? def.schema;
  }
  const shape = (s as { shape?: Record<string, unknown> }).shape;
  return shape ? Object.keys(shape) : [];
}

describe("cms config", () => {
  it("declares a github backend on the real repo and branch", () => {
    expect(config.backend.name).toBe("github");
    expect(config.backend.repo).toBe("alliancestreetgoa-lang/alliance-street-consultancy-web");
    expect(config.backend.branch).toBe("main");
  });

  it("sends every change through drafts and review", () => {
    expect(config.publish_mode).toBe("editorial_workflow");
  });

  it("has a usable OAuth endpoint", () => {
    // Ships as a REPLACE-ME placeholder until the OAuth worker is deployed (see
    // docs/cms-setup.md). Anything that is neither the placeholder nor a real
    // https URL is a half-finished edit.
    const url = config.backend.base_url;
    expect(url, "backend.base_url is missing").toBeTruthy();
    if (url.includes("REPLACE-ME")) return;
    expect(() => new URL(url)).not.toThrow();
    expect(url.startsWith("https://"), "the OAuth endpoint must be https").toBe(true);
    expect(url.endsWith("/"), "base_url must not have a trailing slash").toBe(false);
  });

  it("points media uploads where the image pipeline reads from", () => {
    expect(config.media_folder).toBe("public/brand");
  });

  it("edits files and folders that exist", () => {
    const missing = [...fileDefs.map((f) => f.file), pagesCollection.folder!].filter((p) => !existsSync(p));
    expect(missing).toEqual([]);
  });

  it("offers every section type the site can render, and no others", () => {
    expect(sectionsField.types!.map((t) => t.name).sort()).toEqual([...SECTION_TYPES].sort());
  });

  it("gives each section type exactly the fields its schema reads", () => {
    const problems: string[] = [];
    for (const type of sectionsField.types!) {
      const option = sectionSchema.options.find((o) => (o.shape.type as z.ZodLiteral).value === type.name)!;
      const schemaKeys = Object.keys(option.shape).filter((k) => k !== "type").sort();
      const cmsKeys = type.fields!.map((f) => f.name).sort();
      if (JSON.stringify(schemaKeys) !== JSON.stringify(cmsKeys))
        problems.push(`${type.name}: schema [${schemaKeys}] vs CMS [${cmsKeys}]`);
    }
    expect(problems).toEqual([]);
  });

  it("gives the page form exactly the fields a page has", () => {
    const schemaKeys = shapeKeys(pageSchema).sort();
    expect(pagesCollection.fields!.map((f) => f.name).sort()).toEqual(schemaKeys);
  });

  it("can edit every key in every page file", () => {
    const problems: string[] = [];
    const types = new Map(sectionsField.types!.map((t) => [t.name, t]));
    for (const file of readdirSync("src/content/pages").filter((f) => f.endsWith(".json"))) {
      const page = JSON.parse(readFileSync(`src/content/pages/${file}`, "utf8"));
      for (const key of Object.keys(page))
        if (!pagesCollection.fields!.some((f) => f.name === key)) problems.push(`${file}: "${key}" is not editable`);
      for (const [i, section] of (page.sections as Record<string, unknown>[]).entries()) {
        const type = types.get(section.type as string);
        if (!type) { problems.push(`${file} section ${i}: unknown type ${String(section.type)}`); continue; }
        for (const key of Object.keys(section))
          if (key !== "type" && !type.fields!.some((f) => f.name === key)) problems.push(`${file} section ${i} (${type.name}): "${key}" is not editable`);
      }
    }
    expect(problems).toEqual([]);
  });

  it("matches file collections to the shape of their data, both ways", () => {
    const mismatches: string[] = [];
    const walk = (fields: Field[], value: unknown, where: string) => {
      if (!value || typeof value !== "object" || Array.isArray(value)) return;
      const obj = value as Record<string, unknown>;
      for (const field of fields) {
        if (!(field.name in obj)) {
          if (field.required !== false) mismatches.push(`${where}: config has "${field.name}", data does not`);
          continue;
        }
        const v = obj[field.name];
        if (field.widget === "object" && field.fields) walk(field.fields, v, `${where}.${field.name}`);
        if (field.widget === "list" && field.fields && Array.isArray(v)) v.forEach((item, i) => walk(field.fields!, item, `${where}.${field.name}[${i}]`));
      }
      for (const key of Object.keys(obj))
        if (!fields.some((f) => f.name === key)) mismatches.push(`${where}: "${key}" is not editable in the CMS`);
    };
    for (const def of fileDefs) walk(def.fields, JSON.parse(readFileSync(def.file, "utf8")), def.file);
    expect(mismatches).toEqual([]);
  });

  it("keeps the old public /admin path a redirect, not an editor", () => {
    // The editor must not run on the public site's origin, where draft
    // previews also live (see docs/cms-setup.md → "Why the admin is separate").
    const html = readFileSync("public/admin/index.html", "utf8");
    expect(html).not.toContain("sveltia-cms.js");
    expect(html).toContain("noindex");
  });
});
