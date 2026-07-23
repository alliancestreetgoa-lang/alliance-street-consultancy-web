import { Container } from "@/components/ui/container";
import { FramedImage } from "@/components/ui/framed-image";
import { Reveal } from "@/components/ui/scroll-reveal";

export function IndustriesBanner() {
  return (
    <section className="pb-24 sm:pb-32">
      <Container className="grid items-center gap-12 lg:grid-cols-[5fr_7fr] lg:gap-16">
        <Reveal>
          <FramedImage
            src="/brand/dubai-night.jpg"
            alt="Dubai skyline at night, Burj Khalifa lit up"
            aspectClassName="aspect-[3/4]"
            sizes="(min-width: 1024px) 420px, 100vw"
          />
        </Reveal>
        <Reveal delay={0.1} className="flex flex-col gap-4">
          <p className="text-2xl font-display font-medium leading-snug text-foreground">
            Every industry below trades in and out of Dubai for a reason.
          </p>
          <p className="text-muted-foreground">
            Fast-moving free zones, real deadlines, and cross-border founders — the same city that
            makes these businesses possible is the one that makes the paperwork worth getting right.
          </p>
        </Reveal>
      </Container>
    </section>
  );
}
