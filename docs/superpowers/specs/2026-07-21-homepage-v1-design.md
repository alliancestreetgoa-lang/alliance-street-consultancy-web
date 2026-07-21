# Homepage v1 Design

## Context

Following Phase 1 (design system foundation, already built and reviewed), this spec covers the
first real page: the Home page. Rather than building an abstract "component library" phase ahead of
any real content (the original brief's Phase 2), we're building the Home page directly — each
component gets created as this page actually needs it, using Phase 1's primitives
(`Container`, `SectionHeading`, `Badge`, `MagneticButton`) throughout.

## Scope

The brief's homepage spec lists ~20 sections. This spec builds only the sections that don't require
real client data we don't have:

**In scope:** Hero, Why Alliance Street, Service Preview, Process, FAQ, Book Consultation CTA,
Newsletter signup.

**Explicitly deferred** (require real data or later-phase infrastructure): Video section, Company
Statistics (no real figures — see decision below), Trusted By / Client Logos (no real clients yet),
Case Studies, Testimonials, Pricing Preview (no real pricing yet), Knowledge Centre / Resources
preview (no real articles yet).

## Decisions made during brainstorming

- **No fabricated statistics.** The "Company Statistics" section is dropped entirely rather than
  inventing numbers (years in business, clients served, etc.) — will be added once real figures
  exist.
- **Hero background: Aurora gradient mesh + mouse glow.** Soft radial red-glow blobs (CSS/Framer
  Motion, slow drift) plus a cursor-following spotlight. Chosen over a canvas particle field
  (more complex, higher perf cost for a marketing page) and a static-gradient-only fallback
  (safer but doesn't hit the brief's "Aurora Gradient" / "Mouse Glow" requirements).
- **Aurora background is a reusable primitive**, not a one-off inside the hero component — every
  future page in the brief's site structure gets a hero section, so this isn't speculative
  building; it's explicitly required by the already-approved multi-page spec.
- **Service Preview links to not-yet-built service pages** (`/services/uae/...` etc.) — expected
  404s until those pages are built in a later phase, not a defect of this work.
- **Process and FAQ content describes how the firm works generally** (engagement steps, common
  setup questions) — not factual claims requiring verification, unlike statistics.
- **Newsletter is UI-only this phase.** Resend integration is explicitly Phase 4 scope. The form
  uses React Hook Form + Zod for client-side validation and shows a local "subscribed" success
  state on valid submit, but nothing is sent or stored anywhere yet. This is normal frontend-before-
  backend sequencing — the page won't reach real users before Phase 4 wires the backend — not a
  claim that subscription currently works in production.
- **Book Consultation CTA links to `/book-consultation`.** That page doesn't exist yet; this spec
  creates a minimal placeholder page (heading + note that booking is coming soon) so the link
  isn't dead, not a full Calendly integration (Phase 4 scope).
- **FAQ uses shadcn's Accordion component** (Radix-based, installed via `npx shadcn add accordion`)
  rather than a hand-built disclosure widget — Phase 1's mega-menu accessibility issues (three
  review rounds to get keyboard/touch/mouse interaction right) showed that battle-tested
  accessible primitives are worth using instead of reinventing disclosure/interaction logic.

## Content

Real copy, decided now rather than left as placeholders for the implementation plan:

**Hero**
- Eyebrow: "UAE & UK Company Formation, Tax & Advisory"
- Headline: "Company formation and compliance, without the guesswork."
- Subhead: "Alliance Street handles UAE and UK company setup, tax, accounting, and advisory under
  one roof — so you spend less time on paperwork and more time running the business you started it
  for."
- Primary CTA: "Book a Consultation" → `/book-consultation`
- Secondary CTA: "View Services" → `/services`

**Why Alliance Street** (4 differentiators)
1. "Two markets, one point of contact" — UAE and UK expertise under one advisor relationship, no
   re-explaining your business to a new firm every time you cross a border.
2. "Built for founders, not filing cabinets" — plain-language guidance, not generic paperwork
   processing.
3. "We stay after the licence is printed" — an ongoing compliance and accounting partner, not a
   setup agent who disappears once you're registered.
4. "Structured for growth" — tax planning and CFO-level advisory as you scale, not just initial
   registration.

**Service Preview** (4 flagship cards, one per nav category)
1. "Free Zone Company Formation" — "Set up in a UAE free zone with 100% foreign ownership." →
   `/services/uae/free-zone-company-formation`
2. "Corporate Tax" — "Registration, filing, and planning that keeps you compliant as UAE tax rules
   evolve." → `/services/uae/corporate-tax`
3. "UK Company Formation" — "Incorporate with Companies House and get accounting support from day
   one." → `/services/uk/company-formation`
4. "CFO Services" — "Fractional finance leadership for founders who need strategy, not just
   bookkeeping." → `/services/advisory/cfo-services`

**Process** (4 steps)
1. "Discovery Call" — "We learn about your business, where you're trading, and what structure
   actually fits — not the one that's easiest to sell."
2. "Structuring & Setup" — "We recommend the right jurisdiction and entity type, then handle
   formation, licensing, and banking introductions."
3. "Compliance, Built In" — "VAT, corporate tax, and bookkeeping are set up correctly from day one,
   not fixed after an audit finds the gaps."
4. "Ongoing Partnership" — "We stay on as your accountant and advisor — filings, renewals, and the
   questions that come up in between."

**FAQ** (6 questions)
1. "How long does UAE company formation take?" — "Most free zone and mainland formations complete
   within 1–3 weeks once documents are submitted, though bank account opening can add further time
   depending on the bank and your business activity."
2. "Free zone or mainland — which should I choose?" — "It depends on where you plan to trade. Free
   zone entities suit businesses trading internationally or within the zone; mainland entities suit
   businesses trading directly within the UAE market. We'll walk through this on your discovery
   call."
3. "Do you handle both UAE and UK entities?" — "Yes — this is one of the reasons clients work with
   us. If you're structuring across both markets, you get one advisory relationship instead of
   coordinating two separate firms."
4. "What's included in your accounting and bookkeeping service?" — "Monthly bookkeeping, VAT return
   preparation and filing, and management reporting, with corporate tax and statutory accounts
   handled as part of your annual compliance."
5. "Do you offer support after the company is registered?" — "Yes. Company formation is the start,
   not the end — we continue as your accountant and compliance partner for VAT, tax, payroll, and
   renewals."
6. "How do I get started?" — "Book a consultation and we'll walk through your business, the right
   structure, and a clear next-step plan before you commit to anything."

**Book Consultation CTA**
- Headline: "Ready to talk it through?"
- Subcopy: "Book a call with an advisor — no obligation, no sales script, just a clear read on what
  setup makes sense for your business."
- CTA: "Book Consultation" → `/book-consultation`

**Newsletter**
- Headline: "Stay ahead of UAE and UK compliance changes."
- Subcopy: "Occasional, practical updates on tax and regulatory changes that affect founders — no
  spam."
- Form: email input + submit, client-side validated, local success state (see decision above).

## Architecture

New files:
- `src/components/ui/aurora-background.tsx` — reusable animated gradient-mesh + mouse-glow
  background primitive, absolutely positioned, `pointer-events-none`, used behind hero-style
  sections.
- `src/components/sections/hero.tsx` — uses `AuroraBackground`, large fluid headline with its own
  word/blur reveal (reuses the animation approach from `SectionHeading` but at hero scale —
  `SectionHeading` itself isn't extended with a size prop, since the hero's centered/oversized
  treatment is a one-off, not a variant other callers need).
- `src/components/sections/why-alliance-street.tsx`
- `src/components/sections/service-preview.tsx`
- `src/components/sections/process.tsx`
- `src/components/sections/home-faq.tsx` — uses shadcn's `Accordion` (installed this phase).
- `src/components/sections/book-consultation-cta.tsx`
- `src/components/sections/newsletter.tsx`
- `src/app/book-consultation/page.tsx` — minimal placeholder page so the CTA doesn't link to a 404.

Modified:
- `src/app/page.tsx` — replaced with the composed section list.

Content lives inline in each section component (not centralized like Phase 1's `site-config.ts`),
since — unlike nav/company info — nothing else in the app consumes this data.

## Testing / correctness bar

Same as Phase 1: no automated test framework this phase. `npm run build` (typecheck + lint + prod
build) plus a dev-server curl/structural check per section-adding task, and a manual browser pass
at the end covering desktop and mobile widths, hero animation, FAQ accordion interaction, and the
newsletter form's client-side validation and success state.

## Open items for later phases

- Statistics, Trusted By/Logos, Case Studies, Testimonials, Pricing Preview, Knowledge Centre
  preview — added once real client data, pricing, and content exist.
- Newsletter backend (Resend) — Phase 4.
- `/book-consultation` real booking flow (Calendly) — Phase 4.
- `/services`, individual service pages — later page-build phase.
