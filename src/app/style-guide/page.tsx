import type { Metadata } from "next";
import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";
import { Badge } from "@/components/ui/badge";
import { MagneticButton } from "@/components/ui/magnetic-button";

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
          <MagneticButton variant="glass">Glass CTA</MagneticButton>
        </div>
      </section>
    </Container>
  );
}
