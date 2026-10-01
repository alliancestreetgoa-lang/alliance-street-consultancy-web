import { buildBreadcrumbJsonLd, jsonLdScriptProps } from "@/lib/schema";
import { Container } from "@/components/ui/container";
import { Badge } from "@/components/ui/badge";
import { AmbientGlow } from "@/components/ui/ambient-glow";
import { Reveal } from "@/components/ui/scroll-reveal";
import { ConsultationForm } from "@/components/sections/consultation-form";
import { pageMetadata } from "@/lib/content/metadata";

export const metadata = pageMetadata("/book-appointment");

export default function BookAppointmentPage() {
  const breadcrumbJsonLd = buildBreadcrumbJsonLd([
    { name: "Home", path: "/" },
    { name: "Book an Appointment", path: "/book-appointment" },
  ]);

  return (
    <section className="relative overflow-hidden">
      <script {...jsonLdScriptProps(breadcrumbJsonLd)} />
      <AmbientGlow className="opacity-40" />
      <Container className="relative z-10 flex max-w-4xl flex-col items-center gap-10 py-16 sm:py-24">
        <Reveal className="flex flex-col items-center gap-5 text-center">
          <Badge>Book an Appointment</Badge>
          <h1 className="text-balance text-4xl font-semibold sm:text-5xl">Book a conversation with Stallone.</h1>
          <p className="max-w-xl text-muted-foreground">Enter your contact details and select your services first. Then choose to send an enquiry or book a time on Stallone Shaikh’s Zoom calendar.</p>
          <p className="text-sm text-muted-foreground">Fields marked * are required.</p>
        </Reveal>
        <ConsultationForm />
      </Container>
    </section>
  );
}
