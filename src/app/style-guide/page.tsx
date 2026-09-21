import type { Metadata } from "next";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";

// Internal design-system reference page — not public marketing content.
// Excluded from the sitemap (src/app/sitemap.ts) and explicitly noindexed
// here as a belt-and-suspenders measure alongside the robots.txt disallow
// rule (src/app/robots.ts).
export const metadata: Metadata = {
  // Bare title — the root layout's `title.template` appends the brand.
  title: "Style Guide (Internal)",
  robots: {
    index: false,
    follow: false,
  },
};

const SWATCHES = [
  { name: "Primary #e22e34", className: "bg-primary" },
  { name: "Foreground #000", className: "bg-foreground" },
  { name: "Card #fafafa", className: "border border-border bg-card" },
  { name: "Border #e9e9e9", className: "bg-border" },
];

const SCALE = [
  { label: "h1 · 70px", className: "text-6xl" },
  { label: "h2 · 50px", className: "text-5xl" },
  { label: "h3 · 38px", className: "text-4xl" },
  { label: "h4 · 26px", className: "text-2xl" },
  { label: "h5 · 20px", className: "text-xl" },
];

export default function StyleGuidePage() {
  return (
    <Container className="flex flex-col gap-24 py-32">
      <section className="flex flex-col gap-6">
        <SectionHeading
          eyebrow="Design System"
          title="Alliance Street Style Guide"
          description="Ported from the live site at alliancestreet.ae. Values are taken from its published stylesheet rather than eyeballed."
        />
      </section>

      <section className="flex flex-col gap-6">
        <h3 className="text-2xl font-semibold text-foreground">Tracking</h3>
        <p className="max-w-2xl text-base text-muted-foreground">
          The live site&apos;s most identifying typographic trait: every size, headings and body
          alike, is tracked at <code className="font-mono text-foreground">-0.04em</code>. h1 is
          -2.8px at 70px, h2 -2px at 50px, h3 -1.5px at 38px, body -0.64px at 16px — all the same
          ratio. It is set once on <code className="font-mono text-foreground">html</code>.
        </p>
      </section>

      <section className="flex flex-col gap-6">
        <h3 className="text-2xl font-semibold text-foreground">Type scale</h3>
        <div className="flex flex-col gap-4">
          {SCALE.map((step) => (
            <div key={step.label} className="flex flex-col gap-1">
              <span className="as-eyebrow text-[0.6875rem]">{step.label}</span>
              <p className={`${step.className} font-semibold text-foreground`}>
                Company formation
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="flex flex-col gap-6">
        <h3 className="text-2xl font-semibold text-foreground">Eyebrow</h3>
        <p className="as-eyebrow">
          Business setup <span className="as-eyebrow-accent">simplified</span>
        </p>
        <p className="max-w-2xl text-base text-muted-foreground">
          Space Mono, uppercase, tracked +0.12em, split across a black lead and a red tail.
        </p>
      </section>

      <section className="flex flex-col gap-6">
        <h3 className="text-2xl font-semibold text-foreground">Colours</h3>
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
        <h3 className="text-2xl font-semibold text-foreground">Stat</h3>
        <div className="flex flex-wrap gap-16">
          <div className="flex flex-col gap-2">
            <span className="as-stat">
              200<span className="as-stat-suffix">+</span>
            </span>
            <span className="text-sm text-muted-foreground">Business structures built</span>
          </div>
          <div className="flex flex-col gap-2">
            <span className="as-stat">
              20<span className="as-stat-suffix">+</span>
            </span>
            <span className="text-sm text-muted-foreground">Tax lawyers &amp; strategists</span>
          </div>
        </div>
      </section>

      <section className="flex flex-col gap-6">
        <h3 className="text-2xl font-semibold text-foreground">Buttons</h3>
        <p className="max-w-2xl text-base text-muted-foreground">
          The live site never puts red on a button. The default CTA is the surface&apos;s own ink,
          so the same variant is a black pill on white and a white pill on black — red stays an
          accent.
        </p>
        <div className="flex flex-wrap items-center gap-4">
          <Button size="lg">Book a Consultation</Button>
          <Button size="lg" variant="outline">
            View Services
          </Button>
          <Button size="lg" variant="ghost">
            Learn more
          </Button>
        </div>
        <div className="surface-dark flex flex-wrap items-center gap-4 rounded-2xl bg-background p-8">
          <Button size="lg">Book a Consultation</Button>
          <Button size="lg" variant="outline">
            View Services
          </Button>
        </div>
      </section>

      <section className="flex flex-col gap-6">
        <h3 className="text-2xl font-semibold text-foreground">Bracket &amp; wedge</h3>
        {/* No overflow-hidden: the brackets sit proud of the frame by design,
            so a clipping parent removes them entirely. */}
        <div className="relative mx-3 my-3 h-56 rounded-2xl border border-border bg-card">
          <span className="as-bracket" data-corner="top-left" aria-hidden />
          <span className="as-bracket" data-corner="bottom-right" aria-hidden />
        </div>
        <div className="surface-dark relative h-56 overflow-hidden rounded-2xl bg-background">
          <span className="as-wedge" aria-hidden style={{ ["--as-wedge-fill" as string]: "#fafafa" }} />
        </div>
      </section>
    </Container>
  );
}
