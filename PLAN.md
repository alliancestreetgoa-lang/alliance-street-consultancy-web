# PLAN — Complete all linked pages (services + remaining nav pages)
Stack: Next.js 16.2.10 App Router / React 19 / Tailwind v4 (unchanged). New files: `src/lib/services-data.ts` (20 service records with category/group/slug/title/tagline/includes/whoFor, sourced from existing `NAV_GROUPS`), `src/app/services/page.tsx`, `src/app/services/[category]/[slug]/page.tsx` (+ `generateStaticParams`), `src/app/industries/page.tsx`, `src/app/pricing/page.tsx`, `src/app/knowledge-centre/page.tsx`, `src/app/contact/page.tsx`, `src/app/privacy-policy/page.tsx`, `src/app/terms-and-conditions/page.tsx`, one section component per page as needed, reusing `Container`/`SectionHeading`/`Badge`/`AuroraBackground`/`BookConsultationCTA`.
Spike findings: none needed — same proven pattern as About/Case Studies; the only new mechanic is `generateStaticParams` for the dynamic service route, which is documented, standard App Router behavior (confirmed already compatible with this project in the earlier Next.js 16 conventions check).

1. [ ] Data + walking skeleton: `services-data.ts` with all 20 records, `/services/[category]/[slug]/page.tsx` with `generateStaticParams`, rendering hero + "what's included" + "who it's for" + CTA for ONE service first.
   Verify by: `curl localhost:3000/services/uae/free-zone-company-formation` → 200; browser shows real content, zero console errors.
2. [ ] Remaining 19 services render via the same template (data-only change, no new component code).
   Verify by: spot-check 4 more (one per category) return 200 and show correct title/category; `npm run build` static-generates all 20 paths.
3. [ ] `/services` index: 4 grouped categories, all 20 services linked.
   Verify by: browser shows all 20 links; clicking 3 sampled links (one per differing category segment) lands on the correct detail page.
4. [ ] `/industries` page: hero + industries-served content + CTA.
   Verify by: 200, renders, 375px/1440px responsive, zero console errors.
5. [ ] `/pricing` page: hero + how-pricing-works content (no fabricated numbers) + CTA.
   Verify by: 200, renders, no invented price figures present, zero console errors.
6. [ ] `/knowledge-centre`: designed empty state (not fake posts) + CTA.
   Verify by: 200, renders a real designed empty state (icon/heading/explanation), zero console errors.
7. [ ] `/contact`: real contact info (from `COMPANY`) + client-validated inquiry form with a visible not-wired-yet confirmation state.
   Verify by: submitting the form shows a visible message (not a silent no-op); 200, zero console errors.
8. [ ] `/privacy-policy` and `/terms-and-conditions`: standard placeholder legal copy, clearly structured, flagged in-repo as needing real legal review.
   Verify by: both 200, readable structure (headed sections), zero console errors.
9. [ ] Full site link sweep + verification pass.
   Verify by: every href enumerated via `grep -n 'href:' src/lib/site-config.ts` (plus the 20 service hrefs) returns 200; `npm run build` exits 0 with 27 new static paths listed; responsive sweep 320–1440px; console clean across a sample of 6 pages.
