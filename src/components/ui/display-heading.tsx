"use client";

import { Fragment, useEffect, useRef } from "react";
import { m, useMotionValue, useReducedMotion, useSpring, useTransform } from "framer-motion";
import { cn } from "@/lib/utils";

type DisplayHeadingProps = {
  /** Plain text — split into words so each can stagger in. */
  text: string;
  /** Type scale / width classes for the call site. Dimension and balance are built in. */
  className?: string;
};

/**
 * The site's page-level h1: words stagger in, and the type tilts a few degrees
 * toward the cursor.
 *
 * The extruded `.text-3d` face this used to carry was dropped with the rest of
 * the cinematic layer — the live site's headings are flat Inter 600. The word
 * stagger is kept deliberately.
 *
 * Word spacing is a real space text node rather than a right margin on each
 * word — a trailing margin does not collapse at a line break, so it shifted
 * every wrapped line of a centred heading off-centre by that amount.
 */
export function DisplayHeading({ text, className }: DisplayHeadingProps) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const shouldReduceMotion = useReducedMotion();

  const pointerX = useMotionValue(0);
  const pointerY = useMotionValue(0);
  const springConfig = { stiffness: 120, damping: 20, mass: 0.6 };
  const rotateX = useSpring(useTransform(pointerY, [-0.5, 0.5], [5, -5]), springConfig);
  const rotateY = useSpring(useTransform(pointerX, [-0.5, 0.5], [-7, 7]), springConfig);

  useEffect(() => {
    if (shouldReduceMotion) return;
    // Track across the whole hero section, not just the heading's own box —
    // same approach AmbientGlow uses for its wash.
    const section = wrapperRef.current?.closest<HTMLElement>("section");
    if (!section) return;

    function handlePointerMove(event: PointerEvent) {
      const bounds = section!.getBoundingClientRect();
      pointerX.set((event.clientX - bounds.left) / bounds.width - 0.5);
      pointerY.set((event.clientY - bounds.top) / bounds.height - 0.5);
    }

    function handlePointerLeave() {
      pointerX.set(0);
      pointerY.set(0);
    }

    section.addEventListener("pointermove", handlePointerMove);
    section.addEventListener("pointerleave", handlePointerLeave);
    return () => {
      section.removeEventListener("pointermove", handlePointerMove);
      section.removeEventListener("pointerleave", handlePointerLeave);
    };
  }, [pointerX, pointerY, shouldReduceMotion]);

  const words = text.split(" ");

  return (
    <div ref={wrapperRef} className="[perspective:1400px]">
      <m.h1
        style={shouldReduceMotion ? undefined : { rotateX, rotateY, transformStyle: "preserve-3d" }}
        className={cn(
          "text-balance font-semibold [transform-origin:50%_120%]",
          className
        )}
      >
        {words.map((word, index) => (
          <Fragment key={`${word}-${index}`}>
            <m.span
              // `initial` is what gets rendered into the static HTML, so it must
              // never be opacity 0: Chrome excludes fully transparent elements
              // from Largest Contentful Paint candidacy, which meant every page
              // whose biggest above-fold element is this heading (rather than a
              // hero photo) could not register an LCP until the bundle had
              // downloaded, hydrated and run this animation — 9.1s on /contact.
              // Starting part-visible keeps the stagger while leaving the
              // heading LCP-eligible and legible from first paint.
              {...(shouldReduceMotion
                ? {}
                : {
                    initial: { opacity: 0.4, y: "0.35em", filter: "blur(6px)" },
                    animate: { opacity: 1, y: 0, filter: "blur(0px)" },
                    transition: { duration: 0.5, delay: index * 0.035, ease: [0.16, 1, 0.3, 1] },
                  })}
              className="inline-block"
            >
              {word}
            </m.span>{" "}
          </Fragment>
        ))}
      </m.h1>
    </div>
  );
}
