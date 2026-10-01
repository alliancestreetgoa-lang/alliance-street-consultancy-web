import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";
import { AmbientGlow } from "@/components/ui/ambient-glow";
import { Stagger, StaggerItem } from "@/components/ui/scroll-reveal";
import stepsContent from "@/content/sections/process.json";

export function Process() {
  return (
    <section className="relative py-24 sm:py-32">
      <AmbientGlow className="opacity-30" />
      <Container className="relative z-10 flex flex-col gap-16">
        <SectionHeading eyebrow="Process" title="How an engagement actually works." align="center" className="mx-auto" />
        <Stagger className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          {stepsContent.items.map((step, index) => (
            <StaggerItem key={step.title} className="flex flex-col gap-4 border-t border-border pt-6">
              <span className="font-mono text-2xl text-primary">{String(index + 1).padStart(2, "0")}</span>
              <h3 className="text-xl font-semibold">{step.title}</h3>
              <p className="text-base text-muted-foreground">{step.description}</p>
            </StaggerItem>
          ))}
        </Stagger>
      </Container>
    </section>
  );
}
