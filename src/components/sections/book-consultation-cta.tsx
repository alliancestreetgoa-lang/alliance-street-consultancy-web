import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";
import { MagneticButton } from "@/components/ui/magnetic-button";
import { Reveal } from "@/components/ui/scroll-reveal";
import { AmbientGlow } from "@/components/ui/ambient-glow";

export function BookConsultationCTA() {
  return (
    <section className="py-24 sm:py-32">
      <Container>
        <Reveal
          scale
          className="glass-pill relative overflow-hidden flex flex-col items-center gap-8 rounded-3xl px-8 py-16 text-center"
        >
          <AmbientGlow className="opacity-40" />
          <SectionHeading
            eyebrow="Get Started"
            title="Ready to talk it through?"
            description="Book a call with an advisor — no obligation, no sales script, just a clear read on what setup makes sense for your business."
            align="center"
            className="relative z-10"
          />
          <MagneticButton href="/book-consultation" variant="primary" className="relative z-10">
            Book Consultation
          </MagneticButton>
        </Reveal>
      </Container>
    </section>
  );
}
