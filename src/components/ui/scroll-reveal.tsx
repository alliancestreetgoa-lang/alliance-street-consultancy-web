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

/**
 * Page-hero motion: an entrance sequence on mount, then a slow upward drift as
 * the hero scrolls away, so the section beneath it appears to slide over rather
 * than simply follow.
 *
 * Only elements marked `data-hero-item` are faded in. The `<h1>` is deliberately
 * NOT one of them — DisplayHeading runs its own word stagger, and wrapping the
 * heading in an opacity animation would hand Chrome a transparent LCP candidate,
 * which is exactly the defect that made /contact measure 9.1s. Transform-only
 * drift is applied to the whole block, which is safe.
 */
export function HeroEntrance({ children, className }: StaggerProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current) return;
    if (prefersReducedMotion()) return;

    const ctx = gsap.context(() => {
      const items = ref.current!.querySelectorAll<HTMLElement>("[data-hero-item]");
      if (items.length) {
        gsap.fromTo(
          items,
          { opacity: 0, y: 16 },
          { opacity: 1, y: 0, duration: 0.65, stagger: 0.09, ease: EASE }
        );
      }

      // Drift the whole block as the hero leaves. yPercent and opacity on the
      // wrapper only — the heading keeps its own opacity throughout.
      const section = ref.current!.closest<HTMLElement>("section");
      if (!section) return;
      gsap.to(ref.current, {
        yPercent: -14,
        ease: "none",
        scrollTrigger: {
          trigger: section,
          start: "top top",
          end: "bottom top",
          scrub: 0.6,
          invalidateOnRefresh: true,
        },
      });
    }, ref);

    return () => ctx.revert();
  }, []);

  return (
    <div ref={ref} className={cn("will-change-transform", className)}>
      {children}
    </div>
  );
}

/**
 * Draws a vertical rail alongside a list as it scrolls past, so a checklist
 * reads as being worked through rather than simply appearing. Scrubbed, so it
 * tracks the scrollbar directly.
 *
 * Renders the rail as a sibling of the content, absolutely positioned, so it
 * cannot affect the layout or contribute to CLS.
 */
export function ScrubRail({ children, className }: StaggerProps) {
  const ref = useRef<HTMLDivElement>(null);
  const railRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!ref.current || !railRef.current) return;
    if (prefersReducedMotion()) {
      // Show the rail complete rather than leaving it at zero height.
      gsap.set(railRef.current, { scaleY: 1 });
      return;
    }

    const ctx = gsap.context(() => {
      gsap.fromTo(
        railRef.current,
        { scaleY: 0 },
        {
          scaleY: 1,
          ease: "none",
          transformOrigin: "50% 0%",
          scrollTrigger: {
            trigger: ref.current,
            start: "top 78%",
            end: "bottom 70%",
            scrub: 0.5,
            invalidateOnRefresh: true,
          },
        }
      );
    }, ref);

    return () => ctx.revert();
  }, []);

  return (
    <div ref={ref} className={cn("relative", className)}>
      <span aria-hidden className="absolute inset-y-0 left-0 w-px bg-primary/15">
        <span
          ref={railRef}
          className="absolute inset-0 block origin-top bg-primary/70 will-change-transform"
        />
      </span>
      <div className="pl-6">{children}</div>
    </div>
  );
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
