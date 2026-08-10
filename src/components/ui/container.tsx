import type { ComponentPropsWithRef } from "react";
import { cn } from "@/lib/utils";

// ComponentPropsWithRef rather than HTMLAttributes so callers can attach a ref
// (React 19 passes `ref` straight through as a prop on function components).
export function Container({ className, ...props }: ComponentPropsWithRef<"div">) {
  return (
    <div className={cn("mx-auto w-full max-w-7xl px-6 lg:px-8", className)} {...props} />
  );
}
