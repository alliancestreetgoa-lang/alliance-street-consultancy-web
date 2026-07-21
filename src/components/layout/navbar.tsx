// src/components/layout/navbar.tsx
"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { m, useScroll, useSpring } from "framer-motion";
import { Menu, X } from "lucide-react";
import { NAV_GROUPS, PRIMARY_NAV, type NavLink } from "@/lib/site-config";
import { Container } from "@/components/ui/container";
import { MagneticButton } from "@/components/ui/magnetic-button";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import { Sheet, SheetClose, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { useLenis } from "@/components/providers/smooth-scroll-provider";
import { cn } from "@/lib/utils";

function ServiceLink({ link }: { link: NavLink }) {
  return (
    <li>
      <NavigationMenuLink asChild>
        <Link
          href={link.href}
          className="block rounded-xl p-2.5 transition-colors hover:bg-foreground/5 focus:bg-foreground/5 focus:outline-none"
        >
          <span className="block text-sm font-medium text-foreground">{link.label}</span>
          {link.description ? (
            <span className="mt-1 block text-xs leading-snug text-muted-foreground">{link.description}</span>
          ) : null}
        </Link>
      </NavigationMenuLink>
    </li>
  );
}

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, { stiffness: 200, damping: 30 });
  const lenis = useLenis();

  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 12);
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.documentElement.style.overflow = mobileOpen ? "hidden" : "";
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    if (mobileOpen) {
      lenis?.stop();
    } else {
      lenis?.start();
    }
    return () => {
      document.documentElement.style.overflow = "";
      document.body.style.overflow = "";
      lenis?.start();
    };
  }, [mobileOpen, lenis]);

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-colors duration-300",
        scrolled ? "border-b border-glass-border bg-background/70 backdrop-blur-xl" : "bg-transparent"
      )}
    >
      <m.div className="absolute inset-x-0 top-0 h-[2px] origin-left bg-primary" style={{ scaleX: progress }} />
      <Container>
        <nav className="flex h-20 items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <Image src="/brand/logo-mark.png" alt="" width={28} height={23} priority className="h-7 w-auto" />
            <span className="font-display text-lg font-semibold tracking-tight text-foreground">Alliance Street</span>
          </Link>

          <div className="hidden lg:flex">
            <NavigationMenu>
              <NavigationMenuList>
                <NavigationMenuItem>
                  <NavigationMenuTrigger>Services</NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <div className="grid w-[760px] grid-cols-4 gap-6 p-8">
                      {NAV_GROUPS.map((group) => (
                        <div key={group.title} className="flex flex-col gap-3">
                          <span className="text-xs font-semibold uppercase tracking-widest text-primary">
                            {group.title}
                          </span>
                          <ul className="flex flex-col gap-1">
                            {group.links.map((link) => (
                              <ServiceLink key={link.href} link={link} />
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  </NavigationMenuContent>
                </NavigationMenuItem>

                {PRIMARY_NAV.map((link) => (
                  <NavigationMenuItem key={link.href}>
                    <NavigationMenuLink asChild className={navigationMenuTriggerStyle()}>
                      <Link href={link.href}>{link.label}</Link>
                    </NavigationMenuLink>
                  </NavigationMenuItem>
                ))}
              </NavigationMenuList>
            </NavigationMenu>
          </div>

          <div className="hidden lg:block">
            <MagneticButton href="/book-consultation">Book Consultation</MagneticButton>
          </div>

          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <button type="button" className="text-foreground lg:hidden" aria-label="Open menu">
                <Menu size={24} />
              </button>
            </SheetTrigger>
            <SheetContent className="lg:hidden">
              <SheetTitle className="sr-only">Site navigation</SheetTitle>
              <Container className="shrink-0">
                <div className="flex h-20 items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <Image src="/brand/logo-mark.png" alt="" width={24} height={20} className="h-5 w-auto" />
                    <span className="font-display text-lg font-semibold text-foreground">Alliance Street</span>
                  </div>
                  <SheetClose asChild>
                    <button type="button" className="text-foreground" aria-label="Close menu">
                      <X size={24} />
                    </button>
                  </SheetClose>
                </div>
              </Container>
              <Container className="flex-1 overflow-y-auto">
                <div className="flex flex-col gap-6 pb-8">
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
            </SheetContent>
          </Sheet>
        </nav>
      </Container>
    </header>
  );
}
