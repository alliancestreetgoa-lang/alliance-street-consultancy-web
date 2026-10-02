"use client";

import { useLayoutEffect, useRef } from "react";
import Image from "next/image";
import { asset } from "@/lib/asset-path";
import { gsap } from "@/lib/gsap";
import { MOTION_QUERY } from "@/lib/motion";
import { HEADER } from "@/lib/site-config";

/** The opening brand settles into the real navigation logo on each full load. */
export function SiteIntro() {
  const rootRef = useRef<HTMLDivElement>(null);
  const brandRef = useRef<HTMLDivElement>(null);
  const backdropRef = useRef<HTMLDivElement>(null);
  const ruleRef = useRef<HTMLSpanElement>(null);

  useLayoutEffect(() => {
    const root = rootRef.current;
    const brand = brandRef.current;
    const backdrop = backdropRef.current;
    const rule = ruleRef.current;
    const destination = document.querySelector<HTMLElement>("[data-nav-brand]");
    if (!root || !brand || !backdrop || !rule || !destination) return;
    const mm = gsap.matchMedia();
    mm.add(MOTION_QUERY, () => {
      root.dataset.active = "true";
      const previousOpacity = destination.style.opacity;
      destination.style.opacity = "0";
      const finish = () => {
        destination.style.opacity = previousOpacity;
        root.style.visibility = "hidden";
        brand.style.removeProperty("will-change");
        backdrop.style.removeProperty("will-change");
      };
      const tl = gsap.timeline({ onComplete: finish });
      gsap.set(brand, { xPercent: -50, yPercent: -50, scale: 1.6, opacity: 0, force3D: true, willChange: "transform,opacity" });
      gsap.set(backdrop, { willChange: "opacity" });
      gsap.set(rule, { scaleX: 0, opacity: 1 });
      tl.to(brand, { opacity: 1, duration: 1, ease: "sine.inOut" })
        .to(rule, { scaleX: 1, duration: 1.6, ease: "sine.inOut" }, 0.35)
        .to(rule, { opacity: 0, duration: 0.5, ease: "sine.inOut" }, 2.2)
        .to(backdrop, { opacity: 0.7, duration: 0.5, ease: "sine.inOut" }, 2.2)
        .to(brand, {
          x: () => destination.getBoundingClientRect().left - root.clientWidth / 2,
          y: () => destination.getBoundingClientRect().top - root.clientHeight / 2,
          xPercent: 0, yPercent: 0, scale: 1,
          duration: 1.4, ease: "sine.inOut",
        }, 2.65)
        .to(backdrop, { opacity: 0, duration: 1.2, ease: "sine.inOut" }, 2.65);
      // A viewport change ends the flight at the responsive navbar's new position.
      const onResize = () => { tl.progress(1); };
      window.addEventListener("resize", onResize, { passive: true });
      return () => {
        window.removeEventListener("resize", onResize);
        destination.style.opacity = previousOpacity;
        delete root.dataset.active;
        root.style.removeProperty("visibility");
      };
    }, root);
    return () => mm.revert();
  }, []);

  return (
    <div ref={rootRef} aria-hidden className="as-intro">
      <div ref={backdropRef} className="as-intro-backdrop" />
      <div ref={brandRef} className="as-intro-brand flex items-center gap-2.5">
        <Image
          src={asset(HEADER.logo)}
          alt="" width={34} height={28} priority
          style={{ width: "34px", height: "28px" }}
        />
        <span className="whitespace-nowrap text-lg font-semibold text-white">{HEADER.brandName}</span>
      </div>
      <span ref={ruleRef} className="as-intro-rule" />
    </div>
  );
}
