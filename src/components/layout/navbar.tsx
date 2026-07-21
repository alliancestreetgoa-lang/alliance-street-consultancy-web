// src/components/layout/navbar.tsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion, useScroll, useSpring } from "framer-motion";
import { Menu, X } from "lucide-react";
import { NAV_GROUPS, PRIMARY_NAV } from "@/lib/site-config";
import { Container } from "@/components/ui/container";
import { MagneticButton } from "@/components/ui/magnetic-button";
import { cn } from "@/lib/utils";

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [servicesOpen, setServicesOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, { stiffness: 200, damping: 30 });

  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 12);
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  function handleServicesMouseEnter() {
    if (typeof window !== "undefined" && window.matchMedia("(hover: hover)").matches) {
      setServicesOpen(true);
    }
  }

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-colors duration-300",
        scrolled ? "border-b border-glass-border bg-background/70 backdrop-blur-xl" : "bg-transparent"
      )}
      onMouseLeave={() => setServicesOpen(false)}
    >
      <motion.div className="absolute inset-x-0 top-0 h-[2px] origin-left bg-primary" style={{ scaleX: progress }} />
      <Container>
        <nav className="flex h-20 items-center justify-between">
          <Link href="/" className="font-display text-lg font-semibold tracking-tight text-foreground">
            Alliance Street
          </Link>

          <div className="hidden items-center gap-8 lg:flex">
            <div className="relative" onMouseEnter={handleServicesMouseEnter}>
              <button
                type="button"
                className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                aria-expanded={servicesOpen}
                aria-haspopup="true"
                aria-controls="services-menu"
                onClick={() => setServicesOpen((open) => !open)}
                onKeyDown={(event) => {
                  if (event.key === "Escape") {
                    setServicesOpen(false);
                  }
                }}
              >
                Services
              </button>
              <AnimatePresence>
                {servicesOpen ? (
                  <motion.div
                    id="services-menu"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 8 }}
                    transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                    className="absolute left-1/2 top-full mt-4 w-[720px] -translate-x-1/2 rounded-2xl border border-glass-border bg-secondary/95 p-8 shadow-2xl backdrop-blur-xl"
                  >
                    <div className="grid grid-cols-4 gap-6">
                      {NAV_GROUPS.map((group) => (
                        <div key={group.title} className="flex flex-col gap-3">
                          <span className="text-xs font-semibold uppercase tracking-widest text-primary">
                            {group.title}
                          </span>
                          <ul className="flex flex-col gap-2">
                            {group.links.map((link) => (
                              <li key={link.href}>
                                <Link href={link.href} className="text-sm text-muted-foreground transition-colors hover:text-foreground">
                                  {link.label}
                                </Link>
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                ) : null}
              </AnimatePresence>
            </div>

            {PRIMARY_NAV.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
              >
                {link.label}
              </Link>
            ))}
          </div>

          <div className="hidden lg:block">
            <MagneticButton href="/book-consultation">Book Consultation</MagneticButton>
          </div>

          <button
            type="button"
            className="text-foreground lg:hidden"
            onClick={() => setMobileOpen(true)}
            aria-label="Open menu"
          >
            <Menu size={24} />
          </button>
        </nav>
      </Container>

      <AnimatePresence>
        {mobileOpen ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-background/95 backdrop-blur-xl lg:hidden"
          >
            <Container>
              <div className="flex h-20 items-center justify-between">
                <span className="font-display text-lg font-semibold text-foreground">Alliance Street</span>
                <button type="button" className="text-foreground" onClick={() => setMobileOpen(false)} aria-label="Close menu">
                  <X size={24} />
                </button>
              </div>
              <div className="flex flex-col gap-6 py-8">
                {NAV_GROUPS.map((group) => (
                  <div key={group.title} className="flex flex-col gap-3">
                    <span className="text-xs font-semibold uppercase tracking-widest text-primary">{group.title}</span>
                    <ul className="flex flex-col gap-2">
                      {group.links.map((link) => (
                        <li key={link.href}>
                          <Link href={link.href} className="text-base text-foreground/90" onClick={() => setMobileOpen(false)}>
                            {link.label}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
                <div className="flex flex-col gap-3 border-t border-glass-border pt-6">
                  {PRIMARY_NAV.map((link) => (
                    <Link key={link.href} href={link.href} className="text-base text-foreground/90" onClick={() => setMobileOpen(false)}>
                      {link.label}
                    </Link>
                  ))}
                </div>
                <MagneticButton href="/book-consultation" onClick={() => setMobileOpen(false)}>
                  Book Consultation
                </MagneticButton>
              </div>
            </Container>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </header>
  );
}
