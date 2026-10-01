"use client";

import { useEffect, useRef, type ReactNode, type RefObject } from "react";
import { gsap } from "@/lib/gsap";
import { MOTION, MOTION_QUERY, settle } from "@/lib/motion";
import { cn } from "@/lib/utils";

type RevealProps = { children: ReactNode; className?: string; delay?: number; scale?: boolean };
type StaggerProps = Pick<RevealProps, "children" | "className">;

/** Each item enters when it is visible, not when a long parent list begins. */
function useReveal(ref: RefObject<HTMLDivElement | null>, list = false, delay = 0, scale = false) {
  useEffect(() => {
    const root = ref.current;
    if (!root) return;
    const mm = gsap.matchMedia();
    mm.add(MOTION_QUERY, () => {
      const elements = list ? Array.from(root.children) as HTMLElement[] : [root];
      if (!elements.length) return;
      const tweens: gsap.core.Tween[] = [];
      const observer = new IntersectionObserver((entries) => {
        const entering = entries.filter((entry) => entry.isIntersecting);
        entering.forEach((entry, index) => {
          observer.unobserve(entry.target);
          tweens.push(gsap.fromTo(entry.target,
            { opacity: 0, y: 18, ...(scale ? { scale: 0.985 } : {}) },
            { opacity: 1, y: 0, scale: 1, duration: MOTION.reveal,
              delay: Math.min(delay, 0.15) + Math.min(index * MOTION.stagger, 0.16),
              ease: settle, clearProps: "opacity,transform,willChange",
              onStart() { gsap.set(entry.target, { willChange: "opacity,transform" }); },
            }));
        });
      }, { rootMargin: "0px 0px -5% 0px", threshold: 0 });
      elements.forEach((element) => observer.observe(element));
      return () => {
        observer.disconnect();
        tweens.forEach((tween) => tween.kill());
        gsap.set(elements, { clearProps: "opacity,transform,willChange" });
      };
    });
    return () => mm.revert();
  }, [ref, list, delay, scale]);
}

export function Reveal({ children, className, delay = 0, scale = false }: RevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  useReveal(ref, false, delay, scale);
  return <div ref={ref} className={className}>{children}</div>;
}
export function Stagger({ children, className }: StaggerProps) {
  const ref = useRef<HTMLDivElement>(null);
  useReveal(ref, true);
  return <div ref={ref} className={className}>{children}</div>;
}
export function StaggerItem({ children, className }: StaggerProps) {
  return <div className={className}>{children}</div>;
}

/** A single image arrival with quiet copy timing. Text remains steady on scroll. */
export function HeroEntrance({ children, className }: StaggerProps) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const root = ref.current;
    if (!root) return;
    const mm = gsap.matchMedia();
    mm.add(MOTION_QUERY, () => {
      const items = root.querySelectorAll("[data-hero-item]");
      if (items.length) gsap.fromTo(items, { opacity: 0, y: 12 }, {
        opacity: 1, y: 0, duration: MOTION.hero, stagger: 0.07,
        ease: settle, clearProps: "opacity,transform",
      });
      const image = root.closest("section")?.querySelector("img");
      if (image) gsap.fromTo(image, { scale: 1.045 }, {
        scale: 1, duration: 1.2, ease: settle, clearProps: "transform",
      });
    }, root);
    return () => mm.revert();
  }, []);
  return <div ref={ref} className={className}>{children}</div>;
}

export function ScrubRail({ children, className }: StaggerProps) {
  const ref = useRef<HTMLDivElement>(null);
  const railRef = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    if (!ref.current || !railRef.current) return;
    const mm = gsap.matchMedia();
    mm.add(MOTION_QUERY, () => {
      gsap.fromTo(railRef.current, { scaleY: 0 }, {
        scaleY: 1, ease: "none", transformOrigin: "50% 0%",
        scrollTrigger: { trigger: ref.current, start: "top 82%", end: "bottom 65%", scrub: 0.35 },
      });
    });
    return () => mm.revert();
  }, []);
  return <div ref={ref} className={cn("relative", className)}>
    <span aria-hidden className="absolute inset-y-0 left-0 w-px bg-primary/15">
      <span ref={railRef} className="absolute inset-0 block origin-top bg-primary/70" />
    </span>
    <div className="pl-6">{children}</div>
  </div>;
}

export function ParallaxBlock({ children, className, distance = -32 }: StaggerProps & { distance?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const mm = gsap.matchMedia();
    mm.add(`${MOTION_QUERY} and (min-width: 1024px) and (pointer: fine)`, () => {
      gsap.fromTo(ref.current, { y: -distance / 2 }, {
        y: distance / 2, ease: "none",
        scrollTrigger: { trigger: ref.current, start: "top bottom", end: "bottom top", scrub: 0.4 },
      });
    });
    return () => mm.revert();
  }, [distance]);
  return <div ref={ref} className={className}>{children}</div>;
}
