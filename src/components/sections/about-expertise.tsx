import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";

const AREAS = [
  {
    title: "UAE Setup",
    description: "Free zone, mainland, and offshore formation, PRO services, and corporate banking introductions.",
  },
  {
    title: "UAE Tax & Compliance",
    description: "Corporate tax, VAT registration and filing, audit support, and monthly bookkeeping.",
  },
  {
    title: "UK Services",
    description: "Companies House incorporation, statutory accounts, self assessment, and UK VAT.",
  },
  {
    title: "Advisory",
    description: "Business consulting, fractional CFO services, tax planning, and payroll.",
  },
];

export function AboutExpertise() {
  return (
    <section className="py-24 sm:py-32">
      <Container className="flex flex-col gap-16">
        <SectionHeading
          eyebrow="Where We Help"
          title="Four areas, one advisor across all of them."
          align="center"
          className="mx-auto"
        />
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {AREAS.map((area, index) => (
            <div key={area.title} className="flex flex-col gap-4">
              <span className="font-display text-3xl font-medium text-primary">
                {String(index + 1).padStart(2, "0")}
              </span>
              <h3 className="font-display text-lg font-medium text-foreground">{area.title}</h3>
              <p className="text-sm text-muted-foreground">{area.description}</p>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}
