"use client";

import { m } from "framer-motion";
import { Check } from "lucide-react";
import Link from "next/link";
import { AuroraBackground } from "@/components/ui/aurora-background";
import { Container } from "@/components/ui/container";
import { Badge } from "@/components/ui/badge";
import { FramedImage } from "@/components/ui/framed-image";
import { GROUP_IMAGES, type Service } from "@/lib/services-data";

type ServiceDetailProps = {
  service: Service;
  related: Service[];
};

export function ServiceDetail({ service, related }: ServiceDetailProps) {
  const words = service.title.split(" ");

  return (
    <>
      <section className="relative flex min-h-[40vh] items-center overflow-hidden py-20 sm:py-24">
        <AuroraBackground />
        <Container className="relative z-10 flex flex-col items-center gap-6 text-center">
          <Badge>{service.group}</Badge>
          <h1 className="max-w-3xl text-4xl font-display font-medium tracking-tight text-foreground sm:text-5xl">
            {words.map((word, index) => (
              <m.span
                key={`${word}-${index}`}
                initial={{ opacity: 0, y: "0.6em", filter: "blur(10px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                transition={{ duration: 0.6, delay: index * 0.04, ease: [0.16, 1, 0.3, 1] }}
                className="mr-[0.2em] inline-block"
              >
                {word}
              </m.span>
            ))}
          </h1>
          <p className="max-w-xl text-lg text-muted-foreground">{service.tagline}</p>
        </Container>
      </section>

      <section className="py-24 sm:py-32">
        <Container className="grid gap-12 lg:grid-cols-[7fr_5fr] lg:gap-16">
          <div className="flex flex-col gap-6">
            <span className="text-sm font-medium uppercase tracking-widest text-primary">What&apos;s Included</span>
            <ul className="flex flex-col gap-4">
              {service.includes.map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <Check className="mt-1 h-5 w-5 shrink-0 text-primary" aria-hidden />
                  <span className="text-foreground/90">{item}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="flex flex-col gap-8">
            <FramedImage
              src={GROUP_IMAGES[service.group].src}
              alt={GROUP_IMAGES[service.group].alt}
              caption={GROUP_IMAGES[service.group].caption}
              aspectClassName="aspect-[4/3]"
              sizes="(min-width: 1024px) 420px, 100vw"
            />
            <div className="flex flex-col gap-3 rounded-2xl border border-glass-border bg-secondary/40 p-8">
              <h3 className="font-display text-lg font-medium text-foreground">Who This Is For</h3>
              <p className="text-sm text-muted-foreground">{service.whoFor}</p>
            </div>
            {related.length > 0 ? (
              <div className="flex flex-col gap-3 rounded-2xl border border-glass-border bg-secondary/40 p-8">
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
              </div>
            ) : null}
          </div>
        </Container>
      </section>
    </>
  );
}
