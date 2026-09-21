import { DefinitionList } from "@/components/ui/definition-list";
import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";
import { Stagger, StaggerItem } from "@/components/ui/scroll-reveal";
import DIFFERENTIATORS from "@/content/sections/differentiators.json";


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
        <Stagger className="grid gap-x-16 gap-y-10 sm:grid-cols-2">
          {DIFFERENTIATORS.map((item) => (
            <StaggerItem key={item.title}>
              <DefinitionList items={[item]} />
            </StaggerItem>
          ))}
        </Stagger>
      </Container>
    </section>
  );
}
