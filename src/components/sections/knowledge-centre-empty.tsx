import { BookOpen } from "lucide-react";
import { Container } from "@/components/ui/container";
import { MagneticButton } from "@/components/ui/magnetic-button";

export function KnowledgeCentreEmpty() {
  return (
    <section className="py-24 sm:py-32">
      <Container className="flex flex-col items-center gap-6 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full border border-glass-border bg-secondary/40">
          <BookOpen className="h-7 w-7 text-primary" aria-hidden />
        </div>
        <h2 className="font-display text-2xl font-medium text-foreground">
          We&apos;re building the Knowledge Centre.
        </h2>
        <p className="max-w-md text-muted-foreground">
          Practical guides on UAE and UK formation, tax, and compliance are in progress. In the
          meantime, our{" "}
          <a href="/case-studies" className="text-primary hover:underline">
            case studies
          </a>{" "}
          cover the situations we handle most, or ask an advisor directly.
        </p>
        <MagneticButton href="/book-consultation" variant="primary">
          Book Consultation
        </MagneticButton>
      </Container>
    </section>
  );
}
