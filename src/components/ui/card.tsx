import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export const cardClassName = "rounded-2xl border border-glass-border bg-secondary p-8 shadow-card transition-all duration-300";
export const cardHoverClassName = "hover:-translate-y-1 hover:border-primary/25 hover:shadow-card-hover";

type CardProps = HTMLAttributes<HTMLDivElement> & {
  hover?: boolean;
};

export function Card({ className, hover = true, ...props }: CardProps) {
  return <div className={cn(cardClassName, hover && cardHoverClassName, className)} {...props} />;
}
