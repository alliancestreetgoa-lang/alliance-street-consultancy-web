"use client";

import { AuroraBackground } from "@/components/ui/aurora-background";
import { AmbientGlow } from "@/components/ui/ambient-glow";
import { Container } from "@/components/ui/container";
import { Badge } from "@/components/ui/badge";
import { DisplayHeading } from "@/components/ui/display-heading";
import { HeroEntrance } from "@/components/ui/scroll-reveal";

type PageHeroProps = {
  badge: string;
  title: string;
  subhead: string;
};

/**
 * Shared hero for /services, /industries, /pricing, /knowledge-centre and
 * /contact. The badge and subhead fade up on mount; the heading is left to
 * DisplayHeading's own word stagger (see HeroEntrance for why it must not be
 * wrapped in an opacity animation).
 */
export function PageHero({ badge, title, subhead }: PageHeroProps) {
  return (
    <section className="relative flex min-h-[40vh] items-center overflow-hidden py-20 sm:py-24">
      <AuroraBackground />
      <AmbientGlow className="opacity-50" />
      <HeroEntrance className="relative z-10 w-full">
        <Container className="flex flex-col items-center gap-6 text-center">
          <span data-hero-item>
            <Badge>{badge}</Badge>
          </span>
          <DisplayHeading text={title} className="max-w-3xl text-4xl sm:text-5xl" />
          <p data-hero-item className="max-w-xl text-lg text-muted-foreground">
            {subhead}
          </p>
        </Container>
      </HeroEntrance>
    </section>
  );
}
