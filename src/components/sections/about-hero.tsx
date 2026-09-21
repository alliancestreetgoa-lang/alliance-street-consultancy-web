"use client";

import { Container } from "@/components/ui/container";
import { Badge } from "@/components/ui/badge";
import { DisplayHeading } from "@/components/ui/display-heading";
import { HeroEntrance } from "@/components/ui/scroll-reveal";
import headlines from "@/content/sections/headlines.json";


export function AboutHero() {
  return (
    // Black → red wall with white type, matching the live /about-us hero.
    // surface-dark remaps the tokens so the badge and subhead invert with it.
    <section className="as-wall-page surface-dark relative flex min-h-[58vh] items-start overflow-hidden pt-32 pb-40 sm:min-h-[66vh] sm:pt-40 sm:pb-56">
      <HeroEntrance className="relative z-10 w-full">
        <Container className="flex flex-col items-center gap-6 text-center">
          <span data-hero-item>
            <Badge className="border-white/25 bg-white/10">About Alliance Street</Badge>
          </span>
          <DisplayHeading text={headlines.about} className="max-w-3xl text-4xl sm:text-6xl" />
          <p data-hero-item className="max-w-xl text-base text-white/80">
            We started Alliance Street because too many founders learn about a compliance gap from a
            penalty notice instead of an advisor.
          </p>
        </Container>
      </HeroEntrance>
    </section>
  );
}
