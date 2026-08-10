"use client";

import { AuroraBackground } from "@/components/ui/aurora-background";
import { AmbientGlow } from "@/components/ui/ambient-glow";
import { Container } from "@/components/ui/container";
import { Badge } from "@/components/ui/badge";
import { DisplayHeading } from "@/components/ui/display-heading";

type PageHeroProps = {
  badge: string;
  title: string;
  subhead: string;
};

export function PageHero({ badge, title, subhead }: PageHeroProps) {
  return (
    <section className="relative flex min-h-[40vh] items-center overflow-hidden py-20 sm:py-24">
      <AuroraBackground />
      <AmbientGlow className="opacity-50" />
      <Container className="relative z-10 flex flex-col items-center gap-6 text-center">
        <Badge>{badge}</Badge>
        <DisplayHeading text={title} className="max-w-3xl text-4xl sm:text-5xl" />
        <p className="max-w-xl text-lg text-muted-foreground">{subhead}</p>
      </Container>
    </section>
  );
}
