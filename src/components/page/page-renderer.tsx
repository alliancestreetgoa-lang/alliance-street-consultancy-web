import type { ReactNode } from "react";

import { Hero } from "@/components/sections/hero";
import { Stats } from "@/components/sections/stats";
import { ServicePreview } from "@/components/sections/service-preview";
import { ServicesIndex } from "@/components/sections/services-index";
import { Testimonials } from "@/components/sections/testimonials";
import { Newsletter } from "@/components/sections/newsletter";
import { PageHero } from "@/components/sections/page-hero";
import { StatementBanner } from "@/components/sections/statement-banner";
import { ContactSection } from "@/components/sections/contact-section";
import { ConsultationForm } from "@/components/sections/consultation-form";
import {
  Cards, CaseStudies, ConsultationFormSection, Cta, Faq, FeatureList, ImageSection, Leadership, Legal,
  NumberedList, Pricing, RichTextSection, Story, TextImage,
} from "@/components/sections/content-sections";
import { Surface } from "@/components/ui/surface";
import type { Page, Section } from "@/lib/content/page-schema";
import { buildBreadcrumbJsonLd, jsonLdScriptProps } from "@/lib/schema";

/** The one place a section type is mapped to its component. */
export function renderSection(section: Section): ReactNode {
  switch (section.type) {
    case "homeHero": return <Hero section={section} />;
    case "pageHero": return <PageHero section={section} />;
    case "statement": return <StatementBanner section={section} />;
    case "textImage": return <TextImage section={section} />;
    case "richText": return <RichTextSection section={section} />;
    case "stats": return <Stats section={section} />;
    case "featureList": return <FeatureList section={section} />;
    case "numberedList": return <NumberedList section={section} />;
    case "cards": return <Cards section={section} />;
    case "servicesOverview": return <ServicePreview section={section} />;
    case "servicesIndex": return <ServicesIndex />;
    case "testimonials": return <Testimonials section={section} />;
    case "faq": return <Faq section={section} />;
    case "pricing": return <Pricing section={section} />;
    case "caseStudies": return <CaseStudies section={section} />;
    case "cta": return <Cta section={section} />;
    case "leadership": return <Leadership section={section} />;
    case "story": return <Story section={section} />;
    case "consultationForm": return <ConsultationFormSection section={section}><ConsultationForm /></ConsultationFormSection>;
    case "contact": return <ContactSection section={section} />;
    case "newsletter": return <Newsletter section={section} />;
    case "legal": return <Legal section={section} />;
    case "image": return <ImageSection section={section} />;
  }
}

/** `data-section` lets the theme's section-spacing setting reach each section root. */
function Block({ section, index }: { section: Section; index: number }) {
  return (
    <div data-section={section.type} id={section.anchor || undefined} data-section-index={index}>
      {renderSection(section)}
    </div>
  );
}

/**
 * One band of the homepage flow, with a soft red glow on one side. Carried over
 * from the original homepage: the two gradient walls bookend the page and
 * everything between them sits on one continuous ground (.as-flow).
 */
function FlowBand({ side, children }: { side: "left" | "right"; children: ReactNode }) {
  return (
    <div className="as-flow-band">
      <div aria-hidden className="as-flow-glow-layer">
        <div className="as-flow-glow" data-side={side} />
      </div>
      {children}
    </div>
  );
}

export function PageRenderer({ page }: { page: Page }) {
  const sections = page.sections.filter((section) => !section.hidden);
  const breadcrumb =
    page.path === "/"
      ? null
      : buildBreadcrumbJsonLd([{ name: "Home", path: "/" }, { name: page.title, path: page.path }]);

  if (page.layout === "flow") {
    const [first, ...rest] = sections;
    const leadsWithHero = first?.type === "homeHero";
    const body = leadsWithHero ? rest : sections;
    const last = body.at(-1);
    const tail = last?.type === "newsletter" ? last : undefined;
    const banded = tail ? body.slice(0, -1) : body;
    return (
      <>
        {breadcrumb ? <script {...jsonLdScriptProps(breadcrumb)} /> : null}
        {leadsWithHero ? <Surface tone="light"><Block section={first} index={0} /></Surface> : null}
        <div className="as-flow text-foreground">
          {banded.map((section, index) => (
            <FlowBand key={index} side={index % 2 === 0 ? "right" : "left"}>
              <Block section={section} index={index + 1} />
            </FlowBand>
          ))}
          <div className="relative pb-40 sm:pb-48">
            {tail ? <Block section={tail} index={sections.length - 1} /> : null}
            <div aria-hidden className="as-flow-tail" />
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      {breadcrumb ? <script {...jsonLdScriptProps(breadcrumb)} /> : null}
      {sections.map((section, index) => <Block key={index} section={section} index={index} />)}
    </>
  );
}
