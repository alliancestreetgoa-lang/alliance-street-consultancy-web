// src/app/about/page.tsx
import type { Metadata } from "next";
import { buildBreadcrumbJsonLd, jsonLdScriptProps } from "@/lib/schema";
import { AboutHero } from "@/components/sections/about-hero";
import { AboutLocation } from "@/components/sections/about-location";
import { AboutStory } from "@/components/sections/about-story";
import { AboutExpertise } from "@/components/sections/about-expertise";
import { BookConsultationCTA } from "@/components/sections/book-consultation-cta";

export const metadata: Metadata = {
  title: "About the Firm",
  description:
    "Why Alliance Street exists, who we work with, and the experience behind our UAE and UK company formation, tax and accounting advice.",
  alternates: { canonical: "/about" },
  openGraph: {
    url: "/about",
    title: "About the Firm | Alliance Street Consultancy",
    description:
      "Why Alliance Street exists, who we work with, and the experience behind our UAE and UK company formation, tax and accounting advice.",
  },
};

export default function AboutPage() {
  const breadcrumbJsonLd = buildBreadcrumbJsonLd([
    { name: "Home", path: "/" },
    { name: "About", path: "/about" },
  ]);

  return (
    <>
      <script {...jsonLdScriptProps(breadcrumbJsonLd)} />
      <AboutHero />
      <AboutLocation />
      <AboutStory />
      <AboutExpertise />
      <BookConsultationCTA />
    </>
  );
}
