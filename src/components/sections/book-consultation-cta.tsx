import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";
import { Reveal } from "@/components/ui/scroll-reveal";
import { AmbientGlow } from "@/components/ui/ambient-glow";

export function BookConsultationCTA() {
  return (
    <section className="py-24 sm:py-32">
      <Container>
        <Reveal
          scale
          className="relative flex flex-col items-center gap-8 overflow-hidden rounded-3xl border border-border bg-card px-8 py-16 text-center shadow-card"
        >
          <AmbientGlow className="opacity-40" />
          <SectionHeading
            eyebrow="Get Started"
            title="Ready to talk it through?"
            description="Book a call with an advisor — no obligation, no sales script, just a clear read on what setup makes sense for your business."
            align="center"
            className="relative z-10"
          />
          <Button size="lg" className="relative z-10" asChild><Link href="/book-consultation">Book Consultation</Link></Button>
        </Reveal>
      </Container>
    </section>
  );
}
