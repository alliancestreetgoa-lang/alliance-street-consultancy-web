import { describe, expect, it } from "vitest";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { z } from "zod";

import heroImages from "@/content/service-hero-images.json";
import services from "@/content/services.json";
import directAnswers from "@/content/direct-answers.json";
import site from "@/content/site.json";
import forms from "@/content/forms.json";
import servicePage from "@/content/service-page.json";
import theme from "@/content/theme.json";
import testimonials from "@/content/testimonials.json";

import {
  directAnswersSchema,
  formsSchema,
  serviceHeroImagesSchema,
  servicePageSchema,
  servicesSchema,
  siteSchema,
  testimonialsSchema,
  themeSchema,
  SERVICE_GROUPS,
} from "@/lib/content/schema";
import { CORE_PAGES, RESERVED_PATHS, pageSchema } from "@/lib/content/page-schema";

/**
 * The publish gate.
 *
 * Every CMS change is a pull request, and this suite runs on it (Validate
 * content workflow) and again in `prebuild`. A change that fails here cannot
 * be published and cannot be deployed — the live site keeps serving the
 * previous version. Failures name the file and field in plain words, because
 * the person reading them is an editor, not a developer.
 */

function check(label: string, schema: z.ZodType, value: unknown) {
  const result = schema.safeParse(value);
  if (!result.success) {
    const lines = result.error.issues.map(
      (i) => `  ${label}${i.path.length ? ` → ${i.path.join(".")}` : ""}: ${i.message}`
    );
    throw new Error(`${label} is not publishable:\n${lines.join("\n")}`);
  }
}

const PAGE_DIR = "src/content/pages";
const pageFiles = readdirSync(PAGE_DIR).filter((f) => f.endsWith(".json"));
const rawPages = pageFiles.map((file) => ({
  id: file.replace(/\.json$/, ""),
  file,
  data: JSON.parse(readFileSync(`${PAGE_DIR}/${file}`, "utf8")) as Record<string, unknown> & {
    path: string; status?: string; title: string;
  },
}));

describe("content schemas", () => {
  it("services.json", () => check("services.json", servicesSchema, services.services));
  it("direct-answers.json", () => check("direct-answers.json", directAnswersSchema, directAnswers.answers));
  it("service-hero-images.json", () => check("service-hero-images.json", serviceHeroImagesSchema, heroImages.images));
  it("site.json", () => check("site.json", siteSchema, site));
  it("forms.json", () => check("forms.json", formsSchema, forms));
  it("service-page.json", () => check("service-page.json", servicePageSchema, servicePage));
  it("theme.json", () => check("theme.json", themeSchema, theme));
  it("testimonials.json", () => check("testimonials.json", testimonialsSchema, testimonials.items));
  it.each(pageFiles)("pages/%s", (file) =>
    check(`pages/${file}`, pageSchema, JSON.parse(readFileSync(`${PAGE_DIR}/${file}`, "utf8"))));
});

describe("page safeguards", () => {
  it("keeps every core page, at its fixed address", () => {
    const problems: string[] = [];
    for (const [id, path] of Object.entries(CORE_PAGES)) {
      const page = rawPages.find((p) => p.id === id);
      if (!page) problems.push(`the core page "${id}" (${path}) was deleted — restore it, or hide its sections instead`);
      else if (page.data.path !== path) problems.push(`the core page "${id}" must stay at ${path}, not ${page.data.path}`);
      else if (page.data.status === "hidden" && id !== "home") problems.push(`the core page "${id}" is hidden but the site links to it`);
    }
    if (rawPages.find((p) => p.id === "home")?.data.status === "hidden") problems.push("the home page cannot be hidden");
    expect(problems).toEqual([]);
  });

  it("gives every page its own address", () => {
    const seen = new Map<string, string>();
    const clashes: string[] = [];
    for (const { file, data } of rawPages) {
      if (seen.has(data.path)) clashes.push(`${file} and ${seen.get(data.path)} both use ${data.path}`);
      seen.set(data.path, file);
    }
    expect(clashes).toEqual([]);
  });

  it("keeps new pages off addresses the site already uses", () => {
    const core = new Set(Object.values(CORE_PAGES));
    const bad = rawPages
      .filter(({ data }) => !core.has(data.path))
      .filter(({ data }) => RESERVED_PATHS.some((r) => data.path === r || data.path.startsWith(`${r}/`)))
      .map(({ file, data }) => `${file}: ${data.path} is reserved by the site — choose another address`);
    expect(bad).toEqual([]);
  });
});

/** Every string value under a key, anywhere in a JSON tree. */
function collect(value: unknown, keys: Set<string>, out: { key: string; value: string; where: string }[], where: string) {
  if (Array.isArray(value)) value.forEach((v, i) => collect(v, keys, out, `${where}[${i}]`));
  else if (value && typeof value === "object") {
    for (const [k, v] of Object.entries(value)) {
      if (typeof v === "string" && keys.has(k)) out.push({ key: k, value: v, where: `${where}.${k}` });
      else collect(v, keys, out, `${where}.${k}`);
    }
  }
  return out;
}

/** Markdown-style [label](/path) links typed into text fields. */
function textLinks(value: unknown, where: string, out: { value: string; where: string }[] = []) {
  if (typeof value === "string") for (const m of value.matchAll(/\]\((\/[^)\s]*)\)/g)) out.push({ value: m[1], where });
  else if (Array.isArray(value)) value.forEach((v, i) => textLinks(v, `${where}[${i}]`, out));
  else if (value && typeof value === "object") for (const [k, v] of Object.entries(value)) textLinks(v, `${where}.${k}`, out);
  return out;
}

describe("links and media", () => {
  const published = new Set(rawPages.filter((p) => p.data.status !== "hidden").map((p) => p.data.path));
  const hidden = new Set(rawPages.filter((p) => p.data.status === "hidden").map((p) => p.data.path));
  const serviceRoutes = new Set(services.services.map((s) => `/services/${s.category}/${s.slug}`));
  const sources: [string, unknown][] = [
    ...rawPages.map((p) => [`pages/${p.file}`, p.data] as [string, unknown]),
    ["site.json", site], ["forms.json", forms], ["service-page.json", servicePage],
  ];

  it("points every internal link at a page that exists and is published", () => {
    const broken: string[] = [];
    for (const [label, json] of sources) {
      const links = [
        ...collect(json, new Set(["href"]), [], label),
        ...textLinks(json, label),
      ];
      for (const link of links) {
        if (!link.value.startsWith("/")) continue;
        const path = link.value.split("#")[0].replace(/\/$/, "") || "/";
        if (hidden.has(path)) broken.push(`${link.where}: ${link.value} links to a hidden page`);
        else if (!published.has(path) && !serviceRoutes.has(path)) broken.push(`${link.where}: ${link.value} does not exist on the site`);
      }
    }
    expect(broken).toEqual([]);
  });

  it("uses media files that exist in the media library", () => {
    const missing: string[] = [];
    for (const [label, json] of [...sources, ["service-hero-images.json", heroImages] as [string, unknown]]) {
      for (const ref of collect(json, new Set(["src", "poster", "video", "logo"]), [], label)) {
        if (ref.value && !existsSync(`public${ref.value}`)) missing.push(`${ref.where}: ${ref.value} is not in the media library`);
      }
    }
    expect(missing).toEqual([]);
  });

  it("keeps uploaded media small enough to publish", () => {
    // GitHub refuses files over 100 MB; anything near that also makes the site slow.
    const tooBig = readdirSync("public/brand", { withFileTypes: true })
      .filter((e) => e.isFile())
      .map((e) => ({ name: e.name, size: readFileSync(`public/brand/${e.name}`).byteLength }))
      .filter((f) => f.size > (/\.(mp4|webm)$/i.test(f.name) ? 40 : 8) * 1024 * 1024)
      .map((f) => `${f.name} is ${(f.size / 1024 / 1024).toFixed(1)} MB`);
    expect(tooBig, "upload a smaller version: images under 8 MB, videos under 40 MB").toEqual([]);
  });
});

describe("content integrity", () => {
  const routes = new Set(services.services.map((s) => `/services/${s.category}/${s.slug}`));

  it("attaches every sourced answer to a service that exists", () => {
    const slugs = new Set(services.services.map((s) => s.slug));
    const orphans = directAnswers.answers.map((a) => a.slug).filter((slug) => !slugs.has(slug));
    expect(orphans, "a sourced answer names a service that no longer exists").toEqual([]);
  });

  it("has exactly one local hero image for every service", () => {
    const expected = services.services.map((s) => `${s.category}/${s.slug}`).sort();
    expect(heroImages.images.map((image) => image.service).sort()).toEqual(expected);
  });

  it("surfaces every service somewhere in the nav", () => {
    const linked = new Set(site.navGroups.flatMap((g) => g.links.map((l) => l.href)));
    const unreachable = [...routes].filter((r) => !linked.has(r));
    expect(unreachable, "a service exists but nothing links to it").toEqual([]);
  });

  it("files every service under a nav group of the same name", () => {
    const navTitles = new Set(site.navGroups.map((g) => g.title));
    const stray = [...new Set(services.services.map((s) => s.group))].filter((g) => !navTitles.has(g));
    expect(stray).toEqual([]);
  });

  it("uses only known service groups", () => {
    const stray = [...new Set(services.services.map((s) => s.group))].filter(
      (g) => !(SERVICE_GROUPS as readonly string[]).includes(g)
    );
    expect(stray).toEqual([]);
  });

  it("never publishes a sample testimonial", () => {
    const leaked = testimonials.items.filter(
      (t) => t.approved && (/sample/i.test(t.quote) || t.name.trim().toLowerCase() === "client name")
    );
    expect(leaked, "a testimonial marked for publishing still has sample wording or a placeholder name").toEqual([]);
  });

  it("keeps placeholders in copy to the ones the site understands", () => {
    const known = new Set(["company.name", "company.email", "company.phone", "company.address", "year"]);
    const unknown: string[] = [];
    const scan = (v: unknown, where: string) => {
      if (typeof v === "string") for (const m of v.matchAll(/\{\{\s*([\w.]+)\s*\}\}/g)) { if (!known.has(m[1])) unknown.push(`${where}: {{${m[1]}}}`); }
      else if (Array.isArray(v)) v.forEach((x, i) => scan(x, `${where}[${i}]`));
      else if (v && typeof v === "object") for (const [k, x] of Object.entries(v)) scan(x, `${where}.${k}`);
    };
    rawPages.forEach((p) => scan(p.data, `pages/${p.file}`));
    scan(site, "site.json"); scan(forms, "forms.json");
    expect(unknown, "unknown placeholder — use {{company.name}}, {{company.email}}, {{company.phone}}, {{company.address}} or {{year}}").toEqual([]);
  });
});
