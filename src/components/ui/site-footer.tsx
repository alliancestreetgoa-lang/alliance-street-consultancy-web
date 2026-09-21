"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { COMPANY } from "@/lib/site-config";
import { asset } from "@/lib/asset-path";
import { gsap, prefersReducedMotion } from "@/lib/gsap";

/**
 * Site footer, matching alliancestreet.ae.
 *
 * The live footer is the mirror of the live hero: the hero descends
 * dark-red → white into the page, the footer descends red → black out of it.
 * That inversion is the page's spine, so this is deliberately the same wall
 * upside down (`.as-wall-hero` / `.as-wall-footer`).
 *
 * Replaces the previous fixed-position "curtain reveal" footer, which had no
 * counterpart on the live site.
 *
 * NOTE: the live footer carries an "AS SEEN IN" press-logo row above the
 * columns (Forbes, Business Insider, Khaleej Times, Asia Business Outlook,
 * Benzinga). It is omitted here rather than reproduced — those are checkable
 * claims about real press coverage, and this repo has no logo assets for them.
 * Drop the files in `public/brand/press/` and add the row if the coverage
 * applies to this site too.
 */

const COLUMNS: { title: string; links: { label: string; href: string }[] }[] = [
  {
    title: "Company",
    links: [
      { label: "About us", href: "/about" },
      { label: "Case Studies", href: "/case-studies" },
      { label: "Contact", href: "/contact" },
    ],
  },
  {
    title: "Solutions",
    links: [
      { label: "All Services", href: "/services" },
      { label: "Industries", href: "/industries" },
      { label: "Pricing", href: "/pricing" },
    ],
  },
  {
    title: "Resources",
    links: [
      { label: "Privacy Policy", href: "/privacy-policy" },
      { label: "Terms & Conditions", href: "/terms-and-conditions" },
    ],
  },
];

export function SiteFooter() {
  const footerRef = useRef<HTMLElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const columnsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!footerRef.current) return;
    // Reduced motion: the heading and columns stay at their natural opacity.
    if (prefersReducedMotion()) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        [headingRef.current, columnsRef.current],
        { y: 40, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.9,
          stagger: 0.15,
          ease: "power3.out",
          scrollTrigger: {
            trigger: footerRef.current,
            start: "top 85%",
            toggleActions: "play none none reverse",
          },
        }
      );
    }, footerRef);

    // Refresh-on-navigation/load is handled centrally by SmoothScrollProvider.
    return () => ctx.revert();
  }, []);

  return (
    <footer
      ref={footerRef}
      // surface-dark so the CTA inverts to the live site's white pill and the
      // body text picks up #afafaf, which clears AA on this ground.
      className="as-wall-footer surface-dark relative overflow-hidden text-foreground"
    >
      <Container className="relative z-10 py-20 sm:py-28">
        <div className="flex flex-col gap-14 lg:flex-row lg:justify-between">
          <div className="flex max-w-md flex-col items-start gap-8">
            <Link href="/" className="flex items-center gap-2.5">
              {/* White-on-transparent mark, for the footer's red/black wall.
                  The navbar keeps logo-mark.png. */}
              <Image
                src={asset("/brand/logo-mark-white.png")}
                alt=""
                width={34}
                height={28}
                style={{ width: "34px", height: "28px" }}
              />
              <span className="text-lg font-semibold text-foreground">Alliance Street</span>
            </Link>

            <h2 ref={headingRef} className="text-5xl text-foreground">
              Ready to begin?
            </h2>

            <Button size="lg" asChild>
              <Link href="/book-consultation">Book a Consultation</Link>
            </Button>
          </div>

          <div
            ref={columnsRef}
            className="grid flex-1 grid-cols-2 gap-x-8 gap-y-10 sm:grid-cols-3 lg:max-w-2xl"
          >
            {COLUMNS.map((column) => (
              <div key={column.title} className="flex flex-col gap-4">
                <span className="as-eyebrow text-[0.6875rem]">{column.title}</span>
                <ul className="flex flex-col gap-3">
                  {column.links.map((link) => (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        className="text-sm text-muted-foreground transition-colors duration-350 hover:text-foreground"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-16 flex flex-col items-start gap-6 border-t border-border pt-8 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} {COMPANY.name}. All rights reserved.
          </p>

          <div className="flex items-center gap-6">
            <a
              href={`mailto:${COMPANY.email}`}
              className="text-sm text-muted-foreground transition-colors duration-350 hover:text-foreground"
            >
              {COMPANY.email}
            </a>
            <button
              type="button"
              onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
              aria-label="Back to top"
              className="group flex size-10 items-center justify-center rounded-full border border-border text-muted-foreground transition-colors duration-350 hover:text-foreground"
            >
              <ArrowUp
                className="size-4 transition-transform duration-300 group-hover:-translate-y-1"
                aria-hidden
              />
            </button>
          </div>
        </div>
      </Container>
    </footer>
  );
}
