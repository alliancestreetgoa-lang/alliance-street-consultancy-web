// src/app/layout.tsx
import type { Metadata } from "next";
import { Geist, Inter } from "next/font/google";
import { LazyMotion, domAnimation } from "framer-motion";
import "./globals.css";
import { SmoothScrollProvider } from "@/components/providers/smooth-scroll-provider";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";

const geist = Geist({
  variable: "--font-geist",
  subsets: ["latin"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Alliance Street Consultancy | UAE & UK Company Formation, Tax & Accounting",
  description:
    "Premium UAE and UK business setup, tax, accounting, and advisory services for founders and enterprises.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${geist.variable} ${inter.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col bg-background text-foreground">
        <LazyMotion features={domAnimation} strict>
          <SmoothScrollProvider>
            <Navbar />
            <main className="flex-1 pt-20">{children}</main>
            <Footer />
          </SmoothScrollProvider>
        </LazyMotion>
      </body>
    </html>
  );
}
