"use client";

import { useRef, useState } from "react";
import type { PointerEvent } from "react";
import { m } from "framer-motion";
import { cn } from "@/lib/utils";

type AuroraBackgroundProps = {
  className?: string;
};

export function AuroraBackground({ className }: AuroraBackgroundProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [glow, setGlow] = useState({ x: 50, y: 50, active: false });

  function handlePointerMove(event: PointerEvent<HTMLDivElement>) {
    const bounds = ref.current?.getBoundingClientRect();
    if (!bounds) return;
    setGlow({
      x: ((event.clientX - bounds.left) / bounds.width) * 100,
      y: ((event.clientY - bounds.top) / bounds.height) * 100,
      active: true,
    });
  }

  function handlePointerLeave() {
    setGlow((prev) => ({ ...prev, active: false }));
  }

  return (
    <div
      ref={ref}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      aria-hidden
      className={cn("absolute inset-0 -z-10 overflow-hidden", className)}
    >
      <m.div
        className="absolute -left-1/4 -top-1/4 h-[60vw] w-[60vw] rounded-full bg-primary/25 blur-[120px]"
        animate={{ x: [0, 40, -20, 0], y: [0, -30, 20, 0] }}
        transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
      />
      <m.div
        className="absolute -bottom-1/4 -right-1/4 h-[50vw] w-[50vw] rounded-full bg-primary/15 blur-[140px]"
        animate={{ x: [0, -30, 20, 0], y: [0, 20, -30, 0] }}
        transition={{ duration: 26, repeat: Infinity, ease: "easeInOut" }}
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
