# PLAN — About & Case Studies pages
Stack: Next.js 16.2.10 App Router / React 19 / Tailwind v4 (fixed by existing project). New files only: `src/app/about/page.tsx`, `src/app/case-studies/page.tsx`, plus one new section component per page's unique content, reusing existing `Container`, `SectionHeading`, `Badge`, `MagneticButton`, `AuroraBackground`, and the existing shared `BookConsultationCTA` section.
Spike findings: none needed — plain content pages on an already-proven design system, no novel risk identified.

1. Walking skeleton: `/about` route with hero (Badge + word-reveal H1 + subhead), reusing the Hero pattern.
   Verify by: `curl -s -o /dev/null -w "%{http_code}" localhost:3000/about` → 200; browser shows hero, zero console errors.
2. About: story + differentiators section (card grid, new copy, same card pattern as `WhyAllianceStreet`).
   Verify by: at 1440px cards form a grid below hero; at 375px cards stack to one column, no horizontal scroll.
3. About: how-we-work section + `BookConsultationCTA` import, page composed in `src/app/about/page.tsx`.
   Verify by: full page scroll from hero to CTA with no console errors; CTA button links to `/book-consultation`.
4. Walking skeleton: `/case-studies` route with hero (Badge + H1 + subhead).
   Verify by: `curl -s -o /dev/null -w "%{http_code}" localhost:3000/case-studies` → 200; browser shows hero, zero console errors.
5. Case Studies: 6 scenario cards (challenge/approach/outcome), grid section, one per major service category pairing.
   Verify by: at 1440px 6 cards render in a responsive grid; at 375px cards stack to one column, no horizontal scroll.
6. Case Studies: `BookConsultationCTA` import, page composed in `src/app/case-studies/page.tsx`.
   Verify by: full page scroll from hero to CTA with no console errors.
7. Nav/footer integration: no code change expected (links already point here) — confirm live.
   Verify by: click "About" and "Case Studies" in navbar (desktop + mobile drawer) and in footer's Company column; each navigates with no 404.
8. Full verification pass per references/verify.md.
   Verify by: `npm run build` exits 0; responsive sweep 320–1440px on both pages; console clean; visual side-by-side with homepage confirms same design language.
