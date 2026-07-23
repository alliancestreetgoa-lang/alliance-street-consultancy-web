import { Container } from "@/components/ui/container";
import { FramedImage } from "@/components/ui/framed-image";
import { Reveal } from "@/components/ui/scroll-reveal";

export function PricingBanner() {
  return (
    <section className="pb-24 sm:pb-32">
      <Container className="grid items-center gap-12 lg:grid-cols-[7fr_5fr] lg:gap-16">
        <Reveal className="flex flex-col gap-4">
          <p className="text-2xl font-display font-medium leading-snug text-foreground">
            The number depends on what we&apos;re actually solving, not a rate card.
          </p>
          <p className="text-muted-foreground">
            A quote reflects your jurisdiction, entity count, and whether the work is one-time or
            ongoing — the same detail that determines whether the engagement actually fits.
          </p>
        </Reveal>
        <Reveal delay={0.1}>
          <FramedImage
            src="/brand/finance-chart.jpg"
            alt="Financial data on a tablet screen"
            aspectClassName="aspect-[3/4]"
            sizes="(min-width: 1024px) 420px, 100vw"
          />
        </Reveal>
      </Container>
    </section>
  );
}
