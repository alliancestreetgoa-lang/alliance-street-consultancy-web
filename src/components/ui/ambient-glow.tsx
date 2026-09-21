import { cn } from "@/lib/utils";

type AmbientGlowProps = {
  className?: string;
};

/**
 * The soft red radial wash the live site bleeds behind card clusters and
 * hero copy. Replaces the old two-colour aurora: on alliancestreet.ae the
 * glow is always a single red source, never a primary/secondary blend.
 */
export function AmbientGlow({ className }: AmbientGlowProps) {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
      <div
        className={cn(
          "as-glow animate-ambient-breathe absolute left-1/2 top-1/2 h-[60vh] w-[80vw] -translate-x-1/2 -translate-y-1/2 rounded-[50%] blur-[90px]",
          className
        )}
      />
    </div>
  );
}
