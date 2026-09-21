"use client";

import { Fragment, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import { gsap, prefersReducedMotion } from "@/lib/gsap";

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
  const rootRef = useRef<HTMLDivElement>(null);
  const words = title.split(" ");

  useEffect(() => {
    if (!rootRef.current) return;
    if (prefersReducedMotion()) return;

    const ctx = gsap.context(() => {
      // Scrubbed rather than fire-and-forget: the words resolve as you scroll
      // into the section, so the heading is tied to the reader's own pace.
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: rootRef.current,
          start: "top 90%",
          end: "top 45%",
          scrub: 0.7,
          invalidateOnRefresh: true,
        },
      });

      tl.fromTo(
        ".js-heading-eyebrow",
        { opacity: 0, x: -12 },
        { opacity: 1, x: 0, duration: 0.4, ease: "power2.out" },
        0
      )
        .fromTo(
          ".js-heading-word",
          { opacity: 0, yPercent: 60, filter: "blur(8px)" },
          {
            opacity: 1,
            yPercent: 0,
            filter: "blur(0px)",
            duration: 0.6,
            stagger: 0.08,
            ease: "power3.out",
          },
          0.1
        )
        .fromTo(
          ".js-heading-description",
          { opacity: 0, y: 16 },
          { opacity: 1, y: 0, duration: 0.5, ease: "power2.out" },
          0.5
        );
    }, rootRef);

    return () => ctx.revert();
  }, []);

  const eyebrowWords = eyebrow ? eyebrow.split(" ") : [];
  const lead = eyebrowWords.slice(0, -1).join(" ");
  const tail = eyebrowWords.slice(-1).join("");

  return (
    <div
      ref={rootRef}
      className={cn(
        "flex flex-col gap-4",
        align === "center" && "items-center text-center",
        className
      )}
    >
      {eyebrow ? (
        // Two-tone, as on the live site: the lead is ink, the trailing word is
        // red ("BUSINESS SETUP SIMPLIFIED"). A single-word eyebrow is all red,
        // with no empty lead and no leading space before it.
        <span className="js-heading-eyebrow as-eyebrow">
          {lead ? <>{lead} </> : null}
          <span className="as-eyebrow-accent">{tail}</span>
        </span>
      ) : null}
      <h2 className="text-balance text-4xl font-semibold text-foreground sm:text-5xl">
        {/* Spacing is a real space text node, not a right margin on each word: a
            margin does not collapse at a line break, so it pushed every wrapped
            line of a centred heading off-centre by that amount. */}
        {words.map((word, index) => (
          <Fragment key={`${word}-${index}`}>
            {/* Two elements per word: the outer clips, the inner travels, so the
                words rise out of their own line box instead of sliding over it. */}
            <span className="inline-block overflow-hidden pb-[0.08em] align-bottom">
              <span className="js-heading-word inline-block">{word}</span>
            </span>{" "}
          </Fragment>
        ))}
      </h2>
      {description ? (
        <p className="js-heading-description max-w-2xl text-lg text-muted-foreground">
          {description}
        </p>
      ) : null}
    </div>
  );
}
