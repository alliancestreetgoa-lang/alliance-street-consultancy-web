import { Container } from "@/components/ui/container";
import { FramedImage } from "@/components/ui/framed-image";
import { Reveal } from "@/components/ui/scroll-reveal";

export function AboutLocation() {
  return (
    // pt-12 gives the image a little air under the hero, which it otherwise
    // butts straight against. No bottom padding: AboutStory, which always
    // follows this, opens with its own py-24 sm:py-32 — carrying both stacked
    // to ~256px and left the image stranded from the section it introduces.
    <section className="pt-12">
      <Container>
        <Reveal>
          <FramedImage
            src="/brand/dubai-skyline.png"
            alt="Dubai skyline including the Burj Khalifa and Burj Al Arab"
            caption="Business Bay, Dubai"
            aspectClassName="aspect-[1964/801]"
            sizes="(min-width: 1280px) 1152px, 100vw"
          />
        </Reveal>
      </Container>
    </section>
  );
}
