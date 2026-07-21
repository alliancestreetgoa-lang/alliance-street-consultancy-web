"use client";

import { m } from "framer-motion";
import { AuroraBackground } from "@/components/ui/aurora-background";
import { Container } from "@/components/ui/container";
import { Badge } from "@/components/ui/badge";

const HEADLINE = "Real situations, and how we work them.";

export function CaseStudiesHero() {
  const words = HEADLINE.split(" ");

  return (
    <section className="relative flex min-h-[45vh] items-center overflow-hidden py-20 sm:min-h-[55vh] sm:py-28">
      <AuroraBackground />
      <Container className="relative z-10 flex flex-col items-center gap-6 text-center">
        <Badge>Case Studies</Badge>
        <h1 className="max-w-3xl text-4xl font-display font-medium tracking-tight text-foreground sm:text-6xl">
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
        <p className="max-w-xl text-lg text-muted-foreground">
          Six recurring scenarios from across UAE setup, tax, UK services, and advisory —
          illustrative of how an engagement actually runs, not a list of named clients.
        </p>
      </Container>
    </section>
  );
}
