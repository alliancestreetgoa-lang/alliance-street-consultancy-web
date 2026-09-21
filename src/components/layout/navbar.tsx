// src/components/layout/navbar.tsx
"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { m, useScroll, useSpring } from "framer-motion";
import { Menu, X } from "lucide-react";
import { NAV_GROUPS, PRIMARY_NAV, type NavLink } from "@/lib/site-config";
import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";
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
import { asset } from "@/lib/asset-path";
import { cn } from "@/lib/utils";

// The live site's nav links are dark chips on the black bar, not bare text.
const NAV_CHIP =
  "rounded-full bg-white/10 px-4 text-sm font-medium text-foreground hover:bg-white/20 data-[state=open]:bg-white/20";

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

  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 12);
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Safety net: Radix's own scroll-lock cleanup runs on an animation-frame
  // timer that browsers can indefinitely defer while a tab is backgrounded
  // (e.g. the user switches apps mid-close on mobile). If that happens, the
  // lock can outlive the closed menu. This never sets the lock — it only
  // clears a stuck one after the close transition has had time to finish.
  useEffect(() => {
    if (mobileOpen) return;
    const timer = setTimeout(() => {
      const stillOpen = document.querySelector('[data-slot="sheet-content"][data-state="open"]');
      if (!stillOpen && document.body.hasAttribute("data-scroll-locked")) {
        document.body.removeAttribute("data-scroll-locked");
        document.body.style.removeProperty("overflow");
        document.body.style.removeProperty("padding-right");
        document.body.style.removeProperty("margin-right");
      }
    }, 600);
    return () => clearTimeout(timer);
  }, [mobileOpen]);

  return (
    <header
      className={cn(
        // The live nav is solid black at every scroll position — it never goes
        // transparent — so `scrolled` only earns the hairline and the shadow.
        "surface-dark fixed inset-x-0 top-0 z-50 bg-background text-foreground transition-shadow duration-300",
        scrolled ? "border-b border-border shadow-card" : ""
      )}
    >
      <m.div className="absolute inset-x-0 top-0 h-[2px] origin-left bg-primary" style={{ scaleX: progress }} />
      <Container>
        <nav className="flex h-20 items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <Image
              src={asset("/brand/logo-mark.png")}
              alt=""
              width={34}
              height={28}
              priority
              style={{ width: "34px", height: "28px" }}
            />
            <span className="text-lg font-semibold text-foreground">Alliance Street</span>
          </Link>

          <div className="hidden lg:flex">
            <NavigationMenu>
              <NavigationMenuList>
                <NavigationMenuItem>
                  <NavigationMenuTrigger className={NAV_CHIP}>Services</NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <div className="grid w-[760px] grid-cols-4 gap-6 p-8">
                      {NAV_GROUPS.map((group) => (
                        <div key={group.title} className="flex flex-col gap-3">
                          <span className="as-eyebrow as-eyebrow-accent text-[0.6875rem]">
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
                    <NavigationMenuLink
                      asChild
                      className={cn(navigationMenuTriggerStyle(), NAV_CHIP)}
                    >
                      <Link href={link.href}>{link.label}</Link>
                    </NavigationMenuLink>
                  </NavigationMenuItem>
                ))}
              </NavigationMenuList>
            </NavigationMenu>
          </div>

          <div className="hidden lg:block">
            <Button asChild>
              <Link href="/book-consultation">Book Consultation</Link>
            </Button>
          </div>

          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <button type="button" className="text-foreground lg:hidden" aria-label="Open menu">
                <Menu size={24} />
              </button>
            </SheetTrigger>
            <SheetContent className="surface-dark bg-background text-foreground lg:hidden">
              <SheetTitle className="sr-only">Site navigation</SheetTitle>
              <Container className="shrink-0">
                <div className="flex h-20 items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <Image
                      src={asset("/brand/logo-mark.png")}
                      alt=""
                      width={24}
                      height={20}
                      style={{ width: "24px", height: "20px" }}
                    />
                    <span className="text-lg font-semibold text-foreground">Alliance Street</span>
                  </div>
                  <SheetClose asChild>
                    <button type="button" className="text-foreground" aria-label="Close menu">
                      <X size={24} />
                    </button>
                  </SheetClose>
                </div>
              </Container>
              <Container className="flex-1 overflow-y-auto">
                {/* Primary pages first. The twenty service links used to sit
                    above these, which pushed Pricing and Contact roughly 920px
                    down inside the panel — someone opening the menu to reach
                    Contact had to scroll the entire services taxonomy first. */}
                <div className="flex flex-col gap-6 pb-8">
                  <div className="flex flex-col">
                    {PRIMARY_NAV.map((link) => (
                      <Link
                        key={link.href}
                        href={link.href}
                        className="flex min-h-11 items-center text-base text-foreground/90"
                        onClick={() => setMobileOpen(false)}
                      >
                        {link.label}
                      </Link>
                    ))}
                  </div>
                  {NAV_GROUPS.map((group) => (
                    <div key={group.title} className="flex flex-col gap-1 border-t border-glass-border pt-6">
                      <span className="as-eyebrow as-eyebrow-accent text-[0.6875rem]">{group.title}</span>
                      <ul className="flex flex-col">
                        {group.links.map((link) => (
                          <li key={link.href}>
                            {/* min-h-11 = 44px, the standard minimum touch
                                target. These were 20–24px tall. */}
                            <Link
                              href={link.href}
                              className="flex min-h-11 items-center text-base text-foreground/90"
                              onClick={() => setMobileOpen(false)}
                            >
                              {link.label}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                  <Button asChild className="w-full">
                    <Link href="/book-consultation" onClick={() => setMobileOpen(false)}>
                      Book Consultation
                    </Link>
                  </Button>
                </div>
              </Container>
            </SheetContent>
          </Sheet>
        </nav>
      </Container>
    </header>
  );
}
