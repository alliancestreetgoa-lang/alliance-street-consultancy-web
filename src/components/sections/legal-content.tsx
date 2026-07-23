import { Container } from "@/components/ui/container";
import { Reveal, Stagger, StaggerItem } from "@/components/ui/scroll-reveal";

type LegalSection = {
  heading: string;
  body: string;
};

type LegalContentProps = {
  lastUpdated: string;
  sections: LegalSection[];
};

export function LegalContent({ lastUpdated, sections }: LegalContentProps) {
  return (
    <section className="py-24 sm:py-32">
      <Container className="mx-auto flex max-w-3xl flex-col gap-12">
        <Reveal className="glass-pill rounded-xl px-6 py-4 text-sm text-muted-foreground">
          Last updated {lastUpdated}. This is placeholder legal copy pending review by qualified
          counsel — do not treat it as final until reviewed.
        </Reveal>
        <Stagger className="flex flex-col gap-12">
          {sections.map((section) => (
            <StaggerItem key={section.heading} className="flex flex-col gap-3">
              <h2 className="font-display text-xl font-medium text-foreground">{section.heading}</h2>
              <p className="text-muted-foreground">{section.body}</p>
            </StaggerItem>
          ))}
        </Stagger>
      </Container>
    </section>
  );
}
