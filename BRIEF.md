# BRIEF: Alliance Street Consultancy — About & Case Studies pages
**Building:** Two new marketing pages (`/about`, `/case-studies`) for the existing Alliance Street Consultancy Next.js site, extending Phase 1's homepage into Phase 3 content pages.
**Job class:** marketing site (extension of existing multi-page site)
**Visitor's job:** About — decide the firm is credible enough to book a consultation. Case Studies — find a scenario like their own and see how it was handled, then book a consultation.
**Register:** premium, plain-spoken, advisory — "founders, not filing cabinets" (matches homepage copy already shipped)
**Pages/features:** `/about` (hero, firm story, differentiators/values, how-we-work, CTA), `/case-studies` (hero, 6 illustrative client-scenario cards spanning the 4 existing service categories, CTA) — both reuse existing nav/footer, no new routes beyond these two
**Constraints/Existing:** Next.js 16.2.10 App Router + React 19 + Tailwind v4, existing design tokens and primitives locked (`Container`, `SectionHeading`, `Badge`, `MagneticButton`, `AuroraBackground`, card pattern `rounded-2xl border-glass-border bg-secondary/40 p-8`), `LazyMotion strict` requires `m.*` not `motion.*`, nav already links to both routes (currently 404), no CMS — content is hardcoded like existing sections, `lib/site-config.ts` is the source of truth for company info
**Assumptions:** No real team bios or real client data exist yet (confirmed via design-system spec: prior site was placeholder-content). Case studies will be written as realistic, industry-plausible scenarios labeled by situation ("Free Zone Trading Company — Dubai") rather than fabricated named clients or invented testimonial quotes, to stay honest while still being real-sounding, layout-exercising copy. Firm-story copy on About will be a plausible professional-services narrative consistent with the Business Bay/UAE+UK positioning already established — not verified biographical fact, and flagged here for the requester to correct.
**Done when:**
- [ ] `/about` and `/case-studies` return 200 (not 404) and render with zero console errors
- [ ] Both pages visually match the existing dark/aurora/red-accent design system when compared side-by-side with the homepage
- [ ] At 375px width: no horizontal scroll, all cards stack to one column, nav/footer behave as on other pages
- [ ] At 1440px width: content is centered in the `Container` max-width, case-study cards form a responsive grid
- [ ] Every nav/footer link to `/about` and `/case-studies` (desktop mega-menu, mobile drawer, footer columns) navigates correctly with no 404
- [ ] `npm run build` completes with no type or lint errors
**Out of scope:** CMS-driven content, individual `/case-studies/[slug]` detail pages, real team headshots or verified bios, real client testimonials or logos, filtering/search/pagination on case studies

## Design
**Direction:** Inherited, not re-picked — "refined dark advisory" locked in Phase 1 (`docs/superpowers/specs/2026-07-21-phase1-design-system-design.md`) and proven on the shipped homepage. Extending an existing multi-page site means the design decision is "stay consistent," not "choose a direction."
**Fit justification:** A near-black ground with a single deep-red accent and generous whitespace reads as serious professional-services advisory, not a template — appropriate for a firm asking founders to trust it with tax and compliance.
**Fonts:** Geist (`--font-display`, headings) + Inter (`--font-sans`, body) — both via `next/font/google`, already loaded in `src/app/layout.tsx`. No new fonts introduced.
**Palette:** background `#050505`, secondary/card `#111111`, foreground `#ffffff`, muted-foreground `#a0a0a0`, glass-border `rgba(255,255,255,.08)`, accent (only one) `#c1121f` — used for CTAs, eyebrow labels, and the aurora glow only.
**Contrast:** muted-foreground `#a0a0a0` on background `#050505` ≈ 7.7:1 (computed via WCAG relative-luminance formula); foreground `#ffffff` on background is ≈19:1. Both clear the 4.5:1 floor.
**Spacing:** existing 4/8px scale, section padding `py-24 sm:py-32` (96–128px) matching every homepage section — no new scale introduced.
**Radius:** existing scale (`rounded-2xl` cards, `rounded-3xl` CTA band, `rounded-full` badges/buttons) — no new values.
**Motion:** existing `SectionHeading` word/blur reveal on scroll + `AuroraBackground` hero treatment, reused as-is; no new motion vocabulary for two content pages.
