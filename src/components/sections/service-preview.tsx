"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";
import { cardGlassClassName } from "@/components/ui/card";
import { gsap, prefersReducedMotion } from "@/lib/gsap";
import { cn } from "@/lib/utils";
import servicesContent from "@/content/sections/service-preview.json";

const SERVICES = servicesContent.items;


export function ServicePreview() {
  const trackRef = useRef<HTMLDivElement>(null);
  const railRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!trackRef.current || !railRef.current) return;
    if (prefersReducedMotion()) return;

    const mm = gsap.matchMedia();

    // Desktop: vertical scroll drives the rail sideways while a sticky viewport
    // holds it in place. Sticky rather than ScrollTrigger's `pin`, which reparents
    // the element into a .pin-spacer and breaks React's ownership of the DOM.
    mm.add("(min-width: 1024px)", () => {
      const rail = railRef.current!;

      const tween = gsap.to(rail, {
        // Distance is the rail's overflow past its visible window. Measured
        // against the clipping parent, not the rail: the rail is `w-max`, so its
        // own scrollWidth and offsetWidth are identical and would give 0.
        // The parent's large centering padding-left is dead space, not window —
        // subtract it, or the rail stops short and the last card stays clipped.
        // In a function so a resize (via invalidateOnRefresh) re-measures rather
        // than reusing the first layout's number.
        x: () => {
          const parent = rail.parentElement;
          if (!parent) return 0;
          const visible = parent.clientWidth - parseFloat(getComputedStyle(parent).paddingLeft);
          return -Math.max(0, rail.scrollWidth - visible);
        },
        ease: "none",
        scrollTrigger: {
          trigger: trackRef.current,
          start: "top top",
          end: "bottom bottom",
          scrub: 0.7,
          invalidateOnRefresh: true,
        },
      });

      return () => {
        tween.kill();
        gsap.set(rail, { clearProps: "transform" });
      };
    });

    // Below the breakpoint the rail is a normal swipeable overflow strip, and
    // the cards just reveal in sequence.
    mm.add("(max-width: 1023px)", () => {
      const cards = gsap.utils.toArray<HTMLElement>(".js-service-card");
      const tween = gsap.fromTo(
        cards,
        { opacity: 0, y: 40 },
        {
          opacity: 1,
          y: 0,
          duration: 0.6,
          stagger: 0.08,
          ease: "power3.out",
          scrollTrigger: { trigger: trackRef.current, start: "top 85%", once: true },
        }
      );

      return () => {
        tween.kill();
        gsap.set(cards, { clearProps: "opacity,transform" });
      };
    });

    return () => mm.revert();
  }, []);

  return (
    <section className="relative">
      <div ref={trackRef} className="lg:h-[260vh]">
        <div className="py-24 sm:py-32 lg:sticky lg:top-20 lg:flex lg:h-[calc(100vh-5rem)] lg:flex-col lg:justify-center lg:py-0">
          <Container className="flex flex-col gap-16">
            <div className="flex flex-col items-center justify-between gap-6 sm:flex-row sm:items-end">
              <SectionHeading eyebrow="Services" title="Where clients start with us." align="center" />
              <Button variant="ghost" size="lg" asChild><Link href="/services">View All Services</Link></Button>
            </div>
          </Container>
          {/* Full-bleed so cards can run off the right edge of the viewport. */}
          <div className="mt-12 overflow-x-auto pl-6 lg:overflow-x-hidden lg:pl-[max(1.5rem,calc((100vw-80rem)/2+2rem))]">
            <div ref={railRef} className="flex w-max gap-6 pr-6 will-change-transform">
              {SERVICES.map((service) => (
                <Link
                  key={service.href}
                  href={service.href}
                  className={cn(
                    cardGlassClassName,
                    "js-service-card group flex w-[78vw] shrink-0 flex-col justify-between gap-6 sm:w-[46vw] lg:w-[32vw]"
                  )}
                >
                  <div>
                    <h3 className="text-xl font-semibold text-foreground">
                      {service.title}
                    </h3>
                    <p className="mt-3 text-muted-foreground">{service.description}</p>
                  </div>
                  <ArrowUpRight
                    className="h-5 w-5 text-primary transition-transform group-hover:-translate-y-1 group-hover:translate-x-1"
                    aria-hidden
                  />
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
