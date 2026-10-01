import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export const cardClassName = "as-neon-card rounded-2xl border border-glass-border bg-secondary p-8 shadow-card transition-[transform,border-color,box-shadow] duration-250 motion-reduce:transition-none";
export const cardHoverClassName = "motion-safe:hover:-translate-y-0.5 hover:border-primary/25 hover:shadow-card-hover";
export const cardGlassClassName = "as-neon-card rounded-2xl border border-border bg-card p-8 shadow-card";

type CardProps = HTMLAttributes<HTMLDivElement> & {
  hover?: boolean;
  variant?: "default" | "glass";
};

export function Card({ className, hover = true, variant = "default", ...props }: CardProps) {
  if (variant === "glass") {
    return <div className={cn(cardGlassClassName, className)} {...props} />;
  }
  return <div className={cn(cardClassName, hover && cardHoverClassName, className)} {...props} />;
}
