# Phase 1: Design System Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the design-token foundation, navigation shell, footer, and core primitives for the Alliance Street Consultancy Next.js rebuild, verifiable via a `/style-guide` route.

**Architecture:** Tailwind v4 CSS-first tokens (`@theme` in `globals.css`) drive shadcn/ui + hand-built primitives; a static `lib/site-config.ts` module is the single source of truth for nav structure and company contact info; Framer Motion (`LazyMotion`) + Lenis provide the animation/scroll layer wrapped around every page in the root layout.

**Tech Stack:** Next.js 16.2.10 (App Router, this repo — see `AGENTS.md`, do not assume Next 15 conventions), React 19, TypeScript, Tailwind CSS v4, shadcn/ui (radix base, nova preset — already initialized), Framer Motion, Lenis, lucide-react.

## Global Constraints

- Project root: `~/alliance-street-consultancy-web`. Own git repo, already initialized with an initial commit (scaffold + spec doc).
- Design spec: `docs/superpowers/specs/2026-07-21-phase1-design-system-design.md` — this plan implements it exactly; do not add scope beyond it (no CMS, no real pages beyond a homepage placeholder, no forms).
- Color tokens: `--primary: #C1121F`, `--background: #050505`, `--secondary: #111111`, `--foreground: #FFFFFF`, `--muted-foreground: #A0A0A0`, glass border `rgba(255,255,255,.08)`. Site is permanently dark — no light-mode toggle.
- Typography: **General Sans is not available via `next/font/google`** (confirmed during planning — it's a Fontshare font, not a Google Font, and no local font files exist in this repo). Substituting **Geist** (already wired by the shadcn `nova` preset, and literally the Vercel house font — matches the brief's "Vercel/Linear quality" aesthetic target) as the display font, paired with **Inter** for body text. This resolves the spec's "confirm font availability" open item.
- Phone/WhatsApp: real numbers are not yet available. Use placeholder `+971 4 XXX XXXX` (phone) / `+971 5X XXX XXXX` (WhatsApp) sourced from `lib/site-config.ts`, visibly flagged as placeholder in the footer UI. Do not fabricate a real-looking number.
- Real values already confirmed: email `info@alliancestreet.ae`, address `Business Bay, Dubai, United Arab Emirates`.
- No automated test framework exists in this repo and none is being added this phase (per the approved spec's testing bar: TypeScript strict + ESLint + `next build` + manual `/style-guide` check — there's no business logic yet to unit test). Every task's verification step is `npm run build` (which runs Next's typecheck + lint + prod build) plus, for route-level tasks, a dev-server curl smoke check.
- Commit after every task, using the repo's existing conventions (no prior commits to match style against beyond the initial scaffold commit — use plain, descriptive messages).

---

### Task 1: Design tokens in `globals.css`

**Files:**
- Modify: `src/app/globals.css`

**Interfaces:**
- Produces: CSS custom properties consumed by every later task via Tailwind utility classes — `bg-background`, `bg-primary`, `text-foreground`, `text-muted-foreground`, `border-glass-border`, `shadow-glow`, `text-hero`, `font-display`, `font-sans` (default = Inter body font wired in Task 7), `rounded-{sm,md,lg,xl,2xl,3xl}`.

- [ ] **Step 1: Replace the token block**

Replace the entire contents of `src/app/globals.css` with:

```css
@import "tailwindcss";
@import "tw-animate-css";
@import "shadcn/tailwind.css";

@theme inline {
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --font-sans: var(--font-inter);
  --font-display: var(--font-geist);
  --color-sidebar-ring: var(--sidebar-ring);
  --color-sidebar-border: var(--sidebar-border);
  --color-sidebar-accent-foreground: var(--sidebar-accent-foreground);
  --color-sidebar-accent: var(--sidebar-accent);
  --color-sidebar-primary-foreground: var(--sidebar-primary-foreground);
  --color-sidebar-primary: var(--sidebar-primary);
  --color-sidebar-foreground: var(--sidebar-foreground);
  --color-sidebar: var(--sidebar);
  --color-ring: var(--ring);
  --color-input: var(--input);
  --color-border: var(--border);
  --color-glass-border: var(--glass-border);
  --color-destructive: var(--destructive);
  --color-accent-foreground: var(--accent-foreground);
  --color-accent: var(--accent);
  --color-muted-foreground: var(--muted-foreground);
  --color-muted: var(--muted);
  --color-secondary-foreground: var(--secondary-foreground);
  --color-secondary: var(--secondary);
  --color-primary-foreground: var(--primary-foreground);
  --color-primary: var(--primary);
  --color-popover-foreground: var(--popover-foreground);
  --color-popover: var(--popover);
  --color-card-foreground: var(--card-foreground);
  --color-card: var(--card);
  --radius-sm: calc(var(--radius) * 0.6);
  --radius-md: calc(var(--radius) * 0.8);
  --radius-lg: var(--radius);
  --radius-xl: calc(var(--radius) * 1.4);
  --radius-2xl: calc(var(--radius) * 1.8);
  --radius-3xl: calc(var(--radius) * 2.2);
  --shadow-glow: 0 0 60px -12px rgba(193, 18, 31, 0.55);
  --text-hero: clamp(2.75rem, 1rem + 6vw, 6.5rem);
  --text-hero--line-height: 1.02;
  --text-hero--letter-spacing: -0.02em;
}

:root {
  --background: #050505;
  --foreground: #ffffff;
  --card: #111111;
  --card-foreground: #ffffff;
  --popover: #111111;
  --popover-foreground: #ffffff;
  --primary: #c1121f;
  --primary-foreground: #ffffff;
  --secondary: #111111;
  --secondary-foreground: #ffffff;
  --muted: #111111;
  --muted-foreground: #a0a0a0;
  --accent: #1a1a1a;
  --accent-foreground: #ffffff;
  --destructive: #c1121f;
  --border: rgba(255, 255, 255, 0.08);
  --glass-border: rgba(255, 255, 255, 0.08);
  --input: rgba(255, 255, 255, 0.12);
  --ring: #c1121f;
  --radius: 0.75rem;
  --sidebar: #0a0a0a;
  --sidebar-foreground: #ffffff;
  --sidebar-primary: #c1121f;
  --sidebar-primary-foreground: #ffffff;
  --sidebar-accent: #111111;
  --sidebar-accent-foreground: #ffffff;
  --sidebar-border: rgba(255, 255, 255, 0.08);
  --sidebar-ring: #c1121f;
}

@layer base {
  * {
    @apply border-border outline-ring/50;
  }
  body {
    @apply bg-background text-foreground;
  }
  html {
    @apply font-sans;
  }
}
```

This removes the shadcn-default light/dark toggle scaffolding (`.dark` class block, `@custom-variant dark`, chart tokens) since the brand is permanently dark and Phase 1 has no charts. `--font-sans` and `--font-display` reference CSS variables (`--font-inter`, `--font-geist`) that Task 7 wires up via `next/font` — until Task 7 runs, the build still succeeds because unresolved CSS custom properties don't break compilation, they just fall back silently at render time.

- [ ] **Step 2: Verify the build**

Run: `npm run build`
Expected: Build succeeds with no TypeScript or ESLint errors (font variables not yet defined is fine — CSS, not TS).

- [ ] **Step 3: Commit**

```bash
git add src/app/globals.css
git commit -m "Add Alliance Street design tokens to globals.css"
```

---

### Task 2: Site config (nav structure + company info)

**Files:**
- Create: `src/lib/site-config.ts`

**Interfaces:**
- Produces: `NavLink` type `{ label: string; href: string; description?: string }`, `NavGroup` type `{ title: string; links: NavLink[] }`, `NAV_GROUPS: NavGroup[]`, `PRIMARY_NAV: NavLink[]`, `COMPANY: { name, email, phone, whatsapp, address }`, `FOOTER_LINK_COLUMNS: { title: string; links: NavLink[] }[]`. Consumed by Navbar (Task 5), Footer (Task 6).

- [ ] **Step 1: Create the file**

```ts
// src/lib/site-config.ts

export type NavLink = {
  label: string;
  href: string;
  description?: string;
};

export type NavGroup = {
  title: string;
  links: NavLink[];
};

export const NAV_GROUPS: NavGroup[] = [
  {
    title: "UAE Setup",
    links: [
      {
        label: "Free Zone Company Formation",
        href: "/services/uae/free-zone-company-formation",
        description: "Set up in a UAE free zone with 100% ownership.",
      },
      {
        label: "Mainland Company Formation",
        href: "/services/uae/mainland-company-formation",
        description: "Trade anywhere in the UAE and beyond.",
      },
      {
        label: "Offshore Company Formation",
        href: "/services/uae/offshore-company-formation",
        description: "Asset protection and international structuring.",
      },
      {
        label: "PRO Services",
        href: "/services/uae/pro-services",
        description: "Visas, licensing, and government liaison.",
      },
      {
        label: "Corporate Bank Account Assistance",
        href: "/services/uae/corporate-bank-account-assistance",
        description: "Get banked faster with the right documentation.",
      },
    ],
  },
  {
    title: "UAE Tax & Compliance",
    links: [
      {
        label: "Corporate Tax",
        href: "/services/uae/corporate-tax",
        description: "Registration, filing, and planning.",
      },
      {
        label: "VAT Registration",
        href: "/services/uae/vat-registration",
        description: "Get VAT-registered correctly the first time.",
      },
      {
        label: "VAT Return Filing",
        href: "/services/uae/vat-return-filing",
        description: "Accurate, on-time quarterly filings.",
      },
      {
        label: "Audit Support",
        href: "/services/uae/audit-support",
        description: "Be ready before the auditor arrives.",
      },
      {
        label: "Bookkeeping",
        href: "/services/uae/bookkeeping",
        description: "Clean books, every month.",
      },
    ],
  },
  {
    title: "UK Services",
    links: [
      {
        label: "UK Company Formation",
        href: "/services/uk/company-formation",
        description: "Incorporate with Companies House.",
      },
      {
        label: "UK Accounting",
        href: "/services/uk/accounting",
        description: "Statutory accounts, done right.",
      },
      {
        label: "Self Assessment",
        href: "/services/uk/self-assessment",
        description: "Personal tax returns, filed on time.",
      },
      {
        label: "Corporation Tax",
        href: "/services/uk/corporation-tax",
        description: "Compliance and relief planning.",
      },
      {
        label: "UK VAT",
        href: "/services/uk/vat",
        description: "Registration and quarterly returns.",
      },
    ],
  },
  {
    title: "Advisory",
    links: [
      {
        label: "Business Consulting",
        href: "/services/advisory/business-consulting",
        description: "Strategy for growth-stage founders.",
      },
      {
        label: "CFO Services",
        href: "/services/advisory/cfo-services",
        description: "Fractional finance leadership.",
      },
      {
        label: "Tax Planning",
        href: "/services/advisory/tax-planning",
        description: "Structure for what's next.",
      },
      {
        label: "Payroll",
        href: "/services/advisory/payroll",
        description: "Accurate, compliant payroll runs.",
      },
      {
        label: "Business Licensing",
        href: "/services/advisory/business-licensing",
        description: "Renewals and amendments, handled.",
      },
    ],
  },
];

export const PRIMARY_NAV: NavLink[] = [
  { label: "About", href: "/about" },
  { label: "Industries", href: "/industries" },
  { label: "Case Studies", href: "/case-studies" },
  { label: "Pricing", href: "/pricing" },
  { label: "Knowledge Centre", href: "/knowledge-centre" },
  { label: "Contact", href: "/contact" },
];

export const COMPANY = {
  name: "Alliance Street Consultancy",
  email: "info@alliancestreet.ae",
  // Placeholder — real number pending from client. See
  // docs/superpowers/specs/2026-07-21-phase1-design-system-design.md
  phone: "+971 4 XXX XXXX",
  whatsapp: "+971 5X XXX XXXX",
  address: "Business Bay, Dubai, United Arab Emirates",
};

export const FOOTER_LINK_COLUMNS: { title: string; links: NavLink[] }[] = [
  {
    title: "Services",
    links: NAV_GROUPS.flatMap((group) => group.links.slice(0, 3)),
  },
  {
    title: "Company",
    links: PRIMARY_NAV,
  },
  {
    title: "Legal",
    links: [
      { label: "Privacy Policy", href: "/privacy-policy" },
      { label: "Terms & Conditions", href: "/terms-and-conditions" },
    ],
  },
];
```

- [ ] **Step 2: Verify the build**

Run: `npm run build`
Expected: Build succeeds (this file isn't imported anywhere yet, so it just needs to typecheck cleanly on its own).

- [ ] **Step 3: Commit**

```bash
git add src/lib/site-config.ts
git commit -m "Add site-config: nav structure and company contact info"
```

---

### Task 3: Section primitives — Container, Badge, SectionHeading

**Files:**
- Create: `src/components/ui/container.tsx`
- Create: `src/components/ui/badge.tsx`
- Create: `src/components/ui/section-heading.tsx`

**Interfaces:**
- Consumes: `cn` from `@/lib/utils` (already exists from shadcn init).
- Produces: `Container` (div wrapper, accepts all `HTMLAttributes<HTMLDivElement>` + `className`), `Badge` (span wrapper, accepts all `HTMLAttributes<HTMLSpanElement>` + `className`), `SectionHeading` (props: `{ eyebrow?: string; title: string; description?: string; align?: "left" | "center"; className?: string }`). Consumed by Navbar (Task 5), Footer (Task 6), style-guide/homepage (Task 8).

- [ ] **Step 1: Create Container**

```tsx
// src/components/ui/container.tsx
import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export function Container({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("mx-auto w-full max-w-7xl px-6 lg:px-8", className)} {...props} />
  );
}
```

- [ ] **Step 2: Create Badge**

```tsx
// src/components/ui/badge.tsx
import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export function Badge({ className, ...props }: HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 rounded-full border border-glass-border bg-white/5 px-4 py-1.5 text-xs font-medium uppercase tracking-widest text-muted-foreground backdrop-blur-sm",
        className
      )}
      {...props}
    />
  );
}
```

- [ ] **Step 3: Create SectionHeading**

```tsx
// src/components/ui/section-heading.tsx
"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

type SectionHeadingProps = {
  eyebrow?: string;
  title: string;
  description?: string;
  align?: "left" | "center";
  className?: string;
};

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "left",
  className,
}: SectionHeadingProps) {
  const words = title.split(" ");

  return (
    <div
      className={cn(
        "flex flex-col gap-4",
        align === "center" && "items-center text-center",
        className
      )}
    >
      {eyebrow ? (
        <span className="text-sm font-medium uppercase tracking-widest text-primary">
          {eyebrow}
        </span>
      ) : null}
      <h2 className="font-display text-4xl font-medium tracking-tight text-foreground sm:text-5xl">
        {words.map((word, index) => (
          <motion.span
            key={`${word}-${index}`}
            initial={{ opacity: 0, y: "0.6em", filter: "blur(8px)" }}
            whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            viewport={{ once: true, margin: "-10%" }}
            transition={{ duration: 0.5, delay: index * 0.05, ease: [0.16, 1, 0.3, 1] }}
            className="mr-[0.25em] inline-block"
          >
            {word}
          </motion.span>
        ))}
      </h2>
      {description ? <p className="max-w-2xl text-lg text-muted-foreground">{description}</p> : null}
    </div>
  );
}
```

- [ ] **Step 4: Verify the build**

Run: `npm run build`
Expected: Build succeeds with no TypeScript or ESLint errors.

- [ ] **Step 5: Commit**

```bash
git add src/components/ui/container.tsx src/components/ui/badge.tsx src/components/ui/section-heading.tsx
git commit -m "Add Container, Badge, and SectionHeading primitives"
```

---

### Task 4: MagneticButton

**Files:**
- Create: `src/components/ui/magnetic-button.tsx`

**Interfaces:**
- Consumes: `cn` from `@/lib/utils`.
- Produces: `MagneticButton` component, props `{ href?: string; onClick?: () => void; children: React.ReactNode; variant?: "primary" | "secondary" | "ghost"; className?: string }`. Consumed by Navbar (Task 5), style-guide/homepage (Task 8).

- [ ] **Step 1: Create the component**

```tsx
// src/components/ui/magnetic-button.tsx
"use client";

import { useRef, useState } from "react";
import type { PointerEvent, ReactNode } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { cn } from "@/lib/utils";

type MagneticButtonProps = {
  href?: string;
  onClick?: () => void;
  children: ReactNode;
  variant?: "primary" | "secondary" | "ghost";
  className?: string;
};

const VARIANT_CLASSES: Record<NonNullable<MagneticButtonProps["variant"]>, string> = {
  primary: "bg-primary text-primary-foreground shadow-glow hover:brightness-110",
  secondary: "border border-glass-border bg-white/5 text-foreground hover:bg-white/10",
  ghost: "text-foreground hover:text-primary",
};

export function MagneticButton({
  href,
  onClick,
  children,
  variant = "primary",
  className,
}: MagneticButtonProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const [offset, setOffset] = useState({ x: 0, y: 0 });

  function handlePointerMove(event: PointerEvent<HTMLSpanElement>) {
    const bounds = ref.current?.getBoundingClientRect();
    if (!bounds) return;
    const x = event.clientX - bounds.left - bounds.width / 2;
    const y = event.clientY - bounds.top - bounds.height / 2;
    setOffset({ x: x * 0.3, y: y * 0.3 });
  }

  function handlePointerLeave() {
    setOffset({ x: 0, y: 0 });
  }

  const content = (
    <motion.span
      ref={ref}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      animate={{ x: offset.x, y: offset.y }}
      whileTap={{ scale: 0.94 }}
      transition={{ type: "spring", stiffness: 300, damping: 20, mass: 0.5 }}
      className={cn(
        "inline-flex cursor-pointer items-center justify-center gap-2 rounded-full px-7 py-3 text-sm font-medium tracking-tight transition-colors",
        VARIANT_CLASSES[variant],
        className
      )}
    >
      {children}
    </motion.span>
  );

  if (href) {
    return (
      <Link href={href} onClick={onClick} className="inline-block">
        {content}
      </Link>
    );
  }

  return (
    <button type="button" onClick={onClick} className="inline-block">
      {content}
    </button>
  );
}
```

- [ ] **Step 2: Verify the build**

Run: `npm run build`
Expected: Build succeeds with no TypeScript or ESLint errors.

- [ ] **Step 3: Commit**

```bash
git add src/components/ui/magnetic-button.tsx
git commit -m "Add MagneticButton with pointer-tracking hover and press animation"
```

---

### Task 5: Navbar with grouped mega menu

**Files:**
- Create: `src/components/layout/navbar.tsx`

**Interfaces:**
- Consumes: `NAV_GROUPS`, `PRIMARY_NAV` from `@/lib/site-config` (Task 2); `Container` from `@/components/ui/container` (Task 3); `MagneticButton` from `@/components/ui/magnetic-button` (Task 4); `cn` from `@/lib/utils`; `Menu`, `X` icons from `lucide-react`.
- Produces: `Navbar` component (no props — reads directly from site-config). Consumed by root layout (Task 7).

Note for implementer: 21st.dev catalog component id `2307` ("Navbar 5" by shadcnblockscom — 2-column dropdown + mobile slide-in) and id `18120` ("Navbar Section 2") are close structural matches if you want a reference via `mcp__21st__get_component`; the implementation below is hand-built to the exact spec (grouped 4-column mega menu, scroll-progress bar, blur-on-scroll) rather than adapted from either, since neither matches the 4-category grouping requirement exactly.

- [ ] **Step 1: Create the component**

```tsx
// src/components/layout/navbar.tsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion, useScroll, useSpring } from "framer-motion";
import { Menu, X } from "lucide-react";
import { NAV_GROUPS, PRIMARY_NAV } from "@/lib/site-config";
import { Container } from "@/components/ui/container";
import { MagneticButton } from "@/components/ui/magnetic-button";
import { cn } from "@/lib/utils";

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [servicesOpen, setServicesOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, { stiffness: 200, damping: 30 });

  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 12);
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-colors duration-300",
        scrolled ? "border-b border-glass-border bg-background/70 backdrop-blur-xl" : "bg-transparent"
      )}
      onMouseLeave={() => setServicesOpen(false)}
    >
      <motion.div className="absolute inset-x-0 top-0 h-[2px] origin-left bg-primary" style={{ scaleX: progress }} />
      <Container>
        <nav className="flex h-20 items-center justify-between">
          <Link href="/" className="font-display text-lg font-semibold tracking-tight text-foreground">
            Alliance Street
          </Link>

          <div className="hidden items-center gap-8 lg:flex">
            <div className="relative" onMouseEnter={() => setServicesOpen(true)}>
              <button
                type="button"
                className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                aria-expanded={servicesOpen}
              >
                Services
              </button>
              <AnimatePresence>
                {servicesOpen ? (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 8 }}
                    transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                    className="absolute left-1/2 top-full mt-4 w-[720px] -translate-x-1/2 rounded-2xl border border-glass-border bg-secondary/95 p-8 shadow-2xl backdrop-blur-xl"
                  >
                    <div className="grid grid-cols-4 gap-6">
                      {NAV_GROUPS.map((group) => (
                        <div key={group.title} className="flex flex-col gap-3">
                          <span className="text-xs font-semibold uppercase tracking-widest text-primary">
                            {group.title}
                          </span>
                          <ul className="flex flex-col gap-2">
                            {group.links.map((link) => (
                              <li key={link.href}>
                                <Link href={link.href} className="text-sm text-muted-foreground transition-colors hover:text-foreground">
                                  {link.label}
                                </Link>
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                ) : null}
              </AnimatePresence>
            </div>

            {PRIMARY_NAV.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
              >
                {link.label}
              </Link>
            ))}
          </div>

          <div className="hidden lg:block">
            <MagneticButton href="/book-consultation">Book Consultation</MagneticButton>
          </div>

          <button
            type="button"
            className="text-foreground lg:hidden"
            onClick={() => setMobileOpen(true)}
            aria-label="Open menu"
          >
            <Menu size={24} />
          </button>
        </nav>
      </Container>

      <AnimatePresence>
        {mobileOpen ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-background/95 backdrop-blur-xl lg:hidden"
          >
            <Container>
              <div className="flex h-20 items-center justify-between">
                <span className="font-display text-lg font-semibold text-foreground">Alliance Street</span>
                <button type="button" className="text-foreground" onClick={() => setMobileOpen(false)} aria-label="Close menu">
                  <X size={24} />
                </button>
              </div>
              <div className="flex flex-col gap-6 py-8">
                {NAV_GROUPS.map((group) => (
                  <div key={group.title} className="flex flex-col gap-3">
                    <span className="text-xs font-semibold uppercase tracking-widest text-primary">{group.title}</span>
                    <ul className="flex flex-col gap-2">
                      {group.links.map((link) => (
                        <li key={link.href}>
                          <Link href={link.href} className="text-base text-foreground/90" onClick={() => setMobileOpen(false)}>
                            {link.label}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
                <div className="flex flex-col gap-3 border-t border-glass-border pt-6">
                  {PRIMARY_NAV.map((link) => (
                    <Link key={link.href} href={link.href} className="text-base text-foreground/90" onClick={() => setMobileOpen(false)}>
                      {link.label}
                    </Link>
                  ))}
                </div>
                <MagneticButton href="/book-consultation" onClick={() => setMobileOpen(false)}>
                  Book Consultation
                </MagneticButton>
              </div>
            </Container>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </header>
  );
}
```

- [ ] **Step 2: Verify the build**

Run: `npm run build`
Expected: Build succeeds with no TypeScript or ESLint errors.

- [ ] **Step 3: Commit**

```bash
git add src/components/layout/navbar.tsx
git commit -m "Add Navbar with grouped mega menu, scroll progress bar, and mobile drawer"
```

---

### Task 6: Footer

**Files:**
- Create: `src/components/layout/footer.tsx`

**Interfaces:**
- Consumes: `COMPANY`, `FOOTER_LINK_COLUMNS` from `@/lib/site-config` (Task 2); `Container` from `@/components/ui/container` (Task 3).
- Produces: `Footer` component (no props). Consumed by root layout (Task 7).

- [ ] **Step 1: Create the component**

```tsx
// src/components/layout/footer.tsx
import Link from "next/link";
import { COMPANY, FOOTER_LINK_COLUMNS } from "@/lib/site-config";
import { Container } from "@/components/ui/container";

export function Footer() {
  return (
    <footer className="border-t border-glass-border bg-secondary/40">
      <Container className="grid gap-12 py-16 lg:grid-cols-[1.5fr_1fr_1fr_1fr]">
        <div className="flex flex-col gap-4">
          <span className="font-display text-lg font-semibold text-foreground">{COMPANY.name}</span>
          <p className="max-w-xs text-sm text-muted-foreground">
            UAE and UK company formation, tax, accounting, and advisory — built for founders who
            don&apos;t have time to get it wrong.
          </p>
          <ul className="flex flex-col gap-1 text-sm text-muted-foreground">
            <li>{COMPANY.address}</li>
            <li>
              <a href={`mailto:${COMPANY.email}`} className="hover:text-foreground">
                {COMPANY.email}
              </a>
            </li>
            <li>
              <a href={`tel:${COMPANY.phone.replace(/\s/g, "")}`} className="hover:text-foreground">
                {COMPANY.phone}
              </a>
              <span className="ml-2 text-xs text-primary/80">(placeholder)</span>
            </li>
          </ul>
        </div>

        {FOOTER_LINK_COLUMNS.map((column) => (
          <div key={column.title} className="flex flex-col gap-3">
            <span className="text-xs font-semibold uppercase tracking-widest text-foreground">{column.title}</span>
            <ul className="flex flex-col gap-2">
              {column.links.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm text-muted-foreground hover:text-foreground">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </Container>

      <div className="border-t border-glass-border py-6">
        <Container className="flex flex-col items-center justify-between gap-4 text-xs text-muted-foreground sm:flex-row">
          <span>
            © {new Date().getFullYear()} {COMPANY.name}. All rights reserved.
          </span>
          <div className="flex gap-6">
            <Link href="/privacy-policy" className="hover:text-foreground">
              Privacy Policy
            </Link>
            <Link href="/terms-and-conditions" className="hover:text-foreground">
              Terms &amp; Conditions
            </Link>
          </div>
        </Container>
      </div>
    </footer>
  );
}
```

- [ ] **Step 2: Verify the build**

Run: `npm run build`
Expected: Build succeeds with no TypeScript or ESLint errors.

- [ ] **Step 3: Commit**

```bash
git add src/components/layout/footer.tsx
git commit -m "Add Footer with contact block and grouped link columns"
```

---

### Task 7: Root layout assembly — fonts, Lenis, LazyMotion, Navbar/Footer wiring

**Files:**
- Create: `src/components/providers/smooth-scroll-provider.tsx`
- Modify: `src/app/layout.tsx`

**Interfaces:**
- Consumes: `Navbar` (Task 5), `Footer` (Task 6), `lenis` package (already installed).
- Produces: root layout renders `<Navbar />` + `<main>{children}</main>` + `<Footer />` inside `LazyMotion` + `SmoothScrollProvider`, with `--font-geist` / `--font-inter` CSS variables now defined (resolving Task 1's forward reference).

- [ ] **Step 1: Create the smooth-scroll provider**

```tsx
// src/components/providers/smooth-scroll-provider.tsx
"use client";

import { useEffect } from "react";
import Lenis from "lenis";

export function SmoothScrollProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.1,
      easing: (t: number) => 1 - Math.pow(1 - t, 3),
    });

    function raf(time: number) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }

    const frame = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(frame);
      lenis.destroy();
    };
  }, []);

  return <>{children}</>;
}
```

- [ ] **Step 2: Replace `src/app/layout.tsx`**

```tsx
// src/app/layout.tsx
import type { Metadata } from "next";
import { Geist, Inter } from "next/font/google";
import { LazyMotion, domAnimation } from "framer-motion";
import "./globals.css";
import { SmoothScrollProvider } from "@/components/providers/smooth-scroll-provider";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";

const geist = Geist({
  variable: "--font-geist",
  subsets: ["latin"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Alliance Street Consultancy | UAE & UK Company Formation, Tax & Accounting",
  description:
    "Premium UAE and UK business setup, tax, accounting, and advisory services for founders and enterprises.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${geist.variable} ${inter.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col bg-background text-foreground">
        <LazyMotion features={domAnimation}>
          <SmoothScrollProvider>
            <Navbar />
            <main className="flex-1 pt-20">{children}</main>
            <Footer />
          </SmoothScrollProvider>
        </LazyMotion>
      </body>
    </html>
  );
}
```

- [ ] **Step 3: Verify the build**

Run: `npm run build`
Expected: Build succeeds with no TypeScript or ESLint errors.

- [ ] **Step 4: Verify rendering on the dev server**

Run: `npm run dev &` then, after a few seconds, `curl -s http://localhost:3000/ | grep -o "Alliance Street" | head -1`
Expected: Output `Alliance Street` (confirms the navbar wordmark renders). Stop the dev server afterward (`kill %1` or equivalent).

- [ ] **Step 5: Commit**

```bash
git add src/components/providers/smooth-scroll-provider.tsx src/app/layout.tsx
git commit -m "Wire Lenis smooth scroll, LazyMotion, Navbar, and Footer into root layout"
```

---

### Task 8: Homepage placeholder and `/style-guide` route

**Files:**
- Modify: `src/app/page.tsx`
- Create: `src/app/style-guide/page.tsx`

**Interfaces:**
- Consumes: `Container` (Task 3), `SectionHeading` (Task 3), `Badge` (Task 3), `MagneticButton` (Task 4).
- Produces: `/` renders a minimal dark-themed placeholder (full homepage is Phase 3 scope); `/style-guide` renders every Phase 1 primitive live as the manual QA surface called for in the spec.

- [ ] **Step 1: Replace the homepage placeholder**

```tsx
// src/app/page.tsx
import { Container } from "@/components/ui/container";
import { MagneticButton } from "@/components/ui/magnetic-button";

export default function Home() {
  return (
    <Container className="flex min-h-[60vh] flex-col items-center justify-center gap-6 text-center">
      <span className="text-sm font-medium uppercase tracking-widest text-primary">
        Alliance Street Consultancy
      </span>
      <h1 className="font-display text-4xl font-medium tracking-tight text-foreground sm:text-6xl">
        The homepage build starts in Phase 3.
      </h1>
      <p className="max-w-xl text-muted-foreground">
        Phase 1&apos;s design system is live — check the component and token reference below.
      </p>
      <MagneticButton href="/style-guide">View Style Guide</MagneticButton>
    </Container>
  );
}
```

- [ ] **Step 2: Create the style-guide route**

```tsx
// src/app/style-guide/page.tsx
import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";
import { Badge } from "@/components/ui/badge";
import { MagneticButton } from "@/components/ui/magnetic-button";

const SWATCHES = [
  { name: "Primary", className: "bg-primary" },
  { name: "Background", className: "border border-glass-border bg-background" },
  { name: "Secondary", className: "bg-secondary" },
  { name: "Muted", className: "bg-muted" },
];

export default function StyleGuidePage() {
  return (
    <Container className="flex flex-col gap-24 py-24">
      <section className="flex flex-col gap-6">
        <Badge>Design System</Badge>
        <SectionHeading
          eyebrow="Phase 1"
          title="Alliance Street Consultancy Style Guide"
          description="Tokens, typography, and foundational components for the Alliance Street rebuild."
        />
      </section>

      <section className="flex flex-col gap-6">
        <h3 className="font-display text-2xl font-medium text-foreground">Typography</h3>
        <p className="text-hero font-display font-medium text-foreground">Hero Headline</p>
        <p className="text-2xl text-foreground">Section headline text</p>
        <p className="text-base text-muted-foreground">
          Body copy set in Inter for readability across long-form service and knowledge centre content.
        </p>
      </section>

      <section className="flex flex-col gap-6">
        <h3 className="font-display text-2xl font-medium text-foreground">Colors</h3>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {SWATCHES.map((swatch) => (
            <div key={swatch.name} className="flex flex-col gap-2">
              <div className={`h-24 w-full rounded-2xl ${swatch.className}`} />
              <span className="text-sm text-muted-foreground">{swatch.name}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="flex flex-col gap-6">
        <h3 className="font-display text-2xl font-medium text-foreground">Buttons</h3>
        <div className="flex flex-wrap gap-4">
          <MagneticButton variant="primary">Primary CTA</MagneticButton>
          <MagneticButton variant="secondary">Secondary CTA</MagneticButton>
          <MagneticButton variant="ghost">Ghost CTA</MagneticButton>
        </div>
      </section>
    </Container>
  );
}
```

- [ ] **Step 3: Verify the build**

Run: `npm run build`
Expected: Build succeeds, and the build output lists both `/` and `/style-guide` as generated routes.

- [ ] **Step 4: Verify rendering on the dev server**

Run: `npm run dev &`, wait a few seconds, then:
```bash
curl -s http://localhost:3000/style-guide | grep -o "Alliance Street Consultancy Style Guide" | head -1
curl -s http://localhost:3000/ | grep -o "Phase 3" | head -1
```
Expected: First command outputs `Alliance Street Consultancy Style Guide`; second outputs `Phase 3`. Stop the dev server afterward.

- [ ] **Step 5: Commit**

```bash
git add src/app/page.tsx src/app/style-guide/page.tsx
git commit -m "Add homepage placeholder and /style-guide QA route"
```

---

## After all tasks

Start the dev server and manually check `/` and `/style-guide` in an actual browser at both mobile and desktop widths — confirm the mega menu opens on hover, the mobile drawer opens/closes, the scroll-progress bar animates, and nothing text-overflows or clips on small screens. This is the manual visual QA step the spec calls for; it can't be scripted, so it happens after the task list, not as its own task.
