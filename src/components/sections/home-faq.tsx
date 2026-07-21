import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";

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
    <section className="py-24 sm:py-32">
      <Container className="mx-auto flex max-w-3xl flex-col gap-16">
        <SectionHeading
          eyebrow="FAQ"
          title="Common questions, answered plainly."
          align="center"
          className="mx-auto"
        />
        <Accordion type="single" collapsible className="w-full">
          {FAQS.map((faq, index) => (
            <AccordionItem key={faq.question} value={`item-${index}`}>
              <AccordionTrigger className="text-left font-display text-lg text-foreground">
                {faq.question}
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground">{faq.answer}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </Container>
    </section>
  );
}
