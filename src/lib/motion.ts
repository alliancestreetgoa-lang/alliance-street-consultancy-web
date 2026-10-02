import { THEME } from "@/lib/theme";

/** Shared UI timing: a gentle arrival with a clean, non-bouncing finish. */
export const MOTION = { reveal: 0.65, heading: 0.72, hero: 0.85, stagger: 0.055 };

/**
 * Every scripted animation is registered through gsap.matchMedia(MOTION_QUERY).
 * The visitor's reduced-motion preference always wins; the CMS motion setting
 * can additionally switch motion off for everyone ("not all" never matches).
 */
export const MOTION_QUERY = THEME.motion === "off" ? "not all" : "(prefers-reduced-motion: no-preference)";

// Quintic ease-out is inexpensive, deterministic and identical across engines.
export function settle(progress: number): number {
  return 1 - Math.pow(1 - Math.max(0, Math.min(1, progress)), 4);
}
