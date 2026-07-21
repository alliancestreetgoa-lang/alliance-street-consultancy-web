import { Container } from "@/components/ui/container";
import { Badge } from "@/components/ui/badge";
import { COMPANY } from "@/lib/site-config";

export default function BookConsultationPage() {
  return (
    <Container className="flex min-h-[60vh] flex-col items-center justify-center gap-6 text-center">
      <Badge>Book a Consultation</Badge>
      <h1 className="font-display text-4xl font-medium tracking-tight text-foreground sm:text-5xl">
        Online booking is coming soon.
      </h1>
      <p className="max-w-xl text-muted-foreground">
        We&apos;re setting up direct calendar booking. In the meantime, email{" "}
        <a href={`mailto:${COMPANY.email}`} className="text-primary hover:underline">
          {COMPANY.email}
        </a>{" "}
        and we&apos;ll get back to you within one business day.
      </p>
    </Container>
  );
}
