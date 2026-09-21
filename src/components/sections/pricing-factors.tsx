import { DefinitionList } from "@/components/ui/definition-list";
import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";
import { Reveal, Stagger, StaggerItem } from "@/components/ui/scroll-reveal";
import { AmbientGlow } from "@/components/ui/ambient-glow";
import factorsContent from "@/content/sections/pricing-factors.json";

const FACTORS = factorsContent.items;


export function PricingFactors() {
  return (
    <section className="relative overflow-hidden py-24 sm:py-32">
      <AmbientGlow className="opacity-30" />
      <Container className="relative z-10 flex flex-col gap-16">
        <SectionHeading
          eyebrow="How Pricing Works"
          title="We quote after we understand your business, not before."
          align="center"
          className="mx-auto"
        />
        <Stagger className="grid gap-x-16 gap-y-10 sm:grid-cols-2">
          {FACTORS.map((factor) => (
            <StaggerItem key={factor.title}>
              <DefinitionList items={[factor]} />
            </StaggerItem>
          ))}
        </Stagger>
        <Reveal>
          <p className="mx-auto max-w-2xl text-center text-muted-foreground">
            We don&apos;t publish flat-rate packages because they hide exactly the details that change
            your cost — jurisdiction, entity count, and whether you need one-time or ongoing support.
            A discovery call gets you a real, scoped quote, usually within a day.
          </p>
        </Reveal>
      </Container>
    </section>
  );
}
