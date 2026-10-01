import { describe, expect, it } from "vitest";
import { SERVICES } from "@/lib/services-data";
import { buildFaqJsonLd, buildServiceJsonLd, jsonLdScriptProps } from "@/lib/schema";
import { pageMetadata } from "@/lib/content/metadata";
import pages from "@/content/pages.json";

describe("search content", () => {
  it("gives every service distinct search copy and a visible answer", () => {
    const titles = new Set<string>();
    const descriptions = new Set<string>();
    for (const service of SERVICES) {
      expect(service.search, service.slug).toBeDefined();
      const search = service.search!;
      expect(search.title).toMatch(/UAE|UK/);
      expect(search.overview.length).toBeGreaterThan(120);
      expect(search.preparation.length).toBeGreaterThan(30);
      expect(search.faqs.length).toBeGreaterThan(0);
      expect(buildFaqJsonLd(search.faqs).mainEntity[0].acceptedAnswer.text).toBe(search.faqs[0].answer);
      expect(buildServiceJsonLd(service).description).toBe(search.description);
      titles.add(search.title);
      descriptions.add(search.description);
    }
    expect(titles.size).toBe(SERVICES.length);
    expect(descriptions.size).toBe(SERVICES.length);
  });

  it("keeps page sharing metadata specific to each route", () => {
    for (const page of pages.pages) {
      const meta = pageMetadata(page.route);
      expect(meta.alternates?.canonical).toBe(page.route);
      expect(meta.openGraph?.title).toContain(page.title);
      expect(meta.twitter?.description).toBe(page.description);
      expect(meta.openGraph?.images).toBeTruthy();
    }
  });

  it("escapes closing script tags in structured data", () => {
    const props = jsonLdScriptProps({ name: "</script><script>alert(1)</script>" });
    expect(props.dangerouslySetInnerHTML.__html).not.toContain("<");
    expect(JSON.parse(props.dangerouslySetInnerHTML.__html).name).toContain("</script>");
  });
});
