"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { COMPANY, FOOTER } from "@/lib/site-config";
import { SmartLink } from "@/components/ui/smart-link";
import { fill } from "@/lib/content/fill";
import { asset } from "@/lib/asset-path";
import { gsap } from "@/lib/gsap";
import { MOTION, MOTION_QUERY, settle } from "@/lib/motion";

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

const SOCIAL_ICONS = {
  LinkedIn: (<svg viewBox="0 0 24 24" fill="currentColor" className="size-5" aria-hidden="true"><path d="M20.45 2H3.55C2.69 2 2 2.68 2 3.52v16.96c0 .84.69 1.52 1.55 1.52h16.9c.86 0 1.55-.68 1.55-1.52V3.52c0-.84-.69-1.52-1.55-1.52ZM7.93 18.75H4.98V9.2h2.95v9.55ZM6.45 7.9a1.71 1.71 0 1 1 0-3.42 1.71 1.71 0 0 1 0 3.42Zm12.3 10.85H15.8V14.1c0-1.11-.02-2.54-1.55-2.54-1.55 0-1.79 1.21-1.79 2.46v4.73H9.51V9.2h2.83v1.3h.04c.4-.76 1.36-1.56 2.79-1.56 2.98 0 3.58 1.96 3.58 4.5v5.31Z" /></svg>),
  Instagram: (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="size-5" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="5" /><circle cx="12" cy="12" r="4" /><circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" /></svg>),
  YouTube: (<svg viewBox="0 0 24 24" fill="currentColor" className="size-5" aria-hidden="true"><path fillRule="evenodd" d="M21.58 7.19a2.77 2.77 0 0 0-1.95-1.96C17.9 4.77 12 4.77 12 4.77s-5.9 0-7.63.46a2.77 2.77 0 0 0-1.95 1.96A28.8 28.8 0 0 0 2 12a28.8 28.8 0 0 0 .42 4.81 2.77 2.77 0 0 0 1.95 1.96c1.73.46 7.63.46 7.63.46s5.9 0 7.63-.46a2.77 2.77 0 0 0 1.95-1.96A28.8 28.8 0 0 0 22 12a28.8 28.8 0 0 0-.42-4.81ZM10 15.25l5.5-3.25L10 8.75v6.5Z" clipRule="evenodd" /></svg>)
};

export function SiteFooter() {
  const footerRef = useRef<HTMLElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const columnsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!footerRef.current) return;
    const mm = gsap.matchMedia();
    mm.add(MOTION_QUERY, () => {
      gsap.fromTo(
        [headingRef.current, columnsRef.current],
        { y: 18, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: MOTION.reveal,
          stagger: 0.08,
          ease: settle,
          clearProps: "opacity,transform",
          scrollTrigger: {
            trigger: footerRef.current,
            start: "top 85%",
            once: true,
          },
        }
      );
    }, footerRef);

    // Refresh-on-navigation/load is handled centrally by SmoothScrollProvider.
    return () => mm.revert();
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
                src={asset(FOOTER.logo)}
                alt=""
                width={34}
                height={28}
                style={{ width: "34px", height: "28px" }}
              />
              <span className="text-lg font-semibold text-foreground">{FOOTER.brandName}</span>
            </Link>

            <h2 ref={headingRef} className="text-5xl text-foreground">
              {FOOTER.heading}
            </h2>

            <Button size="lg" asChild>
              <SmartLink href={FOOTER.button.href}>{FOOTER.button.label}</SmartLink>
            </Button>
          </div>

          <div
            ref={columnsRef}
            className="grid flex-1 grid-cols-2 gap-x-8 gap-y-10 sm:grid-cols-3 lg:max-w-2xl"
          >
            {FOOTER.columns.map((column) => (
              <div key={column.title} className="flex flex-col gap-4">
                <span className="as-eyebrow text-[0.6875rem]">{column.title}</span>
                <ul className="flex flex-col gap-3">
                  {column.links.map((link) => (
                    <li key={link.href}>
                      <SmartLink
                        href={link.href}
                        className="text-sm text-muted-foreground transition-colors duration-350 hover:text-foreground"
                      >
                        {link.label}
                      </SmartLink>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-16 flex flex-col items-start gap-6 border-t border-border pt-8 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-muted-foreground">
            {fill(FOOTER.copyright)}
          </p>

          <div className="flex flex-wrap items-center gap-x-5 gap-y-3">
            <a
              href={`mailto:${COMPANY.email}`}
              className="text-sm text-muted-foreground transition-colors duration-350 hover:text-foreground"
            >
              {COMPANY.email}
            </a>
            <nav aria-label="Company social profiles" className="flex items-center gap-2">
              {COMPANY.socialLinks.map(({ platform, url }) => (
                <a
                  key={platform}
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`Alliance Street on ${platform} (opens in a new tab)`}
                  title={platform}
                  className="flex size-11 items-center justify-center rounded-full border border-white/20 text-white/80 transition-[color,border-color,box-shadow] duration-300 hover:border-red-500 hover:text-white hover:shadow-[0_0_14px_rgba(255,25,45,0.4)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-red-500 motion-reduce:transition-none"
                >
                  {SOCIAL_ICONS[platform]}
                </a>
              ))}
            </nav>
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
