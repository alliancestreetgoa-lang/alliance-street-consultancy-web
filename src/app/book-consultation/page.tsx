import type { Metadata } from "next";
import { buildBreadcrumbJsonLd, jsonLdScriptProps } from "@/lib/schema";
import { Container } from "@/components/ui/container";
import { Badge } from "@/components/ui/badge";
import { AmbientGlow } from "@/components/ui/ambient-glow";
import { Reveal } from "@/components/ui/scroll-reveal";
import { COMPANY } from "@/lib/site-config";

export const metadata: Metadata = {
  title: "Book a Consultation",
  description:
    "Talk through UAE or UK company formation, corporate tax and compliance with an Alliance Street advisor. Reach us by email or WhatsApp while calendar booking is being set up.",
  alternates: { canonical: "/book-consultation" },
  openGraph: {
    url: "/book-consultation",
    title: "Book a Consultation | Alliance Street Consultancy",
    description:
      "Talk through UAE or UK company formation, corporate tax and compliance with an Alliance Street advisor.",
  },
};

export default function BookConsultationPage() {
  const breadcrumbJsonLd = buildBreadcrumbJsonLd([
    { name: "Home", path: "/" },
    { name: "Book a Consultation", path: "/book-consultation" },
  ]);

  return (
    <section className="relative overflow-hidden">
      <script {...jsonLdScriptProps(breadcrumbJsonLd)} />
      <AmbientGlow className="opacity-40" />
      <Container className="relative z-10 flex min-h-[60vh] flex-col items-center justify-center gap-6 text-center">
        <Reveal className="flex flex-col items-center gap-6 text-center">
          <Badge>Book a Consultation</Badge>
          <h1 className="font-display text-4xl font-medium tracking-tight text-balance sm:text-5xl text-3d">
            Online booking is coming soon.
          </h1>
          <p className="max-w-xl text-muted-foreground">
            We&apos;re setting up direct calendar booking. In the meantime, email{" "}
            <a href={`mailto:${COMPANY.email}`} className="text-primary hover:underline">
              {COMPANY.email}
            </a>{" "}
            and we&apos;ll get back to you within one business day.
          </p>
        </Reveal>
      </Container>
    </section>
  );
}
