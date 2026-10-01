"use client";

import Image from "next/image";
import { asset } from "@/lib/asset-path";
import heroImages from "@/content/service-hero-images.json";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import Link from "next/link";
import { Container } from "@/components/ui/container";
import { DisplayHeading } from "@/components/ui/display-heading";
import { Card } from "@/components/ui/card";
import { HeroEntrance, Reveal, ScrubRail, Stagger, StaggerItem } from "@/components/ui/scroll-reveal";
import { type Service } from "@/lib/services-data";

type ServiceDetailProps = {
  service: Service;
  related: Service[];
};

export function ServiceDetail({ service, related }: ServiceDetailProps) {
  const hero = heroImages.images.find((image) => image.service === `${service.category}/${service.slug}`);

  return (
    <>
      <section className="surface-dark as-image-hero relative isolate flex overflow-hidden bg-background">
        {hero && (
          <Image
            src={asset(hero.src)}
            alt={hero.alt}
            fill
            preload
            sizes="100vw"
            className="-z-20 object-cover object-[65%_center] sm:object-center"
          />
        )}
        <div aria-hidden className="absolute inset-0 -z-10 bg-[linear-gradient(90deg,rgba(0,0,0,0.86)_0%,rgba(0,0,0,0.7)_42%,rgba(0,0,0,0.15)_100%)]" />
        <HeroEntrance className="w-full">
          <Container className="flex flex-col items-start gap-6">
            <Link href="/services" data-hero-item className="text-sm text-white/80 underline-offset-4 hover:text-white hover:underline">
              All services / {service.group}
            </Link>
            <DisplayHeading text={service.title} className="max-w-3xl text-4xl sm:text-5xl lg:text-6xl" />
            <p data-hero-item className="max-w-xl text-lg text-white/85">
              {service.tagline}
            </p>
            <Button data-hero-item size="lg" asChild className="mt-2">
              <Link href="/book-consultation">Book a Consultation</Link>
            </Button>
          </Container>
        </HeroEntrance>
      </section>

      <section className="py-24 sm:py-32">
        <Container className="max-w-4xl">
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

        </Container>
      </section>
    </>
  );
}
