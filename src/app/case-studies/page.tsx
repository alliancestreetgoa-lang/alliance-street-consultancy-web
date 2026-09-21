// src/app/case-studies/page.tsx
import type { Metadata } from "next";
import { buildBreadcrumbJsonLd, jsonLdScriptProps } from "@/lib/schema";
import { CaseStudiesHero } from "@/components/sections/case-studies-hero";
import { StatementBanner } from "@/components/sections/statement-banner";
import { CaseStudyGrid } from "@/components/sections/case-study-grid";
import { BookConsultationCTA } from "@/components/sections/book-consultation-cta";

export const metadata: Metadata = {
  title: "Case Studies",
  description:
    "Six recurring client situations across UAE setup, tax and UK services — the problem, the approach we took, and how each one resolved.",
  alternates: { canonical: "/case-studies" },
  openGraph: {
    url: "/case-studies",
    title: "Case Studies | Alliance Street Consultancy",
    description:
      "Six recurring client situations across UAE setup, tax and UK services — the problem, the approach we took, and how each one resolved.",
  },
};

export default function CaseStudiesPage() {
  const breadcrumbJsonLd = buildBreadcrumbJsonLd([
    { name: "Home", path: "/" },
    { name: "Case Studies", path: "/case-studies" },
  ]);

  return (
    <>
      <script {...jsonLdScriptProps(breadcrumbJsonLd)} />
      <CaseStudiesHero />
      <StatementBanner
        eyebrow={["Case studies", "in practice"]}
        imageSide="right"
        image={{ src: "/brand/handshake.jpg", alt: "Advisor and client shaking hands" }}
        statement="Every one of these started as a conversation, not a quote."
        body="We scope the actual problem before we recommend a structure — which is why the approach below sometimes isn't the one that's easiest to sell."
      />
      <CaseStudyGrid />
      <BookConsultationCTA />
    </>
  );
}
