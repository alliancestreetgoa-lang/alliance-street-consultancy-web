import { Container } from "@/components/ui/container";
import { FramedImage } from "@/components/ui/framed-image";

export function AboutLocation() {
  return (
    <section className="pb-24 sm:pb-32">
      <Container>
        <FramedImage
          src="/brand/dubai-skyline.png"
          alt="Dubai skyline including the Burj Khalifa and Burj Al Arab"
          caption="Business Bay, Dubai"
          aspectClassName="aspect-[1964/801]"
          sizes="(min-width: 1280px) 1152px, 100vw"
        />
      </Container>
    </section>
  );
}
