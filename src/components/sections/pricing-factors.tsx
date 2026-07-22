import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";
import { Card } from "@/components/ui/card";

const FACTORS = [
  {
    title: "Jurisdiction and entity type",
    description: "A single UAE free zone licence costs differently than a mainland entity, an offshore holding company, or a UK Ltd — and differently again if you need more than one.",
  },
  {
    title: "Ongoing vs one-time work",
    description: "Formation is a one-time project. Bookkeeping, VAT filing, and payroll are recurring — quoted as a monthly or quarterly retainer, not a lump sum.",
  },
  {
    title: "Complexity of your structure",
    description: "A single founder with one entity is a simpler quote than a group with related entities, cross-border transactions, or a restructuring project.",
  },
  {
    title: "How much you need handled",
    description: "Some clients want formation only. Others want formation, banking, visas, and ongoing compliance under one retainer. The scope changes the number.",
  },
];

export function PricingFactors() {
  return (
    <section className="py-24 sm:py-32">
      <Container className="flex flex-col gap-16">
        <SectionHeading
          eyebrow="How Pricing Works"
          title="We quote after we understand your business, not before."
          align="center"
          className="mx-auto"
        />
        <div className="grid gap-8 sm:grid-cols-2">
          {FACTORS.map((factor) => (
            <Card key={factor.title}>
              <h3 className="font-display text-xl font-medium text-foreground">{factor.title}</h3>
              <p className="mt-3 text-muted-foreground">{factor.description}</p>
            </Card>
          ))}
        </div>
        <p className="mx-auto max-w-2xl text-center text-muted-foreground">
          We don&apos;t publish flat-rate packages because they hide exactly the details that change
          your cost — jurisdiction, entity count, and whether you need one-time or ongoing support.
          A discovery call gets you a real, scoped quote, usually within a day.
        </p>
      </Container>
    </section>
  );
}
