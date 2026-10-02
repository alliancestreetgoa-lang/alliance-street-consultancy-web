"use client";

import { useEffect, useRef } from "react";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SmartLink } from "@/components/ui/smart-link";
import { Container } from "@/components/ui/container";
import { DisplayHeading } from "@/components/ui/display-heading";
import { asset } from "@/lib/asset-path";
import { gsap } from "@/lib/gsap";
import { MOTION_QUERY, settle } from "@/lib/motion";
import type { SectionOf } from "@/lib/content/page-schema";
import { THEME } from "@/lib/theme";


/**
 * Home hero, built on the live site's structure: a dark-red → white gradient
 * wall with a floating card sitting on it, left-aligned copy, red corner
 * brackets and a red rule closing the card's base.
 *
 * The one departure from alliancestreet.ae is the card's backdrop — the live
 * card is plain white, this one holds the Dubai skyline video. The washes over
 * the video reproduce the live card's black-on-light contrast so the type
 * reads the same way.
 */
export function Hero({ section }: { section: SectionOf<"homeHero"> }) {
  const sectionRef = useRef<HTMLElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const copyRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    const section = sectionRef.current;
    if (!video || !section) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    let visible = false;
    const sync = () => {
      if (visible && !document.hidden && !reduced.matches && THEME.motion !== "off") void video.play().catch(() => {});
      else video.pause();
    };
    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      sync();
    });
    observer.observe(section);
    document.addEventListener("visibilitychange", sync);
    reduced.addEventListener("change", sync);
    return () => {
      observer.disconnect();
      document.removeEventListener("visibilitychange", sync);
      reduced.removeEventListener("change", sync);
      video.pause();
    };
  }, []);

  useEffect(() => {
    if (!sectionRef.current) return;
    const mm = gsap.matchMedia();
    mm.add(MOTION_QUERY, () => {
      gsap.fromTo(cardRef.current, { y: 16 }, { y: 0, duration: 0.9, ease: settle, clearProps: "transform" });
    });
    return () => mm.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="as-wall-hero relative isolate flex min-h-[100dvh] flex-col justify-center overflow-hidden pt-8 pb-16 sm:pt-16 sm:pb-24 lg:pt-28 lg:pb-28 lg:[@media(max-height:820px)]:pt-10 [@media(max-height:500px)]:pt-6 [@media(max-height:500px)]:pb-10"
    >
      <Container className="px-4 sm:px-6">
        <div className="relative">
        <div ref={cardRef} className="relative mx-auto w-full max-w-5xl">
          {/* Outside the card frame: it clips to its own radius, which would
              round the brackets' right angles away. */}
          <span className="as-bracket" data-corner="top-left" aria-hidden />
          <span className="as-bracket" data-corner="bottom-right" aria-hidden />
          <div className="as-card-frame">
          {/* Dubai skyline video, held inside the card rather than behind the
              page. The washes keep it subordinate to the type. */}
          {/* z-0, not -z-10: the card frame is no longer the element carrying
              will-change, so it is not a stacking context, and a negative
              z-index would paint the video behind the card's own fill. */}
          <div aria-hidden className="absolute inset-0 z-0">
            {section.video ? (
              <video
                ref={videoRef}
                muted
                loop
                playsInline
                preload="metadata"
                poster={asset(section.poster)}
                className="absolute inset-0 h-full w-full object-cover object-[center_40%]"
              >
                <source src={asset(section.video)} type={section.video.endsWith(".webm") ? "video/webm" : "video/mp4"} />
              </video>
            ) : (
              // eslint-disable-next-line @next/next/no-img-element -- decorative poster, same treatment as the video
              <img src={asset(section.poster)} alt="" className="absolute inset-0 h-full w-full object-cover object-[center_40%]" />
            )}
            <div className="absolute inset-0 bg-background/15" />
            {/* Denser bed under the copy column so the headline never fights the skyline. */}
            <div className="absolute inset-0 bg-[linear-gradient(100deg,color-mix(in_oklch,var(--background)_88%,transparent)_0%,color-mix(in_oklch,var(--background)_62%,transparent)_46%,color-mix(in_oklch,var(--background)_0%,transparent)_100%)]" />
          </div>

          <div
            ref={copyRef}
            className="relative z-10 flex flex-col items-start gap-5 px-5 py-10 sm:gap-6 sm:px-12 sm:py-20 lg:[@media(max-height:820px)]:py-12 [@media(max-height:500px)]:py-8"
          >
            <span className="inline-flex items-center gap-2 rounded-full bg-secondary px-3 py-1.5 text-xs text-foreground sm:gap-3 sm:px-4 sm:py-2 sm:text-sm">
              {section.badge}
              {section.badgeLink?.label ? (
                <SmartLink href={section.badgeLink.href} className="font-semibold underline underline-offset-4">
                  {section.badgeLink.label}
                </SmartLink>
              ) : null}
            </span>

            <DisplayHeading
              text={section.heading}
              className="max-w-3xl text-left text-hero lg:[@media(max-height:820px)]:text-[3.5rem] [@media(max-height:500px)]:text-4xl"
            />

            <p className="max-w-xl text-sm text-foreground/75 sm:text-base">
              {section.body}
            </p>

            <div className="flex flex-wrap items-center gap-x-6 gap-y-4">
              <Button size="lg" asChild>
                <SmartLink href={section.primaryButton.href}>{section.primaryButton.label}</SmartLink>
              </Button>
              {section.secondaryButton?.label ? (
                <SmartLink
                  href={section.secondaryButton.href}
                  className="group inline-flex items-center gap-2 text-base font-semibold text-foreground"
                >
                  {section.secondaryButton.label}
                  <ArrowRight className="size-4 transition-transform duration-350 group-hover:translate-x-1" />
                </SmartLink>
              ) : null}
            </div>
          </div>
          </div>
        </div>
        </div>
      </Container>
    </section>
  );
}
