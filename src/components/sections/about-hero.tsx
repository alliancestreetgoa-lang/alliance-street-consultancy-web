"use client";

import Image from "next/image";
import { asset } from "@/lib/asset-path";
import { Container } from "@/components/ui/container";
import { Badge } from "@/components/ui/badge";
import { DisplayHeading } from "@/components/ui/display-heading";
import { HeroEntrance } from "@/components/ui/scroll-reveal";
import headlines from "@/content/sections/headlines.json";


export function AboutHero() {
  return (
    <section className="surface-dark as-image-hero relative isolate flex overflow-hidden bg-background">
      <Image src={asset("/brand/about-hero.jpg")} alt="Illustrative boutique advisory office with a meeting table overlooking Dubai Business Bay" fill preload sizes="100vw" className="-z-20 object-cover" />
      <div aria-hidden className="absolute inset-0 -z-10 bg-black/65" />
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
