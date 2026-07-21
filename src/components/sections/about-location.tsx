import Image from "next/image";
import { Container } from "@/components/ui/container";

export function AboutLocation() {
  return (
    <section className="pb-24 sm:pb-32">
      <Container>
        <div className="relative aspect-[1964/801] w-full overflow-hidden rounded-2xl border border-glass-border">
          <Image
            src="/brand/dubai-skyline.png"
            alt="Dubai skyline including the Burj Khalifa and Burj Al Arab"
            fill
            sizes="(min-width: 1280px) 1152px, 100vw"
            className="object-cover"
          />
          <div className="absolute bottom-0 left-0 p-6">
            <span className="text-xs font-semibold uppercase tracking-widest text-white/80">
              Business Bay, Dubai
            </span>
          </div>
        </div>
      </Container>
    </section>
  );
}
