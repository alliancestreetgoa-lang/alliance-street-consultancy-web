"use client";

import { m } from "framer-motion";
import { AuroraBackground } from "@/components/ui/aurora-background";
import { AmbientGlow } from "@/components/ui/ambient-glow";
import { Container } from "@/components/ui/container";
import { Badge } from "@/components/ui/badge";

const HEADLINE = "Built by people who've sat on your side of the table.";

export function AboutHero() {
  const words = HEADLINE.split(" ");

  return (
    <section className="relative flex min-h-[45vh] items-center overflow-hidden py-20 sm:min-h-[55vh] sm:py-28">
      <AuroraBackground />
      <AmbientGlow className="opacity-50" />
      <Container className="relative z-10 flex flex-col items-center gap-6 text-center">
        <Badge>About Alliance Street</Badge>
        <h1 className="max-w-3xl text-4xl font-display font-medium tracking-tight text-foreground sm:text-6xl text-glow">
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
          We started Alliance Street because too many founders learn about a compliance gap from a
          penalty notice instead of an advisor.
        </p>
      </Container>
    </section>
  );
}
