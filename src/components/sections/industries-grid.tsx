import { Container } from "@/components/ui/container";

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
    <section className="py-24 sm:py-32">
      <Container className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
        {INDUSTRIES.map((industry) => (
          <div key={industry.title} className="flex flex-col gap-4 rounded-2xl border border-glass-border bg-secondary/40 p-8">
            <h3 className="font-display text-xl font-medium text-foreground">{industry.title}</h3>
            <p className="text-sm text-muted-foreground">{industry.description}</p>
          </div>
        ))}
      </Container>
    </section>
  );
}
