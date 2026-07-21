"use client";

import { useRef, useState } from "react";
import type { PointerEvent, ReactNode } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { cn } from "@/lib/utils";

type MagneticButtonProps = {
  href?: string;
  onClick?: () => void;
  children: ReactNode;
  variant?: "primary" | "secondary" | "ghost";
  className?: string;
};

const VARIANT_CLASSES: Record<NonNullable<MagneticButtonProps["variant"]>, string> = {
  primary: "bg-primary text-primary-foreground shadow-glow hover:brightness-110",
  secondary: "border border-glass-border bg-white/5 text-foreground hover:bg-white/10",
  ghost: "text-foreground hover:text-primary",
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
    <motion.span
      ref={ref}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      animate={{ x: offset.x, y: offset.y }}
      whileTap={{ scale: 0.94 }}
      transition={{ type: "spring", stiffness: 300, damping: 20, mass: 0.5 }}
      className={cn(
        "inline-flex cursor-pointer items-center justify-center gap-2 rounded-full px-7 py-3 text-sm font-medium tracking-tight transition-colors",
        VARIANT_CLASSES[variant],
        className
      )}
    >
      {children}
    </motion.span>
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
