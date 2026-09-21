"use client";

import { Container } from "@/components/ui/container";
import { DisplayHeading } from "@/components/ui/display-heading";
import { HeroEntrance } from "@/components/ui/scroll-reveal";

type PageHeroProps = {
  badge: string;
  title: string;
  subhead: string;
};

/**
 * Shared hero for /services, /industries, /pricing, /contact and the two legal
 * pages — six pages in all.
 *
 * Uses the same black → red wall as AboutHero and CaseStudiesHero, so every
 * top-level page in the nav opens the same way. `.surface-dark` remaps the
 * theme tokens for the subtree, so the children need no dark variants.
 *
 * No wedge and no ambient glow here, unlike the service-detail hero: both were
 * there to give a flat black ground some depth, and the gradient already
 * provides it. A white wedge over the red base would also read as a gap rather
 * than a transition.
 *
 * The badge and subhead fade up on mount; the heading is left to
 * DisplayHeading's own word stagger (see HeroEntrance for why it must not be
 * wrapped in an opacity animation).
 */
export function PageHero({ badge, title, subhead }: PageHeroProps) {
  return (
    <section className="as-wall-page surface-dark relative flex min-h-[58vh] items-start overflow-hidden pt-32 pb-40 sm:pt-40 sm:pb-56">
      <HeroEntrance className="relative z-10 w-full">
        <Container className="flex flex-col items-center gap-6 text-center">
          <span data-hero-item className="as-eyebrow">
            {badge}
          </span>
          <DisplayHeading text={title} className="max-w-3xl text-4xl sm:text-5xl" />
          <p data-hero-item className="max-w-xl text-base text-white/80">
            {subhead}
          </p>
        </Container>
      </HeroEntrance>
    </section>
  );
}
