import { describe, expect, it } from "vitest";
import { readFileSync, existsSync } from "node:fs";
import { load } from "js-yaml";

/**
 * Keeps the CMS config honest against the content it edits.
 *
 * Sveltia reads config.yml in the browser at runtime. A wrong path or a
 * misspelled field name does not fail the build — the collection just silently
 * shows nothing, or worse, saves a key the site never reads. Nobody would
 * notice until the client tried to edit that section, by which point we have
 * handed the project over.
 */

type Field = { name: string; widget?: string; fields?: Field[]; field?: Field };
type FileDef = { name: string; label: string; file: string; fields: Field[] };
type Collection = { name: string; label: string; files?: FileDef[] };
type Config = { backend: Record<string, string>; collections: Collection[]; media_folder: string };

const config = load(readFileSync("public/admin/config.yml", "utf8")) as Config;
const fileDefs = config.collections.flatMap((c) => c.files ?? []);

describe("cms config", () => {
  it("declares a github backend on the real repo and branch", () => {
    expect(config.backend.name).toBe("github");
    expect(config.backend.repo).toBe("alliancestreetgoa-lang/alliance-street-consultancy-web");
    expect(config.backend.branch).toBe("main");
  });

  it("points media uploads where the image pipeline reads from", () => {
    // scripts/optimize-images.mjs globs public/brand, so anything uploaded
    // elsewhere would ship unoptimised at full size.
    expect(config.media_folder).toBe("public/brand");
  });

  it("edits files that exist", () => {
    const missing = fileDefs.map((f) => f.file).filter((p) => !existsSync(p));
    expect(missing, "config.yml points at a content file that is not in the repo").toEqual([]);
  });

  it("names top-level fields that exist in each file", () => {
    const mismatches: string[] = [];
    for (const def of fileDefs) {
      const json = JSON.parse(readFileSync(def.file, "utf8")) as Record<string, unknown>;
      for (const field of def.fields) {
        if (!(field.name in json)) {
          mismatches.push(`${def.file}: config has "${field.name}", file does not`);
        }
      }
      // And the reverse: content the editor can never reach.
      for (const key of Object.keys(json)) {
        if (!def.fields.some((f) => f.name === key)) {
          mismatches.push(`${def.file}: "${key}" is not editable in the CMS`);
        }
      }
    }
    expect(mismatches).toEqual([]);
  });

  it("matches list item fields to the shape of the data", () => {
    const mismatches: string[] = [];
    for (const def of fileDefs) {
      const json = JSON.parse(readFileSync(def.file, "utf8")) as Record<string, unknown>;
      for (const field of def.fields) {
        const value = json[field.name];
        if (field.widget !== "list" || !Array.isArray(value) || value.length === 0) continue;
        const declared = new Set((field.fields ?? []).map((f) => f.name));
        if (declared.size === 0) continue; // single-field list (list of strings)
        for (const key of Object.keys(value[0] as object)) {
          if (!declared.has(key)) {
            mismatches.push(`${def.file} → ${field.name}: "${key}" is not editable`);
          }
        }
        for (const name of declared) {
          if (!(name in (value[0] as object))) {
            mismatches.push(`${def.file} → ${field.name}: config has "${name}", data does not`);
          }
        }
      }
    }
    expect(mismatches).toEqual([]);
  });

  it("keeps advisor credentials out of the CMS", () => {
    // Deliberate: a fabricated ACCA number is checkable against a public
    // register. These stay in code, added with the certificate in hand.
    const all = JSON.stringify(config);
    expect(all).not.toContain("credentialNumber");
    expect(all).not.toContain("ADVISORS");
  });
});
