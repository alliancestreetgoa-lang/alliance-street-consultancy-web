import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";
import { Stagger, StaggerItem } from "@/components/ui/scroll-reveal";
import { AmbientGlow } from "@/components/ui/ambient-glow";

const STEPS = [
  {
    title: "Discovery Call",
    description:
      "We learn about your business, where you're trading, and what structure actually fits — not the one that's easiest to sell.",
  },
  {
    title: "Structuring & Setup",
    description:
      "We recommend the right jurisdiction and entity type, then handle formation, licensing, and banking introductions.",
  },
  {
    title: "Compliance, Built In",
    description:
      "VAT, corporate tax, and bookkeeping are set up correctly from day one, not fixed after an audit finds the gaps.",
  },
  {
    title: "Ongoing Partnership",
    description:
      "We stay on as your accountant and advisor — filings, renewals, and the questions that come up in between.",
  },
];

export function Process() {
  return (
    <section className="relative overflow-hidden py-24 sm:py-32">
      <AmbientGlow className="opacity-30" />
      <Container className="relative z-10 flex flex-col gap-16">
        <SectionHeading
          eyebrow="Process"
          title="How an engagement actually works."
          align="center"
          className="mx-auto"
        />
        <Stagger className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((step, index) => (
            <StaggerItem key={step.title} className="flex flex-col gap-4">
              <span className="font-display text-3xl font-medium text-primary">
                {String(index + 1).padStart(2, "0")}
              </span>
              <h3 className="font-display text-lg font-medium text-foreground">{step.title}</h3>
              <p className="text-sm text-muted-foreground">{step.description}</p>
            </StaggerItem>
          ))}
        </Stagger>
      </Container>
    </section>
  );
}
