import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";
import { MagneticButton } from "@/components/ui/magnetic-button";

export function BookConsultationCTA() {
  return (
    <section className="py-24 sm:py-32">
      <Container className="flex flex-col items-center gap-8 rounded-3xl border border-glass-border bg-secondary px-8 py-16 text-center shadow-card">
        <SectionHeading
          eyebrow="Get Started"
          title="Ready to talk it through?"
          description="Book a call with an advisor — no obligation, no sales script, just a clear read on what setup makes sense for your business."
          align="center"
        />
        <MagneticButton href="/book-consultation" variant="primary">
          Book Consultation
        </MagneticButton>
      </Container>
    </section>
  );
}
