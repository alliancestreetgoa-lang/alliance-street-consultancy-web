import type { IMAGE_POSITIONS } from "@/lib/content/page-schema";

/** Literal class names so Tailwind's scanner keeps them. */
export const OBJECT_POSITION: Record<(typeof IMAGE_POSITIONS)[number], string> = {
  center: "object-center",
  top: "object-top",
  bottom: "object-bottom",
  left: "object-left",
  right: "object-right",
};
