import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

// Single registration point. Registering in each component works but means every
// new scroll component has to remember to do it; importing from here cannot be
// forgotten, because you need the export to use gsap at all.
if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

/**
 * True when the visitor has asked the OS to reduce motion. Scroll animations
 * should render their finished state instead of animating — never leave content
 * stuck at its `from` values (opacity 0), which is how reduced-motion users end
 * up staring at a blank section.
 */
export function prefersReducedMotion() {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export { gsap, ScrollTrigger };
