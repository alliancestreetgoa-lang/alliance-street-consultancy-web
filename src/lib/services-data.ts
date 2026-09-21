/**
 * Compatibility shim.
 *
 * The service catalogue and its sourced tax answers moved to CMS-managed JSON
 * (src/content/) so the client can edit them after handover. This file stays so
 * the ~40 existing import sites keep working; new code should import from
 * "@/lib/content" directly.
 *
 * Editorial rules that used to live in a comment here are now enforced by
 * src/lib/content/schema.ts — a figure without a primary source and a
 * verification date fails the build rather than relying on discipline.
 */
export type { DirectAnswer, Service } from "@/lib/content";
export { SERVICES, DIRECT_ANSWERS, GROUP_IMAGES, getService } from "@/lib/content";
