"use client";

import Image from "next/image";
import { asset } from "@/lib/asset-path";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Container } from "@/components/ui/container";
import { DisplayHeading } from "@/components/ui/display-heading";
import { HeroEntrance } from "@/components/ui/scroll-reveal";
import type { SectionOf } from "@/lib/content/page-schema";
import { OBJECT_POSITION } from "@/lib/image-position";

/**
 * Hero for every page except home.
 *
 * With an image: the photograph under a black wash (formerly AboutHero,
 * CaseStudiesHero and the image variant of PageHero). Without one: the black →
 * red wall. `.surface-dark` remaps the theme tokens for the subtree.
 *
 * "pill" + "large" reproduce the About and Case Studies heroes exactly; the
 * defaults reproduce the shared PageHero.
 *
 * The badge and subhead fade up on mount; the heading is left to
 * DisplayHeading's own word stagger (see HeroEntrance for why it must not be
 * wrapped in an opacity animation).
 */
export function PageHero({ section }: { section: SectionOf<"pageHero"> }) {
  const image = section.image?.src ? section.image : undefined;
  const large = section.size === "large";
  return (
    <section className={cn("surface-dark relative isolate flex overflow-hidden", image ? "as-image-hero bg-background" : "as-wall-page min-h-[58vh] items-start pt-32 pb-40 sm:pt-40 sm:pb-56")}>
      {image && <>
        <Image src={asset(image.src)} alt={image.alt} fill preload sizes="100vw" className={cn("-z-20 object-cover", OBJECT_POSITION[image.position])} />
        <div aria-hidden className="absolute inset-0 -z-10 bg-black/65" />
      </>}
      <HeroEntrance className="relative z-10 w-full">
        <Container className="flex flex-col items-center gap-6 text-center">
          {section.badgeStyle === "pill" ? (
            <span data-hero-item>
              <Badge className="border-white/25 bg-white/10">{section.badge}</Badge>
            </span>
          ) : (
            <span data-hero-item className="as-eyebrow">{section.badge}</span>
          )}
          <DisplayHeading text={section.heading} className={cn("max-w-3xl text-4xl", large ? "sm:text-6xl" : "sm:text-5xl")} />
          <p data-hero-item className="max-w-xl text-base text-white/80">{section.subhead}</p>
        </Container>
      </HeroEntrance>
    </section>
  );
}
