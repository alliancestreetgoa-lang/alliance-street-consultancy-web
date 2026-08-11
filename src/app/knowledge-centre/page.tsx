// src/app/knowledge-centre/page.tsx
import type { Metadata } from "next";
import { buildBreadcrumbJsonLd, jsonLdScriptProps } from "@/lib/schema";
import { PageHero } from "@/components/sections/page-hero";
import { KnowledgeCentreEmpty } from "@/components/sections/knowledge-centre-empty";

// Description deliberately says "coming soon" rather than promising a library
// that doesn't exist yet — the page is currently a placeholder with no
// articles. Rewrite this once real guides ship.
export const metadata: Metadata = {
  title: "Knowledge Centre",
  description:
    "Plain-language guides to UAE and UK company formation, corporate tax and compliance. New explainers are being published soon.",
  alternates: { canonical: "/knowledge-centre" },
  openGraph: {
    url: "/knowledge-centre",
    title: "Knowledge Centre | Alliance Street Consultancy",
    description:
      "Plain-language guides to UAE and UK company formation, corporate tax and compliance. New explainers are being published soon.",
  },
};

export default function KnowledgeCentrePage() {
  const breadcrumbJsonLd = buildBreadcrumbJsonLd([
    { name: "Home", path: "/" },
    { name: "Knowledge Centre", path: "/knowledge-centre" },
  ]);

  return (
    <>
      <script {...jsonLdScriptProps(breadcrumbJsonLd)} />
      <PageHero
        badge="Knowledge Centre"
        title="Guides on UAE and UK compliance."
        subhead="Practical, plain-language explainers — coming soon."
      />
      <KnowledgeCentreEmpty />
    </>
  );
}
