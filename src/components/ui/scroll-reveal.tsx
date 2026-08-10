"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { gsap, prefersReducedMotion } from "@/lib/gsap";
import { cn } from "@/lib/utils";

const EASE = "power3.out";

type RevealProps = {
  children: ReactNode;
  className?: string;
  delay?: number;
  scale?: boolean;
};

export function Reveal({ children, className, delay = 0, scale = false }: RevealProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current) return;
    // Reduced motion: leave the content in its natural, finished state.
    if (prefersReducedMotion()) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        ref.current,
        { opacity: 0, y: 24, scale: scale ? 0.98 : 1 },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.6,
          delay,
          ease: EASE,
          scrollTrigger: {
            trigger: ref.current,
            start: "top 88%",
            toggleActions: "play none none none",
            // Anything already on screen at mount should be visible immediately
            // rather than waiting for a scroll event that may never come.
            once: true,
          },
        }
      );
    }, ref);

    return () => ctx.revert();
  }, [delay, scale]);

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}

type StaggerProps = {
  children: ReactNode;
  className?: string;
};

/**
 * Reveals its direct children in sequence as the group enters view. Each child
 * rises, un-tilts and settles forward out of the page, so a grid of cards reads
 * as physical objects arriving rather than boxes fading in.
 */
export function Stagger({ children, className }: StaggerProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current) return;
    if (prefersReducedMotion()) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        ref.current!.children,
        { opacity: 0, y: 56, rotateX: -12, transformOrigin: "50% 100%" },
        {
          opacity: 1,
          y: 0,
          rotateX: 0,
          duration: 0.8,
          stagger: 0.09,
          ease: EASE,
          scrollTrigger: {
            trigger: ref.current,
            start: "top 85%",
            toggleActions: "play none none none",
            once: true,
          },
        }
      );
    }, ref);

    return () => ctx.revert();
  }, []);

  return (
    // Perspective on the group, so the children's rotateX reads as depth rather
    // than a vertical squash.
    <div ref={ref} className={cn("[perspective:1200px]", className)}>
      {children}
    </div>
  );
}

export function StaggerItem({ children, className }: StaggerProps) {
  return <div className={className}>{children}</div>;
}

type ParallaxProps = {
  children: ReactNode;
  className?: string;
  /** Total travel in px across the element's time on screen. Negative moves up. */
  distance?: number;
};

/**
 * Scrubs a block up or down as it crosses the viewport. Use on secondary
 * content beside a fixed anchor — a caption next to an image, a column beside a
 * sticky panel — to open up a little depth between them.
 */
export function ParallaxBlock({ children, className, distance = -80 }: ParallaxProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current) return;
    if (prefersReducedMotion()) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        ref.current,
        { y: -distance / 2 },
        {
          y: distance / 2,
          ease: "none",
          scrollTrigger: {
            trigger: ref.current,
            start: "top bottom",
            end: "bottom top",
            scrub: true,
            invalidateOnRefresh: true,
          },
        }
      );
    }, ref);

    return () => ctx.revert();
  }, [distance]);

  return (
    <div ref={ref} className={cn("will-change-transform", className)}>
      {children}
    </div>
  );
}
