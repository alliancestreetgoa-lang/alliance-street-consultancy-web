"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { ScrollTrigger } from "@/lib/gsap";

/** Native scrolling with one scheduled measurement after layout changes. */
export function SmoothScrollProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  useEffect(() => {
    let active = true;
    let frame = 0;
    let timeout = 0;
    const refresh = () => {
      window.clearTimeout(timeout);
      timeout = window.setTimeout(() => {
        cancelAnimationFrame(frame);
        frame = requestAnimationFrame(() => { if (active) ScrollTrigger.refresh(); });
      }, 80);
    };
    const onLoad = (event: Event) => { if (event.target instanceof HTMLImageElement) refresh(); };
    refresh();
    document.fonts?.ready.then(() => { if (active) refresh(); }).catch(() => {});
    document.addEventListener("load", onLoad, true);
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    preference.addEventListener("change", refresh);
    return () => {
      active = false;
      window.clearTimeout(timeout);
      cancelAnimationFrame(frame);
      document.removeEventListener("load", onLoad, true);
      preference.removeEventListener("change", refresh);
    };
  }, [pathname]);
  return <>{children}</>;
}
