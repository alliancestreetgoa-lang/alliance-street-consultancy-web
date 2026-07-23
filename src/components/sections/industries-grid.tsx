import { Container } from "@/components/ui/container";
import { Card } from "@/components/ui/card";
import { Stagger, StaggerItem } from "@/components/ui/scroll-reveal";
import { AmbientGlow } from "@/components/ui/ambient-glow";

const INDUSTRIES = [
  {
    title: "E-commerce & Online Retail",
    description:
      "Selling across borders needs a structure that doesn't fight your supply chain — free zone setup, VAT registration, and corporate tax planned around how goods and payments actually move.",
  },
  {
    title: "Trading & Import/Export",
    description:
      "Physical goods moving through UAE ports need mainland or free zone structuring matched to how you actually trade, plus the licensing and PRO work that keeps shipments moving.",
  },
  {
    title: "Consulting & Professional Services",
    description:
      "Solo consultants and small advisory firms scaling past a freelance permit into a proper licensed entity, often with a UK arm for cross-border clients.",
  },
  {
    title: "Technology & SaaS",
    description:
      "Distributed teams, recurring revenue, and investors who ask about your cap table — CFO support and dual UAE/UK structuring built for how software businesses actually grow.",
  },
  {
    title: "Real Estate & Holding Companies",
    description:
      "Asset protection and clean ownership structures for property and investment holdings, often through offshore entities built for exactly this purpose.",
  },
  {
    title: "Hospitality & F&B",
    description:
      "Licensing, payroll, and VAT for businesses with real premises and real staff — mainland formation done right the first time, and compliance that doesn't lapse.",
  },
];

export function IndustriesGrid() {
  return (
    <section className="relative overflow-hidden py-24 sm:py-32">
      <AmbientGlow className="opacity-30" />
      <Container className="relative z-10">
        <Stagger className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {INDUSTRIES.map((industry) => (
            <StaggerItem key={industry.title}>
              <Card variant="glass" className="flex h-full flex-col gap-4">
                <h3 className="font-display text-xl font-medium text-foreground">{industry.title}</h3>
                <p className="text-sm text-muted-foreground">{industry.description}</p>
              </Card>
            </StaggerItem>
          ))}
        </Stagger>
      </Container>
    </section>
  );
}
