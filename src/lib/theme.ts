import themeJson from "@/content/theme.json";

/**
 * Brand presets the CMS can choose between.
 *
 * Deliberately a short list of vetted values rather than a colour picker: every
 * accent below keeps white text on the accent at roughly 4.5:1 or better (checked in
 * tests/theme.test.ts) and suits the red-to-black walls the design is built on.
 */
export const ACCENTS = {
  "alliance-red": { label: "Alliance red (default)", brand: "#e22e34", deep: "#a8171d", dark: "#8d1319", popover: "#c0151b", neon: "#ff2846", neonStrong: "#ff163c", glow: "255 24 48" },
  crimson: { label: "Deep crimson", brand: "#c8102e", deep: "#8a0b20", dark: "#6e0919", popover: "#a50d26", neon: "#e8203f", neonStrong: "#d4122f", glow: "200 16 46" },
  burgundy: { label: "Burgundy", brand: "#9e1b32", deep: "#6b1222", dark: "#560e1b", popover: "#84162a", neon: "#c42747", neonStrong: "#b01d3a", glow: "158 27 50" },
} as const;

export type Theme = {
  accent: keyof typeof ACCENTS;
  font: "inter" | "system";
  textSize: "standard" | "large";
  sectionSpacing: "compact" | "standard" | "spacious";
  motion: "full" | "off";
  openingAnimation: boolean;
};

export const THEME = themeJson as Theme;

export function accentCss(theme: Theme = THEME) {
  const a = ACCENTS[theme.accent] ?? ACCENTS["alliance-red"];
  return `:root{--brand:${a.brand};--brand-deep:${a.deep};--brand-dark:${a.dark};--brand-popover:${a.popover};--brand-neon:${a.neon};--brand-neon-strong:${a.neonStrong};--brand-glow:${a.glow}}`;
}
