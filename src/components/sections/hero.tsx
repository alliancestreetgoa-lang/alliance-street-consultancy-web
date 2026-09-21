"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { DisplayHeading } from "@/components/ui/display-heading";
import { asset } from "@/lib/asset-path";
import { gsap, prefersReducedMotion } from "@/lib/gsap";

const HEADLINE = "Company formation and compliance, without the guesswork.";

/**
 * Home hero, built on the live site's structure: a dark-red → white gradient
 * wall with a floating card sitting on it, left-aligned copy, red corner
 * brackets and a red rule closing the card's base.
 *
 * The one departure from alliancestreet.ae is the card's backdrop — the live
 * card is plain white, this one holds the Dubai skyline video. The washes over
 * the video reproduce the live card's black-on-light contrast so the type
 * reads the same way.
 */
export function Hero() {
  const sectionRef = useRef<HTMLElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
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

      // The card sinks slowly; the copy inside it leaves faster. The difference
      // between the two rates is the parallax.
      tl.to(cardRef.current, { yPercent: 8, scale: 0.98, ease: "none" }, 0).to(
        copyRef.current,
        { yPercent: -14, opacity: 0.3, ease: "none" },
        0
      );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="as-wall-hero relative isolate flex min-h-[100dvh] flex-col justify-center overflow-hidden pt-28 pb-20 sm:pt-32 sm:pb-28"
    >
      <Container>
        <div ref={cardRef} className="relative mx-auto w-full max-w-5xl will-change-transform">
          {/* Outside the card frame: it clips to its own radius, which would
              round the brackets' right angles away. */}
          <span className="as-bracket" data-corner="top-left" aria-hidden />
          <span className="as-bracket" data-corner="bottom-right" aria-hidden />
          <div className="as-card-frame">
          {/* Dubai skyline video, held inside the card rather than behind the
              page. The washes keep it subordinate to the type. */}
          {/* z-0, not -z-10: the card frame is no longer the element carrying
              will-change, so it is not a stacking context, and a negative
              z-index would paint the video behind the card's own fill. */}
          <div aria-hidden className="absolute inset-0 z-0">
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
            <div className="absolute inset-0 bg-background/70" />
            {/* Denser bed under the copy column so the headline never fights the skyline. */}
            <div className="absolute inset-0 bg-[linear-gradient(100deg,var(--background)_0%,color-mix(in_oklch,var(--background)_88%,transparent)_46%,color-mix(in_oklch,var(--background)_40%,transparent)_100%)]" />
          </div>

          <div
            ref={copyRef}
            className="relative z-10 flex flex-col items-start gap-6 px-6 py-14 will-change-transform sm:px-12 sm:py-20"
          >
            <span className="inline-flex items-center gap-3 rounded-full bg-secondary px-4 py-2 text-sm text-foreground">
              UAE &amp; UK company formation, tax &amp; advisory
              <Link href="/services" className="font-semibold underline underline-offset-4">
                Read more
              </Link>
            </span>

            <DisplayHeading text={HEADLINE} className="max-w-3xl text-left text-hero" />

            <p className="max-w-xl text-base text-muted-foreground">
              Alliance Street handles UAE and UK company setup, tax, accounting, and advisory under
              one roof — so you spend less time on paperwork and more time running the business you
              started it for.
            </p>

            <div className="flex flex-wrap items-center gap-6">
              <Button size="lg" asChild>
                <Link href="/book-consultation">Book a Consultation</Link>
              </Button>
              <Link
                href="/services"
                className="group inline-flex items-center gap-2 text-base font-semibold text-foreground"
              >
                View services
                <ArrowRight className="size-4 transition-transform duration-350 group-hover:translate-x-1" />
              </Link>
            </div>
          </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
