"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";
import { cardGlassClassName } from "@/components/ui/card";
import { gsap, ScrollTrigger, prefersReducedMotion } from "@/lib/gsap";
import { cn } from "@/lib/utils";
import { SERVICES } from "@/lib/content";

// Every service in the catalogue, one card per group. Groups keep the order
// they first appear in services.json, so a service added in the CMS lands on
// the homepage without a second edit. Each service also carries its position
// in the whole list, which is what the scroll walkthrough steps through.
type Group = { title: string; services: (typeof SERVICES[number] & { index: number })[] };

const GROUPS = SERVICES.reduce<Group[]>((groups, service, index) => {
  const group = groups.find((g) => g.title === service.group);
  if (group) group.services.push({ ...service, index });
  else groups.push({ title: service.group, services: [{ ...service, index }] });
  return groups;
}, []);

/** Which card a given service sits in. */
const GROUP_OF = GROUPS.flatMap((group, groupIndex) => group.services.map(() => groupIndex));

// Scroll distance each service holds the spotlight for on desktop.
const STEP_VH = 28;

export function ServicePreview() {
  const trackRef = useRef<HTMLDivElement>(null);
  const railRef = useRef<HTMLDivElement>(null);
  // -1 until the walkthrough is armed: server render, no JS and reduced motion
  // all get the plain list with nothing dimmed.
  const [active, setActive] = useState(-1);

  useEffect(() => {
    if (!trackRef.current || !railRef.current) return;
    if (prefersReducedMotion()) return;

    const mm = gsap.matchMedia();

    // Desktop: a sticky viewport holds the section while vertical scroll steps
    // the spotlight through the services one at a time; when it crosses into a
    // new group, the rail slides that card into view. Sticky rather than
    // ScrollTrigger's `pin`, which reparents the element into a .pin-spacer and
    // breaks React's ownership of the DOM.
    mm.add("(min-width: 1024px)", () => {
      const rail = railRef.current!;
      const cards = gsap.utils.toArray<HTMLElement>(".js-service-card", rail);
      const slide = gsap.quickTo(rail, "x", { duration: 0.8, ease: "power3.out" });

      // Bring card `k` to the rail's left edge, but never past the point where
      // the last card is flush with the viewport — measured against the
      // clipping parent minus its centering padding, which is dead space.
      const xFor = (k: number) => {
        const parent = rail.parentElement;
        if (!parent || !cards[k]) return 0;
        const visible = parent.clientWidth - parseFloat(getComputedStyle(parent).paddingLeft);
        const maxShift = Math.max(0, rail.scrollWidth - visible);
        return -Math.min(cards[k].offsetLeft, maxShift);
      };

      let current = -1;
      const show = (index: number) => {
        if (index === current) return;
        const groupChanged = current === -1 || GROUP_OF[index] !== GROUP_OF[current];
        current = index;
        setActive(index);
        if (groupChanged) slide(xFor(GROUP_OF[index]));
      };

      const trigger = ScrollTrigger.create({
        trigger: trackRef.current,
        start: "top top",
        end: "bottom bottom",
        invalidateOnRefresh: true,
        onUpdate: (self) =>
          show(Math.min(SERVICES.length - 1, Math.floor(self.progress * SERVICES.length))),
        onRefresh: (self) => {
          // Re-align after a resize; the card offsets will have moved.
          if (current !== -1) gsap.set(rail, { x: xFor(GROUP_OF[current]) });
          else show(Math.min(SERVICES.length - 1, Math.floor(self.progress * SERVICES.length)));
        },
      });

      return () => {
        trigger.kill();
        gsap.set(rail, { clearProps: "transform" });
        setActive(-1);
      };
    });

    // Below the breakpoint the cards stack, and each service takes the
    // spotlight as it crosses the middle of the screen, in either direction.
    mm.add("(max-width: 1023px)", () => {
      const rows = gsap.utils.toArray<HTMLElement>(".js-service-row", railRef.current);
      setActive(0);
      const triggers = rows.map((row, index) =>
        ScrollTrigger.create({
          trigger: row,
          start: "top 55%",
          end: "bottom 55%",
          onToggle: (self) => self.isActive && setActive(index),
        })
      );

      return () => {
        triggers.forEach((t) => t.kill());
        setActive(-1);
      };
    });

    return () => mm.revert();
  }, []);

  const armed = active !== -1;

  return (
    <section className="relative">
      <div
        ref={trackRef}
        style={{ "--steps": SERVICES.length, "--step": `${STEP_VH}vh` } as CSSProperties}
        className="lg:h-[calc(100vh+var(--steps)*var(--step))]"
      >
        <div className="py-24 sm:py-32 lg:sticky lg:top-20 lg:flex lg:h-[calc(100vh-5rem)] lg:flex-col lg:justify-center lg:py-0">
          <Container className="flex flex-col gap-16">
            <div className="flex flex-col items-center justify-between gap-6 sm:flex-row sm:items-end">
              <SectionHeading eyebrow="Services" title="Everything we do, in one place." align="center" />
              <Button variant="ghost" size="lg" asChild><Link href="/services">View All Services</Link></Button>
            </div>
          </Container>
          {/* Desktop: full-bleed so cards can run off the right edge of the
              viewport. Below lg the cards stack inside the page gutter. */}
          <div className="mt-12 px-6 lg:overflow-x-hidden lg:pr-0 lg:pl-[max(1.5rem,calc((100vw-80rem)/2+2rem))]">
            <div
              ref={railRef}
              className="mx-auto flex max-w-2xl flex-col gap-6 lg:mx-0 lg:w-max lg:max-w-none lg:flex-row lg:pr-6 lg:will-change-transform"
            >
              {GROUPS.map((group, groupIndex) => {
                const groupActive = armed && GROUP_OF[active] === groupIndex;
                return (
                  <div
                    key={group.title}
                    className={cn(
                      cardGlassClassName,
                      "js-service-card flex shrink-0 flex-col gap-5 p-6 transition-[border-color,box-shadow] duration-500 lg:w-[30vw] lg:p-7",
                      groupActive && "border-primary/30 shadow-card-hover"
                    )}
                  >
                    <div className="flex items-baseline justify-between gap-4">
                      <h3 className="as-eyebrow as-eyebrow-accent">{group.title}</h3>
                      <span className="as-eyebrow text-muted-foreground">
                        {String(group.services.length).padStart(2, "0")}
                      </span>
                    </div>
                    <ul className="flex flex-col">
                      {group.services.map((service) => {
                        const isActive = service.index === active;
                        const isUpcoming = armed && service.index > active;
                        return (
                          <li
                            key={service.slug}
                            className="js-service-row border-t border-border first:border-t-0"
                          >
                            <Link
                              href={`/services/${service.category}/${service.slug}`}
                              aria-current={isActive ? "step" : undefined}
                              className={cn(
                                "group relative -mx-3 flex items-start justify-between gap-3 rounded-lg px-3 py-2.5 transition-[background-color,opacity] duration-500 hover:bg-foreground/5 lg:[@media(max-height:820px)]:py-2",
                                isActive && "bg-primary/[0.06] hover:bg-primary/[0.08]",
                                isUpcoming && "opacity-35 hover:opacity-100"
                              )}
                            >
                              {/* Red spotlight bar, grown from the centre. */}
                              <span
                                aria-hidden
                                className={cn(
                                  "absolute inset-y-2 left-0 w-[3px] origin-center rounded-full bg-primary transition-transform duration-500",
                                  isActive ? "scale-y-100" : "scale-y-0"
                                )}
                              />
                              <span className="flex flex-col">
                                <span
                                  className={cn(
                                    "text-foreground transition-[font-weight] duration-300",
                                    isActive ? "font-bold" : "font-semibold"
                                  )}
                                >
                                  {service.title}
                                </span>
                                {/* Dropped on short desktop screens so the tallest card
                                    (Advisory) still fits inside the sticky viewport. */}
                                <span
                                  className={cn(
                                    "text-sm transition-colors duration-500 lg:[@media(max-height:820px)]:hidden",
                                    isActive ? "text-foreground/80" : "text-muted-foreground"
                                  )}
                                >
                                  {service.tagline}
                                </span>
                              </span>
                              <ArrowUpRight
                                className={cn(
                                  "mt-1 size-4 shrink-0 text-primary transition-transform duration-500 group-hover:-translate-y-0.5 group-hover:translate-x-0.5",
                                  isActive && "-translate-y-0.5 translate-x-0.5 scale-125"
                                )}
                                aria-hidden
                              />
                            </Link>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
