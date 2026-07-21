// src/app/about/page.tsx
import { AboutHero } from "@/components/sections/about-hero";
import { AboutLocation } from "@/components/sections/about-location";
import { AboutStory } from "@/components/sections/about-story";
import { AboutExpertise } from "@/components/sections/about-expertise";
import { BookConsultationCTA } from "@/components/sections/book-consultation-cta";

export default function AboutPage() {
  return (
    <>
      <AboutHero />
      <AboutLocation />
      <AboutStory />
      <AboutExpertise />
      <BookConsultationCTA />
    </>
  );
}
