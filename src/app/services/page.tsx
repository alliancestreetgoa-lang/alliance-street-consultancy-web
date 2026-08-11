// src/app/services/page.tsx
import type { Metadata } from "next";
import { buildBreadcrumbJsonLd, jsonLdScriptProps } from "@/lib/schema";
import { PageHero } from "@/components/sections/page-hero";
import { ServicesBanner } from "@/components/sections/services-banner";
import { ServicesIndex } from "@/components/sections/services-index";
import { BookConsultationCTA } from "@/components/sections/book-consultation-cta";

export const metadata: Metadata = {
  title: "UAE & UK Advisory Services",
  description:
    "UAE free zone, mainland and offshore setup, corporate tax and VAT compliance, UK incorporation and accounting — under one advisory relationship.",
  alternates: { canonical: "/services" },
  openGraph: {
    url: "/services",
    title: "UAE & UK Advisory Services | Alliance Street Consultancy",
    description:
      "UAE free zone, mainland and offshore setup, corporate tax and VAT compliance, UK incorporation and accounting — under one advisory relationship.",
  },
};

export default function ServicesPage() {
  const breadcrumbJsonLd = buildBreadcrumbJsonLd([
    { name: "Home", path: "/" },
    { name: "Services", path: "/services" },
  ]);

  return (
    <>
      <script {...jsonLdScriptProps(breadcrumbJsonLd)} />
      <PageHero
        badge="Services"
        title="Everything under one advisory relationship."
        subhead="UAE setup, UAE tax and compliance, UK services, and advisory — twenty services, one point of contact."
      />
      <ServicesBanner />
      <ServicesIndex />
      <BookConsultationCTA />
    </>
  );
}
