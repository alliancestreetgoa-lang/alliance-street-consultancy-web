"use client";

import { useEffect, useRef } from "react";
import { AuroraBackground } from "@/components/ui/aurora-background";
import { Container } from "@/components/ui/container";
import { Badge } from "@/components/ui/badge";
import { DisplayHeading } from "@/components/ui/display-heading";
import { MagneticButton } from "@/components/ui/magnetic-button";
import { asset } from "@/lib/asset-path";
import { gsap, prefersReducedMotion } from "@/lib/gsap";

const HEADLINE = "Company formation and compliance, without the guesswork.";

export function Hero() {
  const sectionRef = useRef<HTMLElement>(null);
  const backdropRef = useRef<HTMLDivElement>(null);
  const copyRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!sectionRef.current) return;
    if (prefersReducedMotion()) return;

    const ctx = gsap.context(() => {
      // One timeline, one ScrollTrigger — two separately-triggered tweens on the
      // same scroll range would each measure and update independently.
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top top",
          end: "bottom top",
          scrub: 0.6,
          invalidateOnRefresh: true,
        },
      });

      // The photo sinks slowly and creeps closer; the copy leaves faster. The
      // difference between the two rates is the parallax.
      tl.to(backdropRef.current, { yPercent: 14, scale: 1.08, ease: "none" }, 0).to(
        copyRef.current,
        { yPercent: -18, opacity: 0.25, ease: "none" },
        0
      );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative isolate flex min-h-[100dvh] flex-col items-center justify-center overflow-hidden py-20 sm:py-28"
    >
      {/* Dubai skyline video — sits low in the frame so it reads as a horizon
          under the copy; the veils above it keep the dark type legible. */}
      <div ref={backdropRef} aria-hidden className="absolute inset-0 -z-10 will-change-transform">
        <video
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          poster={asset("/brand/hero-video-poster.jpg")}
          className="absolute inset-0 h-full w-full object-cover object-[center_40%]"
        >
          <source src={asset("/brand/hero-video.mp4")} type="video/mp4" />
        </video>
        {/* Light wash — enough to hold dark type, light enough that the video reads. */}
        <div className="absolute inset-0 bg-background/24" />
        {/* Soft bed directly under the copy column so the headline never fights the skyline. */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_65%_60%_at_50%_42%,var(--background)_0%,color-mix(in_oklch,var(--background)_44%,transparent)_45%,transparent_78%)]" />
        {/* Blend into the white navbar above and the next section below. */}
        <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-background to-transparent" />
        <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-b from-transparent to-background" />
      </div>
      <AuroraBackground />
      <Container
        ref={copyRef}
        className="relative z-10 flex flex-col items-center gap-6 text-center will-change-transform"
      >
        <Badge className="max-w-[calc(100vw-3rem)] text-center">
          UAE & UK Company Formation, Tax & Advisory
        </Badge>
        <DisplayHeading text={HEADLINE} className="max-w-5xl text-hero" />
        <p className="max-w-2xl text-lg text-foreground/75">
          Alliance Street handles UAE and UK company setup, tax, accounting, and advisory under one
          roof — so you spend less time on paperwork and more time running the business you started
          it for.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-4">
          <MagneticButton href="/book-consultation" variant="primary">
            Book a Consultation
          </MagneticButton>
          <MagneticButton href="/services" variant="glass">
            View Services
          </MagneticButton>
        </div>
      </Container>
    </section>
  );
}
