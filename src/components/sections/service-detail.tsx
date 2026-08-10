"use client";

import { Check } from "lucide-react";
import Link from "next/link";
import { AuroraBackground } from "@/components/ui/aurora-background";
import { AmbientGlow } from "@/components/ui/ambient-glow";
import { Container } from "@/components/ui/container";
import { Badge } from "@/components/ui/badge";
import { DisplayHeading } from "@/components/ui/display-heading";
import { FramedImage } from "@/components/ui/framed-image";
import { Card } from "@/components/ui/card";
import { ParallaxBlock, Reveal, Stagger, StaggerItem } from "@/components/ui/scroll-reveal";
import { GROUP_IMAGES, type Service } from "@/lib/services-data";

type ServiceDetailProps = {
  service: Service;
  related: Service[];
};

export function ServiceDetail({ service, related }: ServiceDetailProps) {
  return (
    <>
      <section className="relative flex min-h-[40vh] items-center overflow-hidden py-20 sm:py-24">
        <AuroraBackground />
        <AmbientGlow className="opacity-50" />
        <Container className="relative z-10 flex flex-col items-center gap-6 text-center">
          <Badge>{service.group}</Badge>
          <DisplayHeading text={service.title} className="max-w-3xl text-4xl sm:text-5xl" />
          <p className="max-w-xl text-lg text-muted-foreground">{service.tagline}</p>
        </Container>
      </section>

      <section className="py-24 sm:py-32">
        <Container className="grid gap-12 lg:grid-cols-[7fr_5fr] lg:gap-16">
          <Reveal className="flex flex-col gap-6">
            <span className="text-sm font-medium uppercase tracking-widest text-primary">What&apos;s Included</span>
            <Stagger className="flex flex-col gap-4">
              {service.includes.map((item) => (
                <StaggerItem key={item} className="flex items-start gap-3">
                  <Check className="mt-1 h-5 w-5 shrink-0 text-primary" aria-hidden />
                  <span className="text-foreground/90">{item}</span>
                </StaggerItem>
              ))}
            </Stagger>
          </Reveal>
          {/* The sidebar drifts slightly slower than the copy column beside it,
              which opens a little depth between the two. */}
          <ParallaxBlock distance={-60} className="lg:mt-0">
            <Reveal delay={0.1} className="flex flex-col gap-8">
            <FramedImage
              src={GROUP_IMAGES[service.group].src}
              alt={GROUP_IMAGES[service.group].alt}
              caption={GROUP_IMAGES[service.group].caption}
              aspectClassName={GROUP_IMAGES[service.group].aspectClassName}
              sizes="(min-width: 1024px) 420px, 100vw"
            />
            <Card variant="glass" hover={false} className="flex flex-col gap-3">
              <h3 className="font-display text-lg font-medium text-foreground">Who This Is For</h3>
              <p className="text-sm text-muted-foreground">{service.whoFor}</p>
            </Card>
            {related.length > 0 ? (
              <Card variant="glass" hover={false} className="flex flex-col gap-3">
                <h3 className="font-display text-lg font-medium text-foreground">Related Services</h3>
                <ul className="flex flex-col gap-2">
                  {related.map((item) => (
                    <li key={item.slug}>
                      <Link
                        href={`/services/${item.category}/${item.slug}`}
                        className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                      >
                        {item.title}
                      </Link>
                    </li>
                  ))}
                </ul>
              </Card>
            ) : null}
            </Reveal>
          </ParallaxBlock>
        </Container>
      </section>
    </>
  );
}
