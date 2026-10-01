"use client";

import { Fragment, useEffect, useRef } from "react";
import { gsap } from "@/lib/gsap";
import { MOTION, MOTION_QUERY, settle } from "@/lib/motion";
import { cn } from "@/lib/utils";

type DisplayHeadingProps = { text: string; className?: string };

/** Stable reading plane; a short word arrival, with no pointer-driven text tilt. */
export function DisplayHeading({ text, className }: DisplayHeadingProps) {
  const ref = useRef<HTMLHeadingElement>(null);
  useEffect(() => {
    const mm = gsap.matchMedia();
    mm.add(MOTION_QUERY, () => {
      const words = ref.current?.querySelectorAll(".js-display-word");
      if (!words?.length) return;
      gsap.fromTo(words, { y: 14 }, {
        y: 0, duration: MOTION.heading, stagger: { amount: 0.14 }, ease: settle,
        clearProps: "transform",
      });
    }, ref);
    return () => mm.revert();
  }, [text]);
  return <h1 ref={ref} className={cn("text-balance font-semibold tracking-tight", className)}>
    {text.split(" ").map((word, index) => <Fragment key={`${word}-${index}`}>
      <span className="inline-block overflow-hidden pb-[0.08em] align-bottom"><span className="js-display-word inline-block">{word}</span></span>{" "}
    </Fragment>)}
  </h1>;
}
