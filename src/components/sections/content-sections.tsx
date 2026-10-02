import Image from "next/image";
import { ArrowUpRight, ChevronDownIcon } from "lucide-react";

import { AmbientGlow } from "@/components/ui/ambient-glow";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Container } from "@/components/ui/container";
import { DefinitionList } from "@/components/ui/definition-list";
import { FramedImage } from "@/components/ui/framed-image";
import { RichText } from "@/components/ui/rich-text";
import { Reveal, Stagger, StaggerItem } from "@/components/ui/scroll-reveal";
import { SectionHeading } from "@/components/ui/section-heading";
import { SmartLink } from "@/components/ui/smart-link";
import { asset } from "@/lib/asset-path";
import type { SectionOf } from "@/lib/content/page-schema";
import { fill } from "@/lib/content/fill";
import { OBJECT_POSITION } from "@/lib/image-position";
import { buildFaqJsonLd, jsonLdScriptProps } from "@/lib/schema";
import { cn } from "@/lib/utils";

/*
 * Content-only sections. Markup and classes are carried over unchanged from the
 * bespoke components these replace (why-alliance-street, process,
 * about-expertise, industries-grid, pricing-factors, home-faq, case-study-grid,
 * book-consultation-cta, about-leadership, about-story, legal-content), so the
 * published pages render as before — the difference is that every string now
 * comes from the CMS.
 */

/** "Why Alliance Street" (2 columns) and the industries grid (3 columns). */
export function FeatureList({ section }: { section: SectionOf<"featureList"> }) {
  const threeCol = section.columns === "3";
  return (
    <section className={cn("relative py-24 sm:py-32", threeCol && "overflow-hidden")}>
      {threeCol ? <AmbientGlow className="opacity-30" /> : null}
      <Container className={cn("relative z-10", section.heading && "flex flex-col gap-16")}>
        {section.heading ? (
          <SectionHeading eyebrow={section.eyebrow || undefined} title={section.heading} align="center" className="mx-auto" />
        ) : null}
        <Stagger
          className={
            threeCol
              ? "grid gap-x-16 gap-y-10 sm:grid-cols-2 lg:grid-cols-3"
              : "mx-auto grid w-full max-w-5xl gap-x-16 gap-y-10 sm:grid-cols-2"
          }
        >
          {section.items.map((item) => (
            <StaggerItem key={item.title}>
              <DefinitionList items={[item]} />
            </StaggerItem>
          ))}
        </Stagger>
      </Container>
    </section>
  );
}

/** Numbered steps (home "Process") and numbered areas (about "Where We Help"). */
export function NumberedList({ section }: { section: SectionOf<"numberedList"> }) {
  const steps = section.style === "steps";
  return (
    <section className={cn("relative py-24 sm:py-32", !steps && "overflow-hidden")}>
      <AmbientGlow className="opacity-30" />
      <Container className="relative z-10 flex flex-col gap-16">
        <SectionHeading eyebrow={section.eyebrow || undefined} title={section.heading} align="center" className="mx-auto" />
        <Stagger className={steps ? "grid gap-10 sm:grid-cols-2 lg:grid-cols-4" : "grid gap-8 sm:grid-cols-2 lg:grid-cols-4"}>
          {section.items.map((item, index) => (
            <StaggerItem key={item.title} className={steps ? "flex flex-col gap-4 border-t border-border pt-6" : "flex flex-col gap-4"}>
              <span className="font-mono text-2xl text-primary">{String(index + 1).padStart(2, "0")}</span>
              <h3 className={steps ? "text-xl font-semibold" : "text-lg font-semibold text-foreground"}>{item.title}</h3>
              <p className={steps ? "text-base text-muted-foreground" : "text-sm text-muted-foreground"}>{item.description}</p>
            </StaggerItem>
          ))}
        </Stagger>
      </Container>
    </section>
  );
}

export function Faq({ section }: { section: SectionOf<"faq"> }) {
  return (
    <section className="relative overflow-hidden py-24 sm:py-32">
      {section.structuredData ? <script {...jsonLdScriptProps(buildFaqJsonLd(section.items))} /> : null}
      <AmbientGlow className="opacity-30" />
      <Container className="relative z-10 mx-auto flex max-w-3xl flex-col gap-16">
        <SectionHeading eyebrow={section.eyebrow || undefined} title={section.heading} align="center" className="mx-auto" />
        {/* Native <details>: answers stay in the server-rendered HTML for
            crawlers that do not run JavaScript, and work with no JS at all. */}
        <Stagger className="w-full">
          {section.items.map((faq) => (
            <StaggerItem key={faq.question}>
              <details className="group not-last:border-b border-border">
                <summary className="flex cursor-pointer list-none items-start justify-between gap-4 py-2.5 text-left text-lg text-foreground outline-none [&::-webkit-details-marker]:hidden focus-visible:ring-3 focus-visible:ring-ring/50 hover:underline">
                  <h3 className="text-lg font-semibold">{faq.question}</h3>
                  <ChevronDownIcon
                    aria-hidden="true"
                    className="mt-1 size-4 shrink-0 text-muted-foreground transition-transform duration-200 group-open:rotate-180 motion-reduce:transition-none"
                  />
                </summary>
                <div className="pb-2.5 text-sm text-muted-foreground">{faq.answer}</div>
              </details>
            </StaggerItem>
          ))}
        </Stagger>
      </Container>
    </section>
  );
}

export function Cta({ section }: { section: SectionOf<"cta"> }) {
  return (
    <section className="py-24 sm:py-32">
      <Container>
        <Reveal
          scale
          className="as-neon-card relative flex flex-col items-center gap-8 overflow-hidden rounded-3xl border border-border bg-card px-8 py-16 text-center shadow-card"
        >
          <AmbientGlow className="opacity-40" />
          <SectionHeading
            eyebrow={section.eyebrow || undefined}
            title={section.heading}
            description={section.description || undefined}
            align="center"
            className="relative z-10"
          />
          <Button size="lg" className="relative z-10" asChild>
            <SmartLink href={section.button.href}>{section.button.label}</SmartLink>
          </Button>
        </Reveal>
      </Container>
    </section>
  );
}

export function Pricing({ section }: { section: SectionOf<"pricing"> }) {
  return (
    <section className="relative overflow-hidden py-24 sm:py-32">
      <AmbientGlow className="opacity-30" />
      <Container className="relative z-10 flex flex-col gap-16">
        <SectionHeading eyebrow={section.eyebrow || undefined} title={section.heading} align="center" className="mx-auto" />
        <Stagger className="mx-auto grid w-full max-w-5xl gap-x-16 gap-y-10 sm:grid-cols-2">
          {section.items.map((factor) => (
            <StaggerItem key={factor.title}>
              <DefinitionList items={[factor]} />
            </StaggerItem>
          ))}
        </Stagger>
        {section.note ? (
          <Reveal>
            <p className="mx-auto max-w-2xl text-center text-muted-foreground">{section.note}</p>
          </Reveal>
        ) : null}
      </Container>
    </section>
  );
}

export function CaseStudies({ section }: { section: SectionOf<"caseStudies"> }) {
  const label = "text-xs font-semibold uppercase tracking-widest text-muted-foreground";
  return (
    <section className="relative overflow-hidden py-24 sm:py-32">
      <AmbientGlow className="opacity-30" />
      <Container className="relative z-10 flex flex-col gap-16">
        <SectionHeading eyebrow={section.eyebrow || undefined} title={section.heading} align="center" className="mx-auto" />
        <Stagger className="grid gap-8 lg:grid-cols-2">
          {section.items.map((study) => (
            <StaggerItem key={study.title}>
              <Card variant="glass" className="flex flex-col gap-6">
                <div className="flex flex-col gap-2">
                  <span className="text-xs font-semibold uppercase tracking-widest text-primary">{study.category}</span>
                  <h3 className="text-xl font-semibold text-foreground">{study.title}</h3>
                </div>
                <dl className="flex flex-col gap-4">
                  <div><dt className={label}>Challenge</dt><dd className="mt-1 text-sm text-foreground/90">{study.challenge}</dd></div>
                  <div><dt className={label}>Our Approach</dt><dd className="mt-1 text-sm text-foreground/90">{study.approach}</dd></div>
                  <div><dt className={label}>Outcome</dt><dd className="mt-1 text-sm text-foreground/90">{study.outcome}</dd></div>
                </dl>
              </Card>
            </StaggerItem>
          ))}
        </Stagger>
      </Container>
    </section>
  );
}

const PROFILE_ICONS: Record<string, React.ReactNode> = {
  LinkedIn: <svg viewBox="0 0 24 24" fill="currentColor" className="size-5" aria-hidden="true"><path d="M20.45 2H3.55C2.69 2 2 2.68 2 3.52v16.96c0 .84.69 1.52 1.55 1.52h16.9c.86 0 1.55-.68 1.55-1.52V3.52c0-.84-.69-1.52-1.55-1.52ZM7.93 18.75H4.98V9.2h2.95v9.55ZM6.45 7.9a1.71 1.71 0 1 1 0-3.42 1.71 1.71 0 0 1 0 3.42Zm12.3 10.85H15.8V14.1c0-1.11-.02-2.54-1.55-2.54-1.55 0-1.79 1.21-1.79 2.46v4.73H9.51V9.2h2.83v1.3h.04c.4-.76 1.36-1.56 2.79-1.56 2.98 0 3.58 1.96 3.58 4.5v5.31Z" /></svg>,
  Instagram: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="size-5" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="5" /><circle cx="12" cy="12" r="4" /><circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" /></svg>,
  YouTube: <svg viewBox="0 0 24 24" fill="currentColor" className="size-5" aria-hidden="true"><path fillRule="evenodd" d="M21.58 7.19a2.77 2.77 0 0 0-1.95-1.96C17.9 4.77 12 4.77 12 4.77s-5.9 0-7.63.46a2.77 2.77 0 0 0-1.95 1.96A28.8 28.8 0 0 0 2 12a28.8 28.8 0 0 0 .42 4.81 2.77 2.77 0 0 0 1.95 1.96c1.73.46 7.63.46 7.63.46s5.9 0 7.63-.46a2.77 2.77 0 0 0 1.95-1.96A28.8 28.8 0 0 0 22 12a28.8 28.8 0 0 0-.42-4.81ZM10 15.25l5.5-3.25L10 8.75v6.5Z" clipRule="evenodd" /></svg>,
  X: <svg viewBox="0 0 24 24" fill="currentColor" className="size-5" aria-hidden="true"><path d="M17.75 3h3.07l-6.7 7.66L22 21h-6.17l-4.83-6.32L5.47 21H2.4l7.17-8.2L2 3h6.33l4.37 5.77L17.75 3Zm-1.08 16.17h1.7L7.4 4.74H5.58l11.09 14.43Z" /></svg>,
  Facebook: <svg viewBox="0 0 24 24" fill="currentColor" className="size-5" aria-hidden="true"><path d="M22 12a10 10 0 1 0-11.56 9.88v-6.99H7.9V12h2.54V9.8c0-2.5 1.49-3.89 3.78-3.89 1.09 0 2.24.2 2.24.2v2.46h-1.26c-1.24 0-1.63.77-1.63 1.56V12h2.78l-.44 2.89h-2.34v6.99A10 10 0 0 0 22 12Z" /></svg>,
  Website: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="size-5" aria-hidden="true"><circle cx="12" cy="12" r="9" /><path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18" /></svg>,
};

export function Leadership({ section }: { section: SectionOf<"leadership"> }) {
  return (
    <section aria-labelledby="leadership-title" className="bg-secondary/40 py-20 sm:py-28">
      <Container>
        <div className="grid items-center gap-10 lg:grid-cols-[.85fr_1.15fr] lg:gap-20">
          <Reveal className="mx-auto w-full max-w-md">
            <div className="as-neon-card overflow-hidden rounded-2xl bg-white">
              <Image
                src={asset(section.photo.src)}
                alt={section.photo.alt}
                width={635}
                height={781}
                sizes="(min-width: 1024px) 448px, (min-width: 640px) 448px, 90vw"
                className={cn("h-auto w-full object-contain", OBJECT_POSITION[section.photo.position])}
              />
            </div>
          </Reveal>
          <Reveal className="flex flex-col items-start gap-6">
            {section.eyebrowLead || section.eyebrowAccent ? (
              <span className="as-eyebrow">
                {section.eyebrowLead} <span className="as-eyebrow-accent">{section.eyebrowAccent}</span>
              </span>
            ) : null}
            <div className="flex flex-col gap-3">
              <h2 id="leadership-title" className="text-4xl font-semibold tracking-tight sm:text-5xl">{section.name}</h2>
              <p className="text-lg font-medium text-primary">
                {section.role}
                {section.organisation ? ` · ${section.organisation}` : ""}
              </p>
            </div>
            <div className="space-y-4 text-base leading-relaxed text-muted-foreground">
              {section.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
            </div>
            <div className="mt-2 flex flex-wrap items-center gap-4">
              <Button asChild>
                <SmartLink href={section.conversationButton.href}>{section.conversationButton.label} <ArrowUpRight aria-hidden /></SmartLink>
              </Button>
              {section.profileButton?.label ? (
                <Button variant="outline" asChild>
                  <SmartLink href={section.profileButton.href}>{section.profileButton.label} <ArrowUpRight aria-hidden /></SmartLink>
                </Button>
              ) : null}
              {section.profileLinks.map(({ platform, url }) => (
                <Button key={url} variant="outline" size="icon" className="size-11" asChild>
                  <a href={url} target="_blank" rel="noopener noreferrer" aria-label={`${platform} (opens in a new tab)`} title={platform}>
                    {PROFILE_ICONS[platform]}
                  </a>
                </Button>
              ))}
            </div>
          </Reveal>
        </div>
      </Container>
    </section>
  );
}

export function Story({ section }: { section: SectionOf<"story"> }) {
  return (
    <section className="py-24 sm:py-32">
      <Container className="max-w-4xl">
        <Reveal className="flex flex-col gap-6">
          {section.eyebrowLead || section.eyebrowAccent ? (
            <span className="as-eyebrow">
              {section.eyebrowLead} <span className="as-eyebrow-accent">{section.eyebrowAccent}</span>
            </span>
          ) : null}
          <p className="text-2xl font-semibold leading-snug text-foreground">{section.lead}</p>
          {section.paragraphs.map((paragraph) => <p key={paragraph} className="text-muted-foreground">{paragraph}</p>)}
          {section.principles.length ? (
            <Card variant="glass" hover={false} className="mt-2 flex flex-col gap-8">
              {section.principles.map((principle) => (
                <div key={principle.title} className="flex flex-col gap-2">
                  <h3 className="text-lg font-semibold text-foreground">{principle.title}</h3>
                  <p className="text-sm text-muted-foreground">{principle.description}</p>
                </div>
              ))}
            </Card>
          ) : null}
        </Reveal>
      </Container>
    </section>
  );
}

export function Legal({ section }: { section: SectionOf<"legal"> }) {
  const date = new Date(`${section.lastUpdated}T00:00:00Z`).toLocaleDateString("en-GB", {
    day: "numeric", month: "long", year: "numeric", timeZone: "UTC",
  });
  return (
    <section className="py-24 sm:py-32">
      <Container className="mx-auto flex max-w-3xl flex-col gap-12">
        <Reveal className="rounded-xl border border-border bg-card px-6 py-4 text-sm text-muted-foreground">
          Last updated <time dateTime={section.lastUpdated}>{date}</time>.{section.notice ? ` ${section.notice}` : ""}
        </Reveal>
        <Stagger className="flex flex-col gap-12">
          {section.items.map((item) => (
            <StaggerItem key={item.heading} className="flex flex-col gap-3">
              <h2 className="text-xl font-semibold text-foreground">{item.heading}</h2>
              <RichText text={item.body} paragraphClassName="text-muted-foreground" />
            </StaggerItem>
          ))}
        </Stagger>
      </Container>
    </section>
  );
}

/** New: a heading, formatted text and an image side by side. */
export function TextImage({ section }: { section: SectionOf<"textImage"> }) {
  const figure = (
    <Reveal delay={section.imageSide === "left" ? 0 : 0.1}>
      <FramedImage src={section.image.src} alt={section.image.alt} position={section.image.position} aspectClassName="aspect-[4/3]" sizes="(min-width: 1024px) 560px, 100vw" />
    </Reveal>
  );
  const copy = (
    <Reveal delay={section.imageSide === "left" ? 0.1 : 0} className="flex flex-col items-start gap-5">
      {section.eyebrow ? <span className="as-eyebrow as-eyebrow-accent">{section.eyebrow}</span> : null}
      <h2 className="text-balance text-3xl font-semibold text-foreground sm:text-4xl">{section.heading}</h2>
      <RichText text={section.body} paragraphClassName="text-base text-muted-foreground" />
      {section.button?.label ? (
        <Button asChild className="mt-2"><SmartLink href={section.button.href}>{section.button.label}</SmartLink></Button>
      ) : null}
    </Reveal>
  );
  return (
    <section className="py-24 sm:py-32">
      <Container className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
        {section.imageSide === "left" ? <>{figure}{copy}</> : <>{copy}{figure}</>}
      </Container>
    </section>
  );
}

/** New: free-form formatted text. */
export function RichTextSection({ section }: { section: SectionOf<"richText"> }) {
  return (
    <section className="py-24 sm:py-32">
      <Container className={section.width === "narrow" ? "max-w-3xl" : "max-w-5xl"}>
        <Reveal className="flex flex-col gap-6">
          {section.eyebrow ? <span className="as-eyebrow as-eyebrow-accent">{section.eyebrow}</span> : null}
          {section.heading ? <h2 className="text-balance text-3xl font-semibold text-foreground sm:text-4xl">{section.heading}</h2> : null}
          <RichText text={section.body} paragraphClassName="text-base leading-relaxed text-muted-foreground" />
        </Reveal>
      </Container>
    </section>
  );
}

/** New: a grid of cards, each optionally with an image and a link. */
export function Cards({ section }: { section: SectionOf<"cards"> }) {
  return (
    <section className="relative py-24 sm:py-32">
      <Container className="flex flex-col gap-14">
        <SectionHeading eyebrow={section.eyebrow || undefined} title={section.heading} description={section.intro || undefined} align="center" className="mx-auto" />
        <Stagger className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {section.items.map((card) => (
            <StaggerItem key={card.title} className="flex">
              <Card variant="glass" className="flex w-full flex-col gap-4">
                {card.image?.src ? (
                  <div className="relative -mx-2 -mt-2 aspect-[16/10] overflow-hidden rounded-xl">
                    <Image src={asset(card.image.src)} alt={card.image.alt} fill sizes="(min-width: 1024px) 380px, (min-width: 640px) 50vw, 100vw" className={cn("object-cover", OBJECT_POSITION[card.image.position])} />
                  </div>
                ) : null}
                <h3 className="text-xl font-semibold text-foreground">{card.title}</h3>
                <p className="flex-1 text-sm text-muted-foreground">{fill(card.description)}</p>
                {card.link?.label ? (
                  <SmartLink href={card.link.href} className="group inline-flex items-center gap-1.5 text-sm font-semibold text-primary">
                    {card.link.label}
                    <ArrowUpRight aria-hidden className="size-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                  </SmartLink>
                ) : null}
              </Card>
            </StaggerItem>
          ))}
        </Stagger>
      </Container>
    </section>
  );
}

const SHAPES = { wide: "aspect-[21/9]", landscape: "aspect-video", square: "aspect-square max-w-xl mx-auto" } as const;

/** New: a single framed image with an optional caption. */
export function ImageSection({ section }: { section: SectionOf<"image"> }) {
  return (
    <section className="py-12 sm:py-16">
      <Container>
        <Reveal>
          <FramedImage
            src={section.image.src}
            alt={section.image.alt}
            position={section.image.position}
            caption={section.caption || undefined}
            aspectClassName={SHAPES[section.shape]}
            sizes="(min-width: 1280px) 1152px, 100vw"
          />
        </Reveal>
      </Container>
    </section>
  );
}

export function ServicesOverviewHeader({ section }: { section: SectionOf<"servicesOverview"> }) {
  return (
    <div className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-end">
      <SectionHeading eyebrow={section.eyebrow || undefined} title={section.heading} />
      {section.button?.label ? (
        <Button variant="ghost" size="lg" asChild><SmartLink href={section.button.href}>{section.button.label}</SmartLink></Button>
      ) : null}
    </div>
  );
}

/** Booking pages: intro copy above the two-step consultation form. */
export function ConsultationFormSection({ section, children }: { section: SectionOf<"consultationForm">; children: React.ReactNode }) {
  return (
    <section className="relative overflow-hidden">
      <AmbientGlow className="opacity-40" />
      <Container className="relative z-10 flex max-w-4xl flex-col items-center gap-10 py-16 sm:py-24">
        <Reveal className="flex flex-col items-center gap-5 text-center">
          <Badge>{section.badge}</Badge>
          <h1 className="text-balance text-4xl font-semibold sm:text-5xl">{section.heading}</h1>
          <p className="max-w-xl text-muted-foreground">{section.intro}</p>
          {section.requiredNote ? <p className="text-sm text-muted-foreground">{section.requiredNote}</p> : null}
        </Reveal>
        {children}
      </Container>
    </section>
  );
}
