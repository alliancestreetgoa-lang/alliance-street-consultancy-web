// src/app/about/page.tsx
import { AboutHero } from "@/components/sections/about-hero";
import { AboutStory } from "@/components/sections/about-story";
import { AboutExpertise } from "@/components/sections/about-expertise";
import { BookConsultationCTA } from "@/components/sections/book-consultation-cta";

export default function AboutPage() {
  return (
    <>
      <AboutHero />
      <AboutStory />
      <AboutExpertise />
      <BookConsultationCTA />
    </>
  );
}
