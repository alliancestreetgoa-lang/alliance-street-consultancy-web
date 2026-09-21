import { Container } from "@/components/ui/container";
import { DefinitionList } from "@/components/ui/definition-list";
import { Stagger, StaggerItem } from "@/components/ui/scroll-reveal";
import { AmbientGlow } from "@/components/ui/ambient-glow";
import { SERVICES } from "@/lib/services-data";

const GROUPS: { title: string; category: string }[] = [
  { title: "UAE Setup", category: "uae" },
  { title: "UAE Tax & Compliance", category: "uae" },
  { title: "UK Services", category: "uk" },
  { title: "Advisory", category: "advisory" },
];

export function ServicesIndex() {
  return (
    <section className="relative overflow-hidden py-24 sm:py-32">
      <AmbientGlow className="opacity-30" />
      <Container className="relative z-10">
        <Stagger className="grid gap-16 sm:grid-cols-2">
          {GROUPS.map((group) => (
            <StaggerItem key={group.title}>
              <DefinitionList
                heading={group.title}
                items={SERVICES.filter((service) => service.group === group.title).map(
                  (service) => ({
                    title: service.title,
                    description: service.tagline,
                    href: `/services/${service.category}/${service.slug}`,
                  })
                )}
              />
            </StaggerItem>
          ))}
        </Stagger>
      </Container>
    </section>
  );
}
