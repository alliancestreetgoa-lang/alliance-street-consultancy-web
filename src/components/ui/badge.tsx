import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export function Badge({ className, ...props }: HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 rounded-full border border-glass-border bg-secondary/80 px-4 py-1.5 text-xs font-medium uppercase tracking-widest text-muted-foreground shadow-sm backdrop-blur-sm",
        className
      )}
      {...props}
    />
  );
}
