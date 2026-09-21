/**
 * Compatibility shim.
 *
 * Navigation and company details moved to CMS-managed JSON (src/content/site.json)
 * so the client can edit them after handover. This file stays so existing import
 * sites keep working; new code should import from "@/lib/content" directly.
 */
import type { SiteContent } from "@/lib/content";

export { COMPANY, NAV_GROUPS, PRIMARY_NAV } from "@/lib/content";

export type NavLink = SiteContent["primaryNav"][number];
export type NavGroup = SiteContent["navGroups"][number];

/**
 * Named, credentialed authorship — still deliberately empty.
 *
 * For YMYL content, a named expert with a verifiable credential is a primary
 * Expertise signal. Every field below is a checkable claim about a real person
 * or a regulated entity, and inventing one on an accounting firm's website is
 * straightforwardly harmful: a fabricated ACCA number is checkable against a
 * public register.
 *
 * Deliberately NOT moved into the CMS. These are the fields most tempting to
 * fill with something plausible, and the consequence of getting them wrong is
 * regulatory rather than cosmetic. Populate them in code, with the certificate
 * in hand.
 */
export type Advisor = {
  name: string;
  role: string;
  /** e.g. "ACCA", "ICAEW", "CPA". Omit rather than approximate. */
  credential?: string;
  /** Membership number, verifiable against the body's public register. */
  credentialNumber?: string;
  /** LinkedIn or similar. Becomes schema.org `sameAs`. */
  profileUrl?: string;
  bio?: string;
};

export const ADVISORS: Advisor[] = [];
export const REGISTRATIONS: { label: string; value: string }[] = [];
