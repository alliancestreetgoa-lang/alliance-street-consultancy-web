// src/components/providers/smooth-scroll-provider.tsx
"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { ScrollTrigger } from "@/lib/gsap";

/**
 * Keeps ScrollTrigger's measurements honest.
 *
 * ScrollTrigger caches each trigger's start/end scroll positions when the
 * trigger is created. On an App Router client-side navigation the new page's
 * components mount and measure before their images and web fonts have settled,
 * so those cached positions describe a layout that no longer exists — triggers
 * then fire late, early, or never. Refreshing after navigation and after the
 * load event fixes that centrally, rather than every scroll component having to
 * remember to do it.
 */
export function SmoothScrollProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  useEffect(() => {
    // Two frames: let the new route paint before measuring it.
    const raf = requestAnimationFrame(() => {
      requestAnimationFrame(() => ScrollTrigger.refresh());
    });
    return () => cancelAnimationFrame(raf);
  }, [pathname]);

  useEffect(() => {
    const refresh = () => ScrollTrigger.refresh();
    window.addEventListener("load", refresh);
    // Late-loading web fonts reflow text and shift every section below it.
    document.fonts?.ready.then(refresh).catch(() => {});
    return () => window.removeEventListener("load", refresh);
  }, []);

  return <>{children}</>;
}
