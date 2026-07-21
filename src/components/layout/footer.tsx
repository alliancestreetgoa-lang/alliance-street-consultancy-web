import Link from "next/link";
import { COMPANY, FOOTER_LINK_COLUMNS } from "@/lib/site-config";
import { Container } from "@/components/ui/container";

export function Footer() {
  return (
    <footer className="border-t border-glass-border bg-secondary/40">
      <Container className="grid gap-12 py-16 lg:grid-cols-[1.5fr_1fr_1fr_1fr]">
        <div className="flex flex-col gap-4">
          <span className="font-display text-lg font-semibold text-foreground">{COMPANY.name}</span>
          <p className="max-w-xs text-sm text-muted-foreground">
            UAE and UK company formation, tax, accounting, and advisory — built for founders who
            don&apos;t have time to get it wrong.
          </p>
          <ul className="flex flex-col gap-1 text-sm text-muted-foreground">
            <li>{COMPANY.address}</li>
            <li>
              <a href={`mailto:${COMPANY.email}`} className="hover:text-foreground">
                {COMPANY.email}
              </a>
            </li>
            <li>
              <a href={`tel:${COMPANY.phone.replace(/\s/g, "")}`} className="hover:text-foreground">
                {COMPANY.phone}
              </a>
              <span className="ml-2 text-xs text-primary/80">(placeholder)</span>
            </li>
          </ul>
        </div>

        {FOOTER_LINK_COLUMNS.map((column) => (
          <div key={column.title} className="flex flex-col gap-3">
            <span className="text-xs font-semibold uppercase tracking-widest text-foreground">{column.title}</span>
            <ul className="flex flex-col gap-2">
              {column.links.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm text-muted-foreground hover:text-foreground">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </Container>

      <div className="border-t border-glass-border py-6">
        <Container className="flex flex-col items-center justify-between gap-4 text-xs text-muted-foreground sm:flex-row">
          <span>
            © {new Date().getFullYear()} {COMPANY.name}. All rights reserved.
          </span>
          <div className="flex gap-6">
            <Link href="/privacy-policy" className="hover:text-foreground">
              Privacy Policy
            </Link>
            <Link href="/terms-and-conditions" className="hover:text-foreground">
              Terms &amp; Conditions
            </Link>
          </div>
        </Container>
      </div>
    </footer>
  );
}
