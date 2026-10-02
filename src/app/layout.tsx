// src/app/layout.tsx
import type { Metadata } from "next";
import { Inter, Space_Mono } from "next/font/google";
import { LazyMotion, domAnimation } from "framer-motion";
import "./globals.css";
import { SmoothScrollProvider } from "@/components/providers/smooth-scroll-provider";
import { SiteIntro } from "@/components/layout/site-intro";
import { Navbar } from "@/components/layout/navbar";
import { SiteFooter } from "@/components/ui/site-footer";
import { SITE_URL, IS_PREVIEW_SITE } from "@/lib/site-url";
import { SEO } from "@/lib/content";
import { buildOrganizationJsonLd, buildWebsiteJsonLd, jsonLdScriptProps } from "@/lib/schema";
import { THEME, accentCss } from "@/lib/theme";

const PREVIEW_LABEL = process.env.NEXT_PUBLIC_PREVIEW_LABEL;

// Space Mono carries the live site's eyebrows and small-caps labels.
const spaceMono = Space_Mono({
  variable: "--font-space-mono",
  weight: ["400", "700"],
  subsets: ["latin"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  // Required for the relative `alternates.canonical` and OG URLs that each
  // page sets — without it, relative URL-based metadata is a build error.
  // Points at the GH Pages fallback until a real domain is configured; see
  // src/lib/site-url.ts.
  metadataBase: new URL(SITE_URL),
  robots: IS_PREVIEW_SITE
    ? { index: false, follow: true }
    : { index: true, follow: true, googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1, "max-video-preview": -1 } },
  verification: {
    google: process.env.GOOGLE_SITE_VERIFICATION,
    other: process.env.BING_SITE_VERIFICATION ? { "msvalidate.01": process.env.BING_SITE_VERIFICATION } : undefined,
  },
  title: {
    // `default` applies to any route that doesn't set its own title;
    // `template` wraps the ones that do, so pages declare only their own name.
    default: SEO.defaultTitle,
    template: SEO.titleTemplate,
  },
  description: SEO.defaultDescription,
  // NOTE: deliberately no `alternates.canonical` here. Metadata is inherited by
  // routes that don't override it, so a canonical set at the layout level would
  // make every page without its own canonical claim to be the homepage — worse
  // than having no canonical at all. Each route sets its own self-referencing
  // canonical instead, including `/` below in src/app/page.tsx.
  openGraph: {
    type: "website",
    siteName: SEO.siteName,
    locale: "en_GB",
    images: [{ url: `${SITE_URL}${SEO.shareImage.src}`, alt: SEO.shareImage.alt }],
    title: SEO.defaultTitle,
    description: SEO.defaultDescription,
  },
  twitter: {
    card: "summary_large_image",
    images: [`${SITE_URL}${SEO.shareImage.src}`],
    title: SEO.defaultTitle,
    description: SEO.defaultDescription,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${spaceMono.variable} ${inter.variable} h-full antialiased`}
      data-motion={THEME.motion}
      data-spacing={THEME.sectionSpacing}
      data-text-size={THEME.textSize}
      data-font={THEME.font}
    >
      <head>
        {/* Brand accent from the CMS theme settings — a vetted preset, see lib/theme.ts. */}
        <style>{accentCss()}</style>
      </head>
      <body className="flex min-h-full flex-col bg-background text-foreground">
        {/* Entity-level schema — rendered on every route so the Organization
            and WebSite nodes other pages reference by @id always resolve. */}
        <script {...jsonLdScriptProps(buildOrganizationJsonLd())} />
        <script {...jsonLdScriptProps(buildWebsiteJsonLd())} />
        {THEME.openingAnimation ? <SiteIntro /> : null}
        <LazyMotion features={domAnimation} strict>
          <SmoothScrollProvider>
            <Navbar />
            <main className="flex-1 pt-20">{children}</main>
            <SiteFooter />
          </SmoothScrollProvider>
        </LazyMotion>
        {PREVIEW_LABEL ? (
          // Draft previews only (set by deploy-pages.yml). Never in the live build.
          <div role="note" className="fixed inset-x-0 bottom-0 z-[90] bg-black px-4 py-2 text-center text-sm text-white">
            Preview of an unpublished change ({PREVIEW_LABEL}) — not the live website.
          </div>
        ) : null}
      </body>
    </html>
  );
}
