// src/app/about/page.tsx
import { buildBreadcrumbJsonLd, jsonLdScriptProps } from "@/lib/schema";
import { AboutHero } from "@/components/sections/about-hero";
import { AboutLocation } from "@/components/sections/about-location";
import { AboutStory } from "@/components/sections/about-story";
import { AboutExpertise } from "@/components/sections/about-expertise";
import { BookConsultationCTA } from "@/components/sections/book-consultation-cta";
import { pageMetadata } from "@/lib/content/metadata";

export const metadata = pageMetadata("/about");

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
