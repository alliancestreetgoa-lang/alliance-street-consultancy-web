import { DefinitionList } from "@/components/ui/definition-list";
import { Container } from "@/components/ui/container";
import { Stagger, StaggerItem } from "@/components/ui/scroll-reveal";
import { AmbientGlow } from "@/components/ui/ambient-glow";
import INDUSTRIES from "@/content/sections/industries.json";


export function IndustriesGrid() {
  return (
    <section className="relative overflow-hidden py-24 sm:py-32">
      <AmbientGlow className="opacity-30" />
      <Container className="relative z-10">
        <Stagger className="grid gap-x-16 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
          {INDUSTRIES.map((industry) => (
            <StaggerItem key={industry.title}>
              <DefinitionList items={[industry]} />
            </StaggerItem>
          ))}
        </Stagger>
      </Container>
    </section>
  );
}
