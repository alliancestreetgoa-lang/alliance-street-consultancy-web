import { Container } from "@/components/ui/container";
import { FramedImage } from "@/components/ui/framed-image";

export function CaseStudiesBanner() {
  return (
    <section className="pb-24 sm:pb-32">
      <Container className="grid items-center gap-12 lg:grid-cols-[7fr_5fr] lg:gap-16">
        <div className="flex flex-col gap-4">
          <p className="text-2xl font-display font-medium leading-snug text-foreground">
            Every one of these started as a conversation, not a quote.
          </p>
          <p className="text-muted-foreground">
            We scope the actual problem before we recommend a structure — which is why the
            approach below sometimes isn&apos;t the one that&apos;s easiest to sell.
          </p>
        </div>
        <FramedImage
          src="/brand/handshake.jpg"
          alt="Advisor and client shaking hands"
          aspectClassName="aspect-[3/4]"
          sizes="(min-width: 1024px) 420px, 100vw"
        />
      </Container>
    </section>
  );
}
