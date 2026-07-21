// src/app/services/page.tsx
import { PageHero } from "@/components/sections/page-hero";
import { ServicesIndex } from "@/components/sections/services-index";
import { BookConsultationCTA } from "@/components/sections/book-consultation-cta";

export default function ServicesPage() {
  return (
    <>
      <PageHero
        badge="Services"
        title="Everything under one advisory relationship."
        subhead="UAE setup, UAE tax and compliance, UK services, and advisory — twenty services, one point of contact."
      />
      <ServicesIndex />
      <BookConsultationCTA />
    </>
  );
}
