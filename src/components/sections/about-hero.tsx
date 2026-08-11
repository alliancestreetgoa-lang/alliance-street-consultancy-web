"use client";

import { AuroraBackground } from "@/components/ui/aurora-background";
import { AmbientGlow } from "@/components/ui/ambient-glow";
import { Container } from "@/components/ui/container";
import { Badge } from "@/components/ui/badge";
import { DisplayHeading } from "@/components/ui/display-heading";
import { HeroEntrance } from "@/components/ui/scroll-reveal";

const HEADLINE = "Built by people who've sat on your side of the table.";

export function AboutHero() {
  return (
    <section className="relative flex min-h-[45vh] items-center overflow-hidden py-20 sm:min-h-[55vh] sm:py-28">
      <AuroraBackground />
      <AmbientGlow className="opacity-50" />
      <HeroEntrance className="relative z-10 w-full">
        <Container className="flex flex-col items-center gap-6 text-center">
          <span data-hero-item>
            <Badge>About Alliance Street</Badge>
          </span>
          <DisplayHeading text={HEADLINE} className="max-w-3xl text-4xl sm:text-6xl" />
          <p data-hero-item className="max-w-xl text-lg text-muted-foreground">
            We started Alliance Street because too many founders learn about a compliance gap from a
            penalty notice instead of an advisor.
          </p>
        </Container>
      </HeroEntrance>
    </section>
  );
}
