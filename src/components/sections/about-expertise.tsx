import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";
import { Stagger, StaggerItem } from "@/components/ui/scroll-reveal";
import { AmbientGlow } from "@/components/ui/ambient-glow";
import AREAS from "@/content/sections/about-expertise.json";


export function AboutExpertise() {
  return (
    <section className="relative overflow-hidden py-24 sm:py-32">
      <AmbientGlow className="opacity-30" />
      <Container className="relative z-10 flex flex-col gap-16">
        <SectionHeading
          eyebrow="Where We Help"
          title="Four areas, one advisor across all of them."
          align="center"
          className="mx-auto"
        />
        <Stagger className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {AREAS.map((area, index) => (
            <StaggerItem key={area.title} className="flex flex-col gap-4">
              <span className="font-mono text-2xl text-primary">
                {String(index + 1).padStart(2, "0")}
              </span>
              <h3 className="text-lg font-semibold text-foreground">{area.title}</h3>
              <p className="text-sm text-muted-foreground">{area.description}</p>
            </StaggerItem>
          ))}
        </Stagger>
      </Container>
    </section>
  );
}
