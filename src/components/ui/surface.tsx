import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export type SurfaceTone = "light" | "muted" | "dark" | "brand";

const TONE_CLASS: Record<SurfaceTone, string> = {
  light: "",
  muted: "surface-muted",
  dark: "surface-dark",
  brand: "surface-brand",
};

type SurfaceProps = {
  tone: SurfaceTone;
  children: ReactNode;
  className?: string;
};

/**
 * Wraps a section in one of the page's three surfaces. The tone classes remap
 * the theme tokens (see globals.css), so the wrapped section keeps using
 * `text-foreground`, `bg-secondary`, `text-primary` and so on, and those resolve
 * to whatever is legible on that surface.
 */
export function Surface({ tone, children, className }: SurfaceProps) {
  return (
    <div className={cn(TONE_CLASS[tone], "bg-background text-foreground", className)}>
      {children}
    </div>
  );
}
