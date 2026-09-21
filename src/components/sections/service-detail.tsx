"use client";

import { Check } from "lucide-react";
import Link from "next/link";
import { AmbientGlow } from "@/components/ui/ambient-glow";
import { Container } from "@/components/ui/container";
import { DisplayHeading } from "@/components/ui/display-heading";
import { FramedImage } from "@/components/ui/framed-image";
import { Card } from "@/components/ui/card";
import { HeroEntrance, ParallaxBlock, Reveal, ScrubRail, Stagger, StaggerItem } from "@/components/ui/scroll-reveal";
import { GROUP_IMAGES, type Service } from "@/lib/services-data";

type ServiceDetailProps = {
  service: Service;
  related: Service[];
};

export function ServiceDetail({ service, related }: ServiceDetailProps) {
  return (
    <>
      {/* Dark, like the live site's service pages (see /dubai-business-setup):
          black ground, red glow, mono eyebrow, then a wedge into the light
          body. surface-dark remaps the tokens, so the children are unchanged. */}
      <section className="surface-dark relative flex min-h-[46vh] items-center overflow-hidden bg-background py-24 sm:py-32">
        <AmbientGlow className="opacity-60" />
        <HeroEntrance className="relative z-10 w-full">
          <Container className="flex flex-col items-center gap-6 text-center">
            <span data-hero-item className="as-eyebrow">
              {service.group}
            </span>
            <DisplayHeading text={service.title} className="max-w-3xl text-4xl sm:text-5xl" />
            <p data-hero-item className="max-w-xl text-base text-muted-foreground">
              {service.tagline}
            </p>
          </Container>
        </HeroEntrance>
        <span className="as-wedge" aria-hidden />
      </section>

      <section className="py-24 sm:py-32">
        <Container className="grid gap-12 lg:grid-cols-[7fr_5fr] lg:gap-16">
          <Reveal className="flex flex-col gap-6">
            {/*
              The direct answer sits above "What's Included" deliberately: it is
              the thing the visitor searched for, and the thing an AI engine can
              lift as a self-contained answer. Sources are shown on the page
              rather than hidden in a comment — for YMYL tax content, a visible
              primary-source citation and a verification date are the trust
              signal, not clutter.

              Only 6 of 20 services have one. The rest render nothing here,
              which is correct: an empty block beats an invented figure.
            */}
            {service.directAnswer && (
              <div className="flex flex-col gap-4 border-l-2 border-primary/40 pl-5">
                <h2 className="text-2xl font-semibold text-balance text-foreground">
                  {service.directAnswer.question}
                </h2>
                <p className="text-base leading-relaxed text-foreground/90">{service.directAnswer.answer}</p>
                <p className="text-xs text-muted-foreground">
                  <span className="font-medium">Sources: </span>
                  {service.directAnswer.sources.map((source, index) => (
                    <span key={source.url}>
                      {index > 0 && " · "}
                      <a
                        href={source.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="underline underline-offset-2 hover:text-foreground"
                      >
                        {source.label}
                      </a>
                    </span>
                  ))}
                  {". "}
                  <span>
                    Figures verified{" "}
                    <time dateTime={service.directAnswer.verifiedOn}>
                      {new Date(`${service.directAnswer.verifiedOn}T00:00:00Z`).toLocaleDateString("en-GB", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                        timeZone: "UTC",
                      })}
                    </time>
                    . General information, not tax advice — thresholds and deadlines change.
                  </span>
                </p>
              </div>
            )}
            {/* A real heading, not a styled span: this labels the page's main
                content block, and heading structure is how both crawlers and
                screen readers find it. Visual treatment is unchanged. */}
            <h2 className="as-eyebrow as-eyebrow-accent">What&apos;s Included</h2>
            {/* The rail draws downward as the list scrolls past, so the
                checklist reads as being worked through. Scrubbed to the
                scrollbar; the rail is absolutely positioned so it cannot
                shift layout. */}
            <ScrubRail>
              <Stagger className="flex flex-col gap-4">
                {service.includes.map((item) => (
                  <StaggerItem key={item} className="flex items-start gap-3">
                    <Check className="mt-1 h-5 w-5 shrink-0 text-primary" aria-hidden />
                    <span className="text-foreground/90">{item}</span>
                  </StaggerItem>
                ))}
              </Stagger>
            </ScrubRail>
            <Card variant="glass" hover={false} className="mt-2 flex flex-col gap-3">
              <h3 className="text-lg font-semibold text-foreground">Who This Is For</h3>
              <p className="text-sm text-muted-foreground">{service.whoFor}</p>
            </Card>
            {related.length > 0 ? (
              <Card variant="glass" hover={false} className="flex flex-col gap-3">
                <h3 className="text-lg font-semibold text-foreground">Related Services</h3>
                <ul className="flex flex-col gap-2">
                  {related.map((item) => (
                    <li key={item.slug}>
                      <Link
                        href={`/services/${item.category}/${item.slug}`}
                        className="text-sm text-muted-foreground transition-colors duration-350 hover:text-foreground"
                      >
                        {item.title}
                      </Link>
                    </li>
                  ))}
                </ul>
              </Card>
            ) : null}
          </Reveal>
          {/* The sidebar drifts slightly slower than the copy column beside it,
              which opens a little depth between the two. */}
          <ParallaxBlock distance={-60} className="lg:mt-0">
            <Reveal delay={0.1}>
            <FramedImage
              src={GROUP_IMAGES[service.group].src}
              alt={GROUP_IMAGES[service.group].alt}
              caption={GROUP_IMAGES[service.group].caption}
              aspectClassName={GROUP_IMAGES[service.group].aspectClassName}
              sizes="(min-width: 1024px) 420px, 100vw"
            />
            </Reveal>
          </ParallaxBlock>
        </Container>
      </section>
    </>
  );
}
