import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";

const DIFFERENTIATORS = [
  {
    title: "Two markets, one point of contact",
    description:
      "UAE and UK expertise under one advisor relationship, no re-explaining your business to a new firm every time you cross a border.",
  },
  {
    title: "Built for founders, not filing cabinets",
    description: "Plain-language guidance, not generic paperwork processing.",
  },
  {
    title: "We stay after the licence is printed",
    description:
      "An ongoing compliance and accounting partner, not a setup agent who disappears once you're registered.",
  },
  {
    title: "Structured for growth",
    description: "Tax planning and CFO-level advisory as you scale, not just initial registration.",
  },
];

export function WhyAllianceStreet() {
  return (
    <section className="py-24 sm:py-32">
      <Container className="flex flex-col gap-16">
        <SectionHeading
          eyebrow="Why Alliance Street"
          title="An advisory relationship, not a transaction."
          align="center"
          className="mx-auto"
        />
        <div className="grid gap-8 sm:grid-cols-2">
          {DIFFERENTIATORS.map((item) => (
            <div key={item.title} className="rounded-2xl border border-glass-border bg-secondary/40 p-8">
              <h3 className="font-display text-xl font-medium text-foreground">{item.title}</h3>
              <p className="mt-3 text-muted-foreground">{item.description}</p>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}
