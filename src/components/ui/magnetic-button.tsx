"use client";

import { useRef, useState } from "react";
import type { PointerEvent, ReactNode } from "react";
import { m } from "framer-motion";
import Link from "next/link";
import { cn } from "@/lib/utils";

type MagneticButtonProps = {
  href?: string;
  onClick?: () => void;
  children: ReactNode;
  variant?: "primary" | "secondary" | "ghost" | "glass";
  className?: string;
};

const VARIANT_CLASSES: Record<NonNullable<MagneticButtonProps["variant"]>, string> = {
  // --primary-deep is the shaded end of the button gradient. It is a token, not
  // a literal, so the button still reads correctly on the dark and red section
  // surfaces, where `primary` itself is remapped (see globals.css).
  primary:
    "bg-gradient-to-b from-primary to-[var(--primary-deep)] text-primary-foreground shadow-button hover:shadow-button-hover hover:brightness-105",
  secondary:
    "border border-glass-border bg-secondary text-foreground shadow-card hover:border-primary/25 hover:shadow-card-hover",
  ghost: "text-foreground hover:text-primary",
  glass: "glass-pill text-foreground font-bold",
};

export function MagneticButton({
  href,
  onClick,
  children,
  variant = "primary",
  className,
}: MagneticButtonProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const [offset, setOffset] = useState({ x: 0, y: 0 });

  function handlePointerMove(event: PointerEvent<HTMLSpanElement>) {
    const bounds = ref.current?.getBoundingClientRect();
    if (!bounds) return;
    const x = event.clientX - bounds.left - bounds.width / 2;
    const y = event.clientY - bounds.top - bounds.height / 2;
    setOffset({ x: x * 0.3, y: y * 0.3 });
  }

  function handlePointerLeave() {
    setOffset({ x: 0, y: 0 });
  }

  const content = (
    <m.span
      ref={ref}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      animate={{ x: offset.x, y: offset.y }}
      whileTap={{ scale: 0.94 }}
      transition={{ type: "spring", stiffness: 300, damping: 20, mass: 0.5 }}
      className={cn(
        "group relative inline-flex cursor-pointer items-center justify-center gap-2 overflow-hidden rounded-full px-7 py-3 text-sm font-medium tracking-tight transition-[colors,box-shadow,border-color] duration-300",
        VARIANT_CLASSES[variant],
        className
      )}
    >
      <span className="relative z-10 inline-flex items-center gap-2">{children}</span>
      {variant !== "ghost" ? (
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/25 to-transparent transition-transform duration-700 ease-out group-hover:translate-x-full"
        />
      ) : null}
    </m.span>
  );

  if (href) {
    return (
      <Link href={href} onClick={onClick} className="inline-block">
        {content}
      </Link>
    );
  }

  return (
    <button type="button" onClick={onClick} className="inline-block">
      {content}
    </button>
  );
}
