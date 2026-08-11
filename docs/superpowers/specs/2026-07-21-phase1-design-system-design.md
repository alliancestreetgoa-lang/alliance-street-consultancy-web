# Phase 1: Design System — Alliance Street Consultancy (Next.js rebuild)

## Context

Alliance Street Consultancy is getting a full enterprise-grade Next.js 15 rebuild, replacing the
placeholder-content Vite site at `~/alliance-street-consultancy`. The full brief (see project
`CLAUDE.md`) covers ~40 pages, a CMS, booking, and integrations — too large for one build cycle.
This spec covers only **Phase 1: the design system foundation** — tokens, typography, the base
navigation/footer shell, and the primitive components everything else will be built on. Later
phases (component library, pages, CMS/integrations, SEO/perf) each get their own spec.

## Goals

- Establish design tokens (color, type, spacing) as Tailwind v4 CSS-first `@theme` variables.
- Ship a working glass-morphism sticky navbar with a grouped mega menu and a footer, both wired to
  real (or clearly-placeholder) company info.
- Ship foundational primitives (Button, Container, SectionHeading, Badge) with the brief's signature
  motion (magnetic hover, word/blur reveal).
- Provide a `/style-guide` route as the visual QA surface for this phase.
- `next build` passes cleanly; this is the correctness bar for Phase 1 (no CMS/business logic exists
  yet to unit test).

## Non-goals (deferred to later phases)

- Actual page content (Home, Services, About, etc.) — Phase 3.
- CMS (Sanity/Payload), booking, forms, email, analytics — Phase 4.
- SEO/schema/sitemap, performance tuning — Phase 5.
- Full component library beyond the Phase 1 primitives — Phase 2.

## Decisions made during brainstorming

- **Project location**: new sibling project at `~/alliance-street-consultancy-web`, own git repo
  (does not touch/replace the existing Vite site).
- **Typography**: geometric sans pairing — General Sans (display/headlines) + Inter (body/UI), both
  via `next/font`. Fluid `clamp()`-based hero size for large headlines.
- **Navigation**: grouped mega menu, organized into columns by category — UAE Setup, UAE Tax &
  Compliance, UK Services, Advisory — scales to the ~25 service pages without dumping them flat into
  the nav.
- **Contact info**: email `info@alliancestreet.ae` and address "Business Bay, Dubai, United Arab
  Emirates" reused from the existing `alliancestreet.ae` repo (real). Phone/WhatsApp: **no real
  number exists yet** — user will provide it later. Use a clearly-marked placeholder
  (`+971 4 XXX XXXX`) in the interim, sourced from a single `lib/site-config.ts` constant so the real
  number is a one-line swap later.
- **Component sourcing**: use 21st.dev's catalog first (via the connected MCP tools — the standalone
  `21st` CLI's saved token is stale and needs an interactive re-login the user hasn't done; MCP
  access is authenticated and confirmed working), restyled to project tokens. Fall back to hand-built
  shadcn/Tailwind primitives where no good catalog match exists.
- **Theming architecture**: Tailwind v4 CSS-first `@theme` directive in `globals.css` (not a legacy
  `tailwind.config.ts` theme.extend) — idiomatic for v4, and what shadcn's v4 registry and 21st.dev's
  v4 components expect.

## Architecture

- Scaffolded via `create-next-app` (App Router, TypeScript, Tailwind v4, ESLint, `src/` dir, `@/*`
  alias, Turbopack dev).
- shadcn/ui initialized (`radix` base, `nova` preset, CSS variables) for the primitive component
  layer; 21st.dev components installed on top via `shadcn add <21st-url>` and restyled.
- Framer Motion (`LazyMotion` at root) for animation; Lenis wrapped in a client provider in the root
  layout for smooth scroll.
- `lib/site-config.ts`: single source of truth for nav structure + company contact info, consumed by
  navbar/footer now and by schema/SEO in Phase 5.

## Design tokens (`src/app/globals.css`, `@theme`)

- Colors: `--color-primary: #C1121F`, `--color-background: #050505`, `--color-secondary: #111111`,
  `--color-white: #FFFFFF`, `--color-muted: #A0A0A0`, `--color-glass-border: rgba(255,255,255,.08)`,
  plus a soft-red glow shadow token.
- Fonts: `--font-display` (General Sans), `--font-body` (Inter), loaded via `next/font/google` (or
  local files if General Sans isn't on Google Fonts — confirm during implementation).
- Type scale: base Tailwind scale extended with a fluid hero size via `clamp()`.
- Spacing: generous section-padding scale beyond Tailwind defaults, for the "premium whitespace" the
  brief calls for.

## Components (Phase 1 scope)

1. **Navbar** — sticky, blur-on-scroll background, scroll-progress bar, grouped mega menu (4
   categories above), mobile slide-in drawer. Base pulled from 21st.dev (candidate: `navbar-5` /
   `navbar-section-2`), restyled to tokens.
2. **Footer** — link columns, contact block (real email/address, placeholder phone flagged inline),
   newsletter input, social icons.
3. **Button** — primary/secondary/ghost variants, magnetic hover + press animation.
4. **Section primitives** — `Container`, `SectionHeading` (word/blur reveal on scroll), `Badge`.
5. **`/style-guide` route** — renders all of the above live; this is Phase 1's manual QA surface.

## Data flow

Static `lib/site-config.ts` module holds nav structure and company info. No CMS/DB in this phase —
components read directly from this module.

## Testing / correctness bar

No CMS or interactive business logic exists yet, so formal test suites aren't warranted this phase.
Correctness bar: TypeScript strict mode + ESLint clean, `next build` succeeds, and `/style-guide`
renders all primitives correctly across mobile/desktop breakpoints (manual check).

## Open items for later phases

- CMS choice (Sanity vs Payload) — not decided, not needed until Phase 4.
- Real phone/WhatsApp number — pending from user.
- Whether "General Sans" needs local font files vs a Google Fonts equivalent — confirm during
  implementation.
