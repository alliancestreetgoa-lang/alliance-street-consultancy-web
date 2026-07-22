import { Container } from "@/components/ui/container";
import { FramedImage } from "@/components/ui/framed-image";

export function ServicesBanner() {
  return (
    <section className="pb-24 sm:pb-32">
      <Container className="grid items-center gap-12 lg:grid-cols-[5fr_7fr] lg:gap-16">
        <FramedImage
          src="/brand/dubai-skyline-photo.jpg"
          alt="Dubai skyline at sunset including the Burj Khalifa"
          aspectClassName="aspect-[3/4]"
          sizes="(min-width: 1024px) 420px, 100vw"
        />
        <div className="flex flex-col gap-4">
          <p className="text-2xl font-display font-medium leading-snug text-foreground">
            Twenty services, four categories, one advisor across all of them.
          </p>
          <p className="text-muted-foreground">
            Browse by what you need — setup, tax, UK compliance, or advisory — or book a call and
            we&apos;ll tell you which ones actually apply to your situation.
          </p>
        </div>
      </Container>
    </section>
  );
}
