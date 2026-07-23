import { cn } from "@/lib/utils";

type AmbientGlowProps = {
  className?: string;
};

export function AmbientGlow({ className }: AmbientGlowProps) {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
      <div
        className={cn(
          "bg-ambient-aurora animate-ambient-breathe absolute left-1/2 top-1/2 h-[60vh] w-[80vw] -translate-x-1/2 -translate-y-1/2 rounded-[50%] blur-[80px]",
          className
        )}
      />
    </div>
  );
}
