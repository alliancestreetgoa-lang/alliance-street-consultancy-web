import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/ui/scroll-reveal";
import { asset } from "@/lib/asset-path";
import leadership from "@/content/sections/about-leadership.json";

export function AboutLeadership() {
  return (
    <section aria-labelledby="leadership-title" className="bg-secondary/40 py-20 sm:py-28">
      <Container>
        <div className="grid items-center gap-10 lg:grid-cols-[.85fr_1.15fr] lg:gap-20">
          <Reveal className="mx-auto w-full max-w-md">
            <div className="as-neon-card overflow-hidden rounded-2xl bg-white">
              <Image src={asset(leadership.image)} alt={leadership.imageAlt} width={635} height={781}
                sizes="(min-width: 1024px) 448px, (min-width: 640px) 448px, 90vw"
                className="h-auto w-full object-contain" />
            </div>
          </Reveal>
          <Reveal className="flex flex-col items-start gap-6">
            <span className="as-eyebrow">Meet our <span className="as-eyebrow-accent">CEO</span></span>
            <div className="flex flex-col gap-3">
              <h2 id="leadership-title" className="text-4xl font-semibold tracking-tight sm:text-5xl">{leadership.name}</h2>
              <p className="text-lg font-medium text-primary">{leadership.role} · {leadership.organisation}</p>
            </div>
            <div className="space-y-4 text-base leading-relaxed text-muted-foreground">
              {leadership.paragraphs.map(paragraph => <p key={paragraph}>{paragraph}</p>)}
            </div>
            <div className="mt-2 flex flex-wrap items-center gap-4">
              <Button asChild><Link href="/book-appointment">Start a Conversation <ArrowUpRight aria-hidden /></Link></Button>
              <Button variant="outline" asChild><a href={leadership.profileUrl} target="_blank" rel="noopener noreferrer">Read Stallone’s story <ArrowUpRight aria-hidden /></a></Button>
              <Button variant="outline" size="icon" className="size-11" asChild><a href={leadership.linkedinUrl} target="_blank" rel="noopener noreferrer" aria-label="LinkedIn (opens in a new tab)" title="LinkedIn"><svg viewBox="0 0 24 24" fill="currentColor" className="size-5" aria-hidden="true"><path d="M20.45 2H3.55C2.69 2 2 2.68 2 3.52v16.96c0 .84.69 1.52 1.55 1.52h16.9c.86 0 1.55-.68 1.55-1.52V3.52c0-.84-.69-1.52-1.55-1.52ZM7.93 18.75H4.98V9.2h2.95v9.55ZM6.45 7.9a1.71 1.71 0 1 1 0-3.42 1.71 1.71 0 0 1 0 3.42Zm12.3 10.85H15.8V14.1c0-1.11-.02-2.54-1.55-2.54-1.55 0-1.79 1.21-1.79 2.46v4.73H9.51V9.2h2.83v1.3h.04c.4-.76 1.36-1.56 2.79-1.56 2.98 0 3.58 1.96 3.58 4.5v5.31Z" /></svg></a></Button>
              <Button variant="outline" size="icon" className="size-11" asChild><a href={leadership.instagramUrl} target="_blank" rel="noopener noreferrer" aria-label="Instagram (opens in a new tab)" title="Instagram"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="size-5" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="5" /><circle cx="12" cy="12" r="4" /><circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" /></svg></a></Button>
              <Button variant="outline" size="icon" className="size-11" asChild><a href={leadership.youtubeUrl} target="_blank" rel="noopener noreferrer" aria-label="YouTube (opens in a new tab)" title="YouTube"><svg viewBox="0 0 24 24" fill="currentColor" className="size-5" aria-hidden="true"><path fillRule="evenodd" d="M21.58 7.19a2.77 2.77 0 0 0-1.95-1.96C17.9 4.77 12 4.77 12 4.77s-5.9 0-7.63.46a2.77 2.77 0 0 0-1.95 1.96A28.8 28.8 0 0 0 2 12a28.8 28.8 0 0 0 .42 4.81 2.77 2.77 0 0 0 1.95 1.96c1.73.46 7.63.46 7.63.46s5.9 0 7.63-.46a2.77 2.77 0 0 0 1.95-1.96A28.8 28.8 0 0 0 22 12a28.8 28.8 0 0 0-.42-4.81ZM10 15.25l5.5-3.25L10 8.75v6.5Z" clipRule="evenodd" /></svg></a></Button>
            </div>
          </Reveal>
        </div>
      </Container>
    </section>
  );
}
