"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import { asset } from "@/lib/asset-path";
import { gsap, prefersReducedMotion } from "@/lib/gsap";

type ParallaxImageProps = {
  src: string;
  alt: string;
  sizes?: string;
};

/**
 * Fills its (overflow-hidden) parent with an image that drifts against the
 * scroll direction. The wrapper is over-scaled so the drift never exposes an
 * edge inside the frame.
 */
export function ParallaxImage({ src, alt, sizes }: ParallaxImageProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || prefersReducedMotion()) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        el,
        { yPercent: -8 },
        {
          yPercent: 8,
          ease: "none",
          scrollTrigger: {
            // The frame, not the over-scaled inner wrapper, defines the range.
            trigger: el.parentElement,
            start: "top bottom",
            end: "bottom top",
            scrub: true,
            invalidateOnRefresh: true,
          },
        }
      );
    }, ref);

    return () => ctx.revert();
  }, []);

  return (
    <div ref={ref} className="absolute inset-0 scale-[1.2] will-change-transform">
      <Image src={asset(src)} alt={alt} fill sizes={sizes} className="object-cover" />
    </div>
  );
}
