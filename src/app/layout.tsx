// src/app/layout.tsx
import type { Metadata } from "next";
import { Geist, Inter } from "next/font/google";
import { LazyMotion, domAnimation } from "framer-motion";
import "./globals.css";
import { SmoothScrollProvider } from "@/components/providers/smooth-scroll-provider";
import { Navbar } from "@/components/layout/navbar";
import { CinematicFooter } from "@/components/ui/motion-footer";
import { SITE_URL } from "@/lib/site-url";
import { buildOrganizationJsonLd, buildWebsiteJsonLd, jsonLdScriptProps } from "@/lib/schema";

const geist = Geist({
  variable: "--font-geist",
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
  title: {
    // `default` applies to any route that doesn't set its own title;
    // `template` wraps the ones that do, so pages declare only their own name.
    default: "Alliance Street Consultancy | UAE & UK Company Formation, Tax & Accounting",
    template: "%s | Alliance Street Consultancy",
  },
  description:
    "Premium UAE and UK business setup, tax, accounting, and advisory services for founders and enterprises.",
  // NOTE: deliberately no `alternates.canonical` here. Metadata is inherited by
  // routes that don't override it, so a canonical set at the layout level would
  // make every page without its own canonical claim to be the homepage — worse
  // than having no canonical at all. Each route sets its own self-referencing
  // canonical instead, including `/` below in src/app/page.tsx.
  openGraph: {
    type: "website",
    siteName: "Alliance Street Consultancy",
    locale: "en",
    title: "Alliance Street Consultancy | UAE & UK Company Formation, Tax & Accounting",
    description:
      "Premium UAE and UK business setup, tax, accounting, and advisory services for founders and enterprises.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Alliance Street Consultancy | UAE & UK Company Formation, Tax & Accounting",
    description:
      "Premium UAE and UK business setup, tax, accounting, and advisory services for founders and enterprises.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${geist.variable} ${inter.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col bg-background text-foreground">
        {/* Entity-level schema — rendered on every route so the Organization
            and WebSite nodes other pages reference by @id always resolve. */}
        <script {...jsonLdScriptProps(buildOrganizationJsonLd())} />
        <script {...jsonLdScriptProps(buildWebsiteJsonLd())} />
        <LazyMotion features={domAnimation} strict>
          <SmoothScrollProvider>
            <Navbar />
            <main className="flex-1 pt-20">{children}</main>
            <CinematicFooter />
          </SmoothScrollProvider>
        </LazyMotion>
      </body>
    </html>
  );
}
