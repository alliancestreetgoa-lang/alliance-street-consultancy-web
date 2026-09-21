import { ChevronDownIcon } from "lucide-react";
import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";
import { Stagger, StaggerItem } from "@/components/ui/scroll-reveal";
import { AmbientGlow } from "@/components/ui/ambient-glow";

const FAQS = [
  {
    question: "How long does UAE company formation take?",
    answer:
      "Most free zone and mainland formations complete within 1–3 weeks once documents are submitted, though bank account opening can add further time depending on the bank and your business activity.",
  },
  {
    question: "Free zone or mainland — which should I choose?",
    answer:
      "It depends on where you plan to trade. Free zone entities suit businesses trading internationally or within the zone; mainland entities suit businesses trading directly within the UAE market. We'll walk through this on your discovery call.",
  },
  {
    question: "Do you handle both UAE and UK entities?",
    answer:
      "Yes — this is one of the reasons clients work with us. If you're structuring across both markets, you get one advisory relationship instead of coordinating two separate firms.",
  },
  {
    question: "What's included in your accounting and bookkeeping service?",
    answer:
      "Monthly bookkeeping, VAT return preparation and filing, and management reporting, with corporate tax and statutory accounts handled as part of your annual compliance.",
  },
  {
    question: "Do you offer support after the company is registered?",
    answer:
      "Yes. Company formation is the start, not the end — we continue as your accountant and compliance partner for VAT, tax, payroll, and renewals.",
  },
  {
    question: "How do I get started?",
    answer:
      "Book a consultation and we'll walk through your business, the right structure, and a clear next-step plan before you commit to anything.",
  },
];

export function HomeFAQ() {
  return (
    <section className="relative overflow-hidden py-24 sm:py-32">
      <AmbientGlow className="opacity-30" />
      <Container className="relative z-10 mx-auto flex max-w-3xl flex-col gap-16">
        <SectionHeading
          eyebrow="FAQ"
          title="Common questions, answered plainly."
          align="center"
          className="mx-auto"
        />
        {/*
          Native <details>/<summary> rather than the Radix Accordion.

          Radix's Accordion.Content only mounts its children once a panel opens,
          and nothing here opens by default — so every answer was absent from the
          server-rendered HTML, present only inside the hydration payload. The
          crawlers that would most want this content (GPTBot, ClaudeBot,
          PerplexityBot, CCBot) don't execute JavaScript, so they received six
          questions and zero answers.

          <details> keeps the answer in the markup while collapsed, works with no
          JS at all, and carries the right semantics and keyboard behaviour for
          free. This is the single most citable block on the site; it should not
          depend on hydration.
        */}
        <Stagger className="w-full">
          {FAQS.map((faq) => (
            <StaggerItem key={faq.question}>
              <details className="group not-last:border-b border-border">
                <summary className="flex cursor-pointer list-none items-start justify-between gap-4 py-2.5 text-left text-lg text-foreground outline-none [&::-webkit-details-marker]:hidden focus-visible:ring-3 focus-visible:ring-ring/50 hover:underline">
                  <h3 className="text-lg font-semibold">{faq.question}</h3>
                  <ChevronDownIcon
                    aria-hidden="true"
                    className="mt-1 size-4 shrink-0 text-muted-foreground transition-transform duration-200 group-open:rotate-180 motion-reduce:transition-none"
                  />
                </summary>
                <div className="pb-2.5 text-sm text-muted-foreground">{faq.answer}</div>
              </details>
            </StaggerItem>
          ))}
        </Stagger>
      </Container>
    </section>
  );
}
