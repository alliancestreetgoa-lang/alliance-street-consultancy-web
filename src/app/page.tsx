// src/app/page.tsx
import type { ReactNode } from "react";
import { Hero } from "@/components/sections/hero";
import { Stats } from "@/components/sections/stats";
import { WhyAllianceStreet } from "@/components/sections/why-alliance-street";
import { ServicePreview } from "@/components/sections/service-preview";
import { Process } from "@/components/sections/process";
import { HomeFAQ } from "@/components/sections/home-faq";
import { BookConsultationCTA } from "@/components/sections/book-consultation-cta";
import { Newsletter } from "@/components/sections/newsletter";
import { Testimonials } from "@/components/sections/testimonials";

// Title and description come from the root layout's `default` — the homepage
// is the one route where the site-wide wording is the right wording. Only the
// self-referencing canonical is set here.
export const metadata = pageMetadata("/");
import { Surface } from "@/components/ui/surface";
import { pageMetadata } from "@/lib/content/metadata";

/**
 * One band of the homepage flow, with a soft red glow on one side. `pinned`
 * is for sections that hold the viewport while you scroll (sticky inside a tall
 * track): their glow sticks too, rather than sitting mid-track off screen.
 */
function FlowBand({
  side,
  pinned = false,
  children,
}: {
  side: "left" | "right";
  pinned?: boolean;
  children: ReactNode;
}) {
  return (
    <div className="as-flow-band">
      <div aria-hidden className="as-flow-glow-layer">
        {pinned ? (
          <div className="as-flow-glow-sticky">
            <div className="as-flow-glow" data-side={side} />
          </div>
        ) : (
          <div className="as-flow-glow" data-side={side} />
        )}
      </div>
      {children}
    </div>
  );
}

export default function Home() {
  // The two gradient walls bookend the page — the hero descends dark-red →
  // white, the footer red → black — and everything between them sits on one
  // continuous ground (.as-flow) that picks up from the hero's white and
  // ramps back into the footer's red, so the page reads as a single piece.
  return (
    <>
      <Surface tone="light">
        <Hero />
      </Surface>
      <div className="as-flow text-foreground">
        <FlowBand side="right">
          <Stats />
        </FlowBand>
        <FlowBand side="left">
          <WhyAllianceStreet />
        </FlowBand>
        <FlowBand side="right" pinned>
          <ServicePreview />
        </FlowBand>
        <FlowBand side="left" pinned>
          <Process />
        </FlowBand>
        <FlowBand side="right">
          <HomeFAQ />
        </FlowBand>
        <FlowBand side="left">
          <BookConsultationCTA />
        </FlowBand>
        <FlowBand side="right">
          <Testimonials />
        </FlowBand>
        <div className="relative pb-40 sm:pb-48">
          <Newsletter />
          <div aria-hidden className="as-flow-tail" />
        </div>
      </div>
    </>
  );
}
