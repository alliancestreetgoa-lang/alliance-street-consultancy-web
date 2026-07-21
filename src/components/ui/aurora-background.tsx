"use client";

import { useEffect, useRef, useState } from "react";
import { m, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";

type AuroraBackgroundProps = {
  className?: string;
};

export function AuroraBackground({ className }: AuroraBackgroundProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [glow, setGlow] = useState({ x: 50, y: 50, active: false });
  const shouldReduceMotion = useReducedMotion();

  useEffect(() => {
    const maybeParent = ref.current?.parentElement;
    if (!maybeParent) return;
    const parent: HTMLElement = maybeParent;

    function handlePointerMove(event: PointerEvent) {
      const bounds = parent.getBoundingClientRect();
      setGlow({
        x: ((event.clientX - bounds.left) / bounds.width) * 100,
        y: ((event.clientY - bounds.top) / bounds.height) * 100,
        active: true,
      });
    }

    function handlePointerLeave() {
      setGlow((prev) => ({ ...prev, active: false }));
    }

    parent.addEventListener("pointermove", handlePointerMove);
    parent.addEventListener("pointerleave", handlePointerLeave);
    return () => {
      parent.removeEventListener("pointermove", handlePointerMove);
      parent.removeEventListener("pointerleave", handlePointerLeave);
    };
  }, []);

  return (
    <div ref={ref} aria-hidden className={cn("absolute inset-0 -z-10 overflow-hidden", className)}>
      <m.div
        className="absolute -left-1/4 -top-1/4 h-[60vw] w-[60vw] rounded-full bg-primary/25 blur-[120px]"
        animate={shouldReduceMotion ? undefined : { x: [0, 40, -20, 0], y: [0, -30, 20, 0] }}
        transition={{
          duration: shouldReduceMotion ? 0 : 22,
          repeat: shouldReduceMotion ? 0 : Infinity,
          ease: "easeInOut",
        }}
      />
      <m.div
        className="absolute -bottom-1/4 -right-1/4 h-[50vw] w-[50vw] rounded-full bg-primary/15 blur-[140px]"
        animate={shouldReduceMotion ? undefined : { x: [0, -30, 20, 0], y: [0, 20, -30, 0] }}
        transition={{
          duration: shouldReduceMotion ? 0 : 26,
          repeat: shouldReduceMotion ? 0 : Infinity,
          ease: "easeInOut",
        }}
      />
      <div
        className="absolute inset-0 transition-opacity duration-300"
        style={{
          opacity: glow.active ? 1 : 0,
          background: `radial-gradient(600px circle at ${glow.x}% ${glow.y}%, rgba(193,18,31,0.18), transparent 70%)`,
        }}
      />
    </div>
  );
}
