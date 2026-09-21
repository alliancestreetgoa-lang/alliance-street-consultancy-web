"use client";

import { useEffect, useRef } from "react";
import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";
import { AmbientGlow } from "@/components/ui/ambient-glow";
import { gsap, prefersReducedMotion } from "@/lib/gsap";

const STEPS = [
  {
    title: "Discovery Call",
    description:
      "We learn about your business, where you're trading, and what structure actually fits — not the one that's easiest to sell.",
  },
  {
    title: "Structuring & Setup",
    description:
      "We recommend the right jurisdiction and entity type, then handle formation, licensing, and banking introductions.",
  },
  {
    title: "Compliance, Built In",
    description:
      "VAT, corporate tax, and bookkeeping are set up correctly from day one, not fixed after an audit finds the gaps.",
  },
  {
    title: "Ongoing Partnership",
    description:
      "We stay on as your accountant and advisor — filings, renewals, and the questions that come up in between.",
  },
];

export function Process() {
  const trackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!trackRef.current) return;
    if (prefersReducedMotion()) return;

    // gsap.matchMedia() manages its own cleanup, so it is used directly rather
    // than nested inside a gsap.context().
    const mm = gsap.matchMedia();

    {
      // Desktop: the panel is held in place by CSS `position: sticky` while the
      // tall track scrolls past it, and ScrollTrigger only scrubs opacity.
      //
      // Deliberately NOT ScrollTrigger's `pin: true`: pinning wraps the element
      // in a .pin-spacer, which makes GSAP the element's parent instead of React.
      // On a client-side route change React then tries to remove the section from
      // a node that is no longer its parent and the whole app dies with
      // "removeChild: The node to be removed is not a child of this node".
      // Sticky gets the same effect with React keeping ownership of the DOM.
      mm.add("(min-width: 1024px)", () => {
        const steps = gsap.utils.toArray<HTMLElement>(".js-process-step");

        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: trackRef.current,
            start: "top top",
            end: "bottom bottom",
            scrub: 0.8,
            invalidateOnRefresh: true,
          },
        });

        steps.forEach((step, index) => {
          // Each step rises to full strength, then dims as the next takes over,
          // so exactly one reads as "current" at any scroll position.
          tl.fromTo(
            step,
            { opacity: 0.25, y: 12 },
            { opacity: 1, y: 0, duration: 0.6, ease: "power2.out" },
            index * 0.8
          );
          if (index < steps.length - 1) {
            tl.to(step, { opacity: 0.25, duration: 0.4, ease: "none" }, index * 0.8 + 0.6);
          }
        });

        return () => gsap.set(steps, { clearProps: "opacity,transform" });
      });

      // Below the sticky breakpoint the four columns collapse to one, so the
      // steps simply reveal in sequence. Separate branch rather than <Stagger>,
      // so only one system ever animates these elements' opacity.
      mm.add("(max-width: 1023px)", () => {
        const steps = gsap.utils.toArray<HTMLElement>(".js-process-step");
        const tween = gsap.fromTo(
          steps,
          { opacity: 0, y: 24 },
          {
            opacity: 1,
            y: 0,
            duration: 0.5,
            stagger: 0.08,
            ease: "power3.out",
            scrollTrigger: { trigger: trackRef.current, start: "top 88%", once: true },
          }
        );

        return () => {
          tween.kill();
          gsap.set(steps, { clearProps: "opacity,transform" });
        };
      });
    }

    return () => mm.revert();
  }, []);

  return (
    // No `overflow-hidden` here: it would make this element a scroll container
    // and stop the sticky panel below from sticking. AmbientGlow clips itself.
    <section className="relative">
      <AmbientGlow className="opacity-30" />
      <div ref={trackRef} className="lg:h-[280vh]">
        <div className="py-24 sm:py-32 lg:sticky lg:top-20 lg:flex lg:h-[calc(100vh-5rem)] lg:flex-col lg:justify-center lg:py-0">
          <Container className="relative z-10 flex flex-col gap-16">
            <SectionHeading
              eyebrow="Process"
              title="How an engagement actually works."
              align="center"
              className="mx-auto"
            />
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
              {STEPS.map((step, index) => (
                <div key={step.title} className="js-process-step flex flex-col gap-4">
                  {/* Space Mono numerals, as on the live site's "Battleplan". */}
                  <span className="font-mono text-2xl text-primary">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <h3 className="text-xl font-semibold text-foreground">{step.title}</h3>
                  <p className="text-base text-muted-foreground">{step.description}</p>
                </div>
              ))}
            </div>
          </Container>
        </div>
      </div>
    </section>
  );
}
