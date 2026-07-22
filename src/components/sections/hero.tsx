"use client";

import Image from "next/image";
import { m } from "framer-motion";
import { AuroraBackground } from "@/components/ui/aurora-background";
import { Container } from "@/components/ui/container";
import { Badge } from "@/components/ui/badge";
import { MagneticButton } from "@/components/ui/magnetic-button";

const HEADLINE = "Company formation and compliance, without the guesswork.";

export function Hero() {
  const words = HEADLINE.split(" ");

  return (
    <section className="relative overflow-hidden py-20 sm:py-28">
      <AuroraBackground />
      <div aria-hidden className="absolute inset-x-0 bottom-0 z-0 h-20 overflow-hidden sm:h-28">
        <Image src="/brand/dubai-skyline.png" alt="" fill sizes="100vw" className="object-cover object-bottom" />
        <div className="absolute inset-0 bg-gradient-to-b from-background to-transparent" />
      </div>
      <Container className="relative z-10 flex flex-col items-center gap-6 text-center">
        <Badge className="max-w-[calc(100vw-3rem)] text-center">
          UAE & UK Company Formation, Tax & Advisory
        </Badge>
        <h1 className="max-w-5xl text-hero font-display font-medium tracking-tight text-foreground">
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
        <p className="max-w-2xl text-lg text-muted-foreground">
          Alliance Street handles UAE and UK company setup, tax, accounting, and advisory under one
          roof — so you spend less time on paperwork and more time running the business you started
          it for.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-4">
          <MagneticButton href="/book-consultation" variant="primary">
            Book a Consultation
          </MagneticButton>
          <MagneticButton href="/services" variant="secondary">
            View Services
          </MagneticButton>
        </div>
      </Container>
    </section>
  );
}
