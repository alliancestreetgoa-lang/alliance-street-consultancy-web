"use client";

import { Fragment, useEffect, useRef } from "react";
import { m, useMotionValue, useReducedMotion, useSpring, useTransform } from "framer-motion";
import { gsap } from "@/lib/gsap";
import { settle } from "@/lib/motion";
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
/**
 * When the site intro is playing (first load in the tab), the curtain doesn't
 * lift until ~1.4s in — see the as-intro timings in globals.css. The word
 * stagger must wait for that moment or it plays unseen behind the curtain.
 * Measured against the page's own clock so hydration time doesn't shift it.
 */
const INTRO_REVEAL_AT = 1.45;

function introDelay() {
  if (typeof document === "undefined") return 0;
  if (document.documentElement.dataset.intro === "skip") return 0;
  return Math.max(0, INTRO_REVEAL_AT - performance.now() / 1000);
}

export function DisplayHeading({ text, className }: DisplayHeadingProps) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const shouldReduceMotion = useReducedMotion();
  // Server and first client paint are identical, including reduced-motion mode.
  // Start the entrance after hydration and leave the default markup readable.
  useEffect(() => {
    if (shouldReduceMotion) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(".js-display-word", { opacity: 0.6, y: 12 }, {
        opacity: 1, y: 0, duration: 0.55, stagger: { amount: 0.18 },
        delay: introDelay(), ease: settle, clearProps: "opacity,transform",
      });
    }, wrapperRef);
    return () => ctx.revert();
  }, [shouldReduceMotion]);

  const pointerX = useMotionValue(0);
  const pointerY = useMotionValue(0);
  const springConfig = { stiffness: 210, damping: 28, mass: 0.6 };
  const rotateX = useSpring(useTransform(pointerY, [-0.5, 0.5], [2, -2]), springConfig);
  const rotateY = useSpring(useTransform(pointerX, [-0.5, 0.5], [-3, 3]), springConfig);

  useEffect(() => {
    if (shouldReduceMotion || !window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
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
      handlePointerLeave();
    };
  }, [pointerX, pointerY, shouldReduceMotion]);

  const words = text.split(" ");

  return (
    <div ref={wrapperRef} className="[perspective:1400px]">
      <m.h1
        style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
        className={cn(
          "text-balance font-semibold [transform-origin:50%_120%]",
          className
        )}
      >
        {words.map((word, index) => (
          <Fragment key={`${word}-${index}`}>
            <span className="js-display-word inline-block">
              {word}
            </span>{" "}
          </Fragment>
        ))}
      </m.h1>
    </div>
  );
}
