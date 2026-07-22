import { Container } from "@/components/ui/container";
import { FramedImage } from "@/components/ui/framed-image";

const PRINCIPLES = [
  {
    title: "We say the real number first.",
    description: "Cost, timeline, and risk get named before you commit — not discovered on an invoice.",
  },
  {
    title: "One advisor, not a queue.",
    description: "The person who scopes your engagement is the person who answers when something's wrong.",
  },
  {
    title: "Compliance is the floor, not the pitch.",
    description: "Getting you licensed is table stakes. The work that matters starts after.",
  },
];

export function AboutStory() {
  return (
    <section className="py-24 sm:py-32">
      <Container className="grid gap-12 lg:grid-cols-[7fr_5fr] lg:gap-16">
        <div className="flex flex-col gap-6">
          <span className="text-sm font-medium uppercase tracking-widest text-primary">
            Our Story
          </span>
          <p className="text-2xl font-display font-medium leading-snug text-foreground">
            Alliance Street started in Business Bay because two markets full of founders were
            getting the same bad deal.
          </p>
          <p className="text-muted-foreground">
            UAE free zones move fast, but the advice around them often doesn&apos;t: generic
            packages, upsold add-ons, and a setup agent who disappears the moment your licence
            prints. UK incorporation has the opposite problem — accurate, but disconnected from
            what&apos;s actually happening on the ground in Dubai for founders running both.
          </p>
          <p className="text-muted-foreground">
            We built Alliance Street to close that gap: one advisory relationship that understands
            UAE structuring and UK compliance well enough to plan across both, and stays on after
            the paperwork is filed to handle the tax, accounting, and questions that come after.
          </p>
        </div>
        <div className="flex flex-col gap-8">
          <FramedImage
            src="/brand/consultant.jpg"
            alt="Alliance Street advisor"
            aspectClassName="aspect-[4/3]"
            sizes="(min-width: 1024px) 420px, 100vw"
          />
          <div className="flex flex-col gap-8 rounded-2xl border border-glass-border bg-secondary/40 p-8">
            {PRINCIPLES.map((principle) => (
              <div key={principle.title} className="flex flex-col gap-2">
                <h3 className="font-display text-lg font-medium text-foreground">{principle.title}</h3>
                <p className="text-sm text-muted-foreground">{principle.description}</p>
              </div>
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
}
