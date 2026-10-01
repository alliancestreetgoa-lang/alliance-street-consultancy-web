"use client";

import { useEffect, useRef } from "react";
import { Container } from "@/components/ui/container";
import { gsap, prefersReducedMotion } from "@/lib/gsap";
import statsContent from "@/content/sections/stats.json";

const STATS: { value: number; suffix?: string; label: string }[] = statsContent.items;

/**
 * The numbers strip under the home hero.
 *
 * The server renders the final figures, so crawlers, no-JS visitors and
 * reduced-motion visitors all read the real numbers. With motion allowed, each
 * figure counts up from 0 and rises into place as the strip scrolls into view —
 * scrubbed to the scroll position, so scrolling back up counts them back down.
 */
export function Stats() {
  const rootRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!rootRef.current || prefersReducedMotion()) return;

    const ctx = gsap.context(() => {
      const items = gsap.utils.toArray<HTMLElement>(".js-stat");
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: rootRef.current,
          start: "top 95%",
          end: "top 45%",
          scrub: 0.6,
          invalidateOnRefresh: true,
        },
      });

      items.forEach((item, index) => {
        const number = item.querySelector<HTMLElement>(".js-stat-value");
        if (!number) return;
        const target = STATS[index].value;
        const counter = { value: 0 };
        const at = index * 0.12;

        tl.fromTo(item, { y: 48, opacity: 0 }, { y: 0, opacity: 1, ease: "power3.out", duration: 0.5 }, at);
        tl.to(
          counter,
          {
            value: target,
            ease: "power2.out",
            duration: 1,
            onUpdate: () => {
              number.textContent = String(Math.round(counter.value));
            },
          },
          at
        );
      });
    }, rootRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={rootRef} className="relative pb-16 sm:pb-20">
      <Container>
        <dl className="mx-auto grid max-w-5xl gap-12 sm:grid-cols-3 sm:gap-8">
          {STATS.map((stat, index) => (
            <div
              key={stat.label}
              className={
                index === 0
                  ? "js-stat flex flex-col gap-4 sm:gap-5 sm:justify-self-start"
                  : index === STATS.length - 1
                    ? "js-stat flex flex-col gap-4 sm:gap-5 sm:justify-self-end"
                    : "js-stat flex flex-col gap-4 sm:gap-5 sm:justify-self-center"
              }
            >
              {/* The label is the term and the figure its value, read in that
                  order by screen readers; visually the figure leads. */}
              <dt className="as-stat-label order-2 text-base sm:text-lg">{stat.label}</dt>
              <dd className="as-stat as-stat-home order-1 tabular-nums">
                {/* The invisible copy holds the box at the final figure's exact
                    width, so the count-up never reflows the row or opens a gap
                    before the suffix. */}
                <span className="inline-grid">
                  <span aria-hidden className="invisible [grid-area:1/1]">
                    {stat.value}
                  </span>
                  <span className="js-stat-value text-left [grid-area:1/1]">{stat.value}</span>
                </span>
                {stat.suffix ? <span className="as-stat-suffix as-stat-suffix-low">{stat.suffix}</span> : null}
              </dd>
            </div>
          ))}
        </dl>
      </Container>
    </section>
  );
}
