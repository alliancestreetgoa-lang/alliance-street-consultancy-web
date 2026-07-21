// src/app/knowledge-centre/page.tsx
import { PageHero } from "@/components/sections/page-hero";
import { KnowledgeCentreEmpty } from "@/components/sections/knowledge-centre-empty";

export default function KnowledgeCentrePage() {
  return (
    <>
      <PageHero
        badge="Knowledge Centre"
        title="Guides on UAE and UK compliance."
        subhead="Practical, plain-language explainers — coming soon."
      />
      <KnowledgeCentreEmpty />
    </>
  );
}
