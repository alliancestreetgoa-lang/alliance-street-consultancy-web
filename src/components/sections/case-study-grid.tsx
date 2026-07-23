import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";
import { Card } from "@/components/ui/card";
import { Stagger, StaggerItem } from "@/components/ui/scroll-reveal";
import { AmbientGlow } from "@/components/ui/ambient-glow";

const CASE_STUDIES = [
  {
    category: "UAE Setup",
    title: "Free zone trading company, 100% foreign-owned",
    challenge:
      "A founder needed full ownership and a corporate bank account without months of back-and-forth.",
    approach:
      "We matched the trade licence activity to the free zone with the fastest banking relationships, then ran PRO and banking introductions in parallel with formation.",
    outcome: "Licence and bank account handled as one coordinated process, not two separate queues.",
  },
  {
    category: "UAE Setup",
    title: "Solo consultant moving from freelance visa to mainland licence",
    challenge: "Needed a mainland licence to bid on contracts a freelance permit couldn't touch.",
    approach:
      "Structured the mainland entity, arranged the local service agent agreement, and sequenced visa issuance around it.",
    outcome: "A licence that actually qualifies for the contracts it was set up to win.",
  },
  {
    category: "UAE Tax & Compliance",
    title: "E-commerce group filing corporate tax for the first time",
    challenge:
      "Multiple related entities, one filing deadline, and no internal finance team to interpret the rules.",
    approach:
      "Reviewed the group structure for related-party exposure, prepared documentation, and filed each entity correctly.",
    outcome: "Filed on time with a clear record of why each number is what it is.",
  },
  {
    category: "UK Services",
    title: "Dubai-based founder incorporating a UK entity",
    challenge: "Needed a UK Ltd for UK clients without relocating or hiring a separate UK accountant.",
    approach:
      "Handled Companies House incorporation and took over UK bookkeeping and VAT from day one, coordinated with the existing UAE entity.",
    outcome: "One point of contact covering both jurisdictions instead of two disconnected advisors.",
  },
  {
    category: "Advisory",
    title: "SaaS business scaling past its first finance hire",
    challenge: "Headcount tripled and the founder lost visibility into runway and burn.",
    approach:
      "Brought in fractional CFO support: monthly management accounts, a cash-flow model, and board-ready reporting.",
    outcome: "Numbers the founder can act on before they become a problem, not after.",
  },
  {
    category: "Advisory",
    title: "Family business restructuring ahead of UAE corporate tax",
    challenge: "A legacy multi-entity structure created double-taxation exposure under the new rules.",
    approach:
      "Mapped the group's ownership and transactions, then proposed a restructuring that removes the overlap.",
    outcome: "A structure built for the current tax regime, not the one that existed a decade ago.",
  },
];

export function CaseStudyGrid() {
  return (
    <section className="relative overflow-hidden py-24 sm:py-32">
      <AmbientGlow className="opacity-30" />
      <Container className="relative z-10 flex flex-col gap-16">
        <SectionHeading
          eyebrow="Scenarios"
          title="Six situations we handle often."
          align="center"
          className="mx-auto"
        />
        <Stagger className="grid gap-8 lg:grid-cols-2">
          {CASE_STUDIES.map((study) => (
            <StaggerItem key={study.title}>
            <Card variant="glass" className="flex flex-col gap-6">
              <div className="flex flex-col gap-2">
                <span className="text-xs font-semibold uppercase tracking-widest text-primary">
                  {study.category}
                </span>
                <h3 className="font-display text-xl font-medium text-foreground">{study.title}</h3>
              </div>
              <dl className="flex flex-col gap-4">
                <div>
                  <dt className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                    Challenge
                  </dt>
                  <dd className="mt-1 text-sm text-foreground/90">{study.challenge}</dd>
                </div>
                <div>
                  <dt className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                    Our Approach
                  </dt>
                  <dd className="mt-1 text-sm text-foreground/90">{study.approach}</dd>
                </div>
                <div>
                  <dt className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                    Outcome
                  </dt>
                  <dd className="mt-1 text-sm text-foreground/90">{study.outcome}</dd>
                </div>
              </dl>
            </Card>
            </StaggerItem>
          ))}
        </Stagger>
      </Container>
    </section>
  );
}
