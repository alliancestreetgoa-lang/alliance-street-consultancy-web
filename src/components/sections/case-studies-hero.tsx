"use client";

import { Container } from "@/components/ui/container";
import { Badge } from "@/components/ui/badge";
import { DisplayHeading } from "@/components/ui/display-heading";
import { HeroEntrance } from "@/components/ui/scroll-reveal";

const HEADLINE = "Real situations, and how we work them.";

export function CaseStudiesHero() {
  return (
    // Black → red wall with white type, matching the live /about-us hero.
    // surface-dark remaps the tokens so the badge and subhead invert with it.
    <section className="as-wall-page surface-dark relative flex min-h-[58vh] items-start overflow-hidden pt-32 pb-40 sm:min-h-[66vh] sm:pt-40 sm:pb-56">
      <HeroEntrance className="relative z-10 w-full">
        <Container className="flex flex-col items-center gap-6 text-center">
          <span data-hero-item>
            <Badge className="border-white/25 bg-white/10">Case Studies</Badge>
          </span>
          <DisplayHeading text={HEADLINE} className="max-w-3xl text-4xl sm:text-6xl" />
          <p data-hero-item className="max-w-xl text-base text-white/80">
            Six recurring scenarios from across UAE setup, tax, UK services, and advisory —
            illustrative of how an engagement actually runs, not a list of named clients.
          </p>
        </Container>
      </HeroEntrance>
    </section>
  );
}
