import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";
import { Card } from "@/components/ui/card";
import { Stagger, StaggerItem } from "@/components/ui/scroll-reveal";
import { AmbientGlow } from "@/components/ui/ambient-glow";
import case_studiesContent from "@/content/sections/case-studies.json";

const CASE_STUDIES = case_studiesContent.items;


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
                <h3 className="text-xl font-semibold text-foreground">{study.title}</h3>
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
