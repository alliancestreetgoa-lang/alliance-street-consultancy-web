import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";
import { MagneticButton } from "@/components/ui/magnetic-button";

const SERVICES = [
  {
    title: "Free Zone Company Formation",
    description: "Set up in a UAE free zone with 100% foreign ownership.",
    href: "/services/uae/free-zone-company-formation",
  },
  {
    title: "Corporate Tax",
    description: "Registration, filing, and planning that keeps you compliant as UAE tax rules evolve.",
    href: "/services/uae/corporate-tax",
  },
  {
    title: "UK Company Formation",
    description: "Incorporate with Companies House and get accounting support from day one.",
    href: "/services/uk/company-formation",
  },
  {
    title: "CFO Services",
    description: "Fractional finance leadership for founders who need strategy, not just bookkeeping.",
    href: "/services/advisory/cfo-services",
  },
];

export function ServicePreview() {
  return (
    <section className="py-24 sm:py-32">
      <Container className="flex flex-col gap-16">
        <div className="flex flex-col items-center justify-between gap-6 sm:flex-row sm:items-end">
          <SectionHeading eyebrow="Services" title="Where clients start with us." />
          <MagneticButton href="/services" variant="ghost">
            View All Services
          </MagneticButton>
        </div>
        <div className="grid gap-6 sm:grid-cols-2">
          {SERVICES.map((service) => (
            <Link
              key={service.href}
              href={service.href}
              className="group flex flex-col justify-between gap-6 rounded-2xl border border-glass-border bg-secondary/40 p-8 transition-colors hover:bg-secondary/70"
            >
              <div>
                <h3 className="font-display text-xl font-medium text-foreground">{service.title}</h3>
                <p className="mt-3 text-muted-foreground">{service.description}</p>
              </div>
              <ArrowUpRight
                className="h-5 w-5 text-primary transition-transform group-hover:-translate-y-1 group-hover:translate-x-1"
                aria-hidden
              />
            </Link>
          ))}
        </div>
      </Container>
    </section>
  );
}
