"use client";

import { AuroraBackground } from "@/components/ui/aurora-background";
import { AmbientGlow } from "@/components/ui/ambient-glow";
import { Container } from "@/components/ui/container";
import { Badge } from "@/components/ui/badge";
import { DisplayHeading } from "@/components/ui/display-heading";

const HEADLINE = "Real situations, and how we work them.";

export function CaseStudiesHero() {
  return (
    <section className="relative flex min-h-[45vh] items-center overflow-hidden py-20 sm:min-h-[55vh] sm:py-28">
      <AuroraBackground />
      <AmbientGlow className="opacity-50" />
      <Container className="relative z-10 flex flex-col items-center gap-6 text-center">
        <Badge>Case Studies</Badge>
        <DisplayHeading text={HEADLINE} className="max-w-3xl text-4xl sm:text-6xl" />
        <p className="max-w-xl text-lg text-muted-foreground">
          Six recurring scenarios from across UAE setup, tax, UK services, and advisory —
          illustrative of how an engagement actually runs, not a list of named clients.
        </p>
      </Container>
    </section>
  );
}
