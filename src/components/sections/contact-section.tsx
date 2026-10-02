"use client";

import { useState } from "react";
import { CalendarDays } from "lucide-react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { Card } from "@/components/ui/card";
import { Reveal } from "@/components/ui/scroll-reveal";
import { AmbientGlow } from "@/components/ui/ambient-glow";
import { COMPANY } from "@/lib/site-config";
import { FORMS } from "@/lib/content/settings";
import { fill } from "@/lib/content/fill";
import { SmartLink } from "@/components/ui/smart-link";
import type { SectionOf } from "@/lib/content/page-schema";
import { cn } from "@/lib/utils";

const contactSchema = z.object({
  name: z.string().min(1, "Enter your name."),
  email: z.string().email("Enter a valid email address."),
  message: z.string().min(10, "Tell us a little about what you need."),
});

type ContactValues = z.infer<typeof contactSchema>;

export function ContactSection({ section }: { section: SectionOf<"contact"> }) {
  const copy = FORMS.contact;
  const [submitted, setSubmitted] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<ContactValues>({
    resolver: zodResolver(contactSchema),
  });

  function onSubmit() {
    setSubmitted(true);
    reset();
  }

  return (
    <section className="relative overflow-hidden py-24 sm:py-32">
      <AmbientGlow className="opacity-30" />
      <Container className="relative z-10 grid gap-12 lg:grid-cols-[5fr_7fr] lg:gap-16">
        <Reveal className="flex flex-col gap-8">
          <div className="flex flex-col gap-2">
            {section.eyebrow ? <span className="text-sm font-medium uppercase tracking-widest text-primary">{section.eyebrow}</span> : null}
            <p className="text-muted-foreground">{COMPANY.address}</p>
          </div>
          <div className="flex flex-col gap-3 text-sm">
            <a href={`mailto:${COMPANY.email}`} className="text-foreground hover:text-primary">
              {COMPANY.email}
            </a>
            <a href={`tel:${COMPANY.phoneHref}`} className="text-foreground hover:text-primary">
              {COMPANY.phone}
            </a>
            {COMPANY.whatsapp && (
              <a
                href={`https://wa.me/${COMPANY.whatsapp.replace(/[^\d]/g, "")}`}
                className="text-foreground hover:text-primary"
              >
                WhatsApp: {COMPANY.whatsapp}
              </a>
            )}
          </div>
          <div className="border-t border-border pt-8">
            <h2 className="text-2xl font-semibold tracking-tight">{section.conversationHeading}</h2>
            <p className="mt-3 max-w-sm text-muted-foreground">{section.conversationBody}</p>
            <Button asChild className="mt-5" size="lg"><SmartLink href={section.conversationButton.href}><CalendarDays aria-hidden /> {section.conversationButton.label}</SmartLink></Button>
          </div>
        </Reveal>

        {section.showMessageForm ? <Reveal delay={0.1}>
        <Card variant="glass" hover={false}>
          {submitted ? (
            <p className="text-primary">{fill(copy.notConnectedMessage)}</p>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5" noValidate>
              <div>
                <label htmlFor="contact-name" className="mb-2 block text-sm text-foreground/90">
                  {copy.labels.name}
                </label>
                <input
                  id="contact-name"
                  type="text"
                  aria-invalid={errors.name ? "true" : "false"}
                  aria-describedby="contact-name-error"
                  className={cn(
                    "w-full rounded-xl border border-glass-border bg-foreground/5 px-4 py-3 text-sm text-foreground focus:border-primary focus:outline-none",
                    errors.name && "border-destructive"
                  )}
                  {...register("name")}
                />
                {errors.name ? (
                  <p id="contact-name-error" role="alert" className="mt-2 text-xs text-destructive">
                    {errors.name.message}
                  </p>
                ) : null}
              </div>
              <div>
                <label htmlFor="contact-email" className="mb-2 block text-sm text-foreground/90">
                  {copy.labels.email}
                </label>
                <input
                  id="contact-email"
                  type="email"
                  aria-invalid={errors.email ? "true" : "false"}
                  aria-describedby="contact-email-error"
                  className={cn(
                    "w-full rounded-xl border border-glass-border bg-foreground/5 px-4 py-3 text-sm text-foreground focus:border-primary focus:outline-none",
                    errors.email && "border-destructive"
                  )}
                  {...register("email")}
                />
                {errors.email ? (
                  <p id="contact-email-error" role="alert" className="mt-2 text-xs text-destructive">
                    {errors.email.message}
                  </p>
                ) : null}
              </div>
              <div>
                <label htmlFor="contact-message" className="mb-2 block text-sm text-foreground/90">
                  {copy.labels.message}
                </label>
                <textarea
                  id="contact-message"
                  rows={5}
                  aria-invalid={errors.message ? "true" : "false"}
                  aria-describedby="contact-message-error"
                  className={cn(
                    "w-full rounded-xl border border-glass-border bg-foreground/5 px-4 py-3 text-sm text-foreground focus:border-primary focus:outline-none",
                    errors.message && "border-destructive"
                  )}
                  {...register("message")}
                />
                {errors.message ? (
                  <p id="contact-message-error" role="alert" className="mt-2 text-xs text-destructive">
                    {errors.message.message}
                  </p>
                ) : null}
              </div>
              <Button size="lg" className="self-start" onClick={handleSubmit(onSubmit)}>{isSubmitting ? copy.sendingButton : copy.submitButton}</Button>
            </form>
          )}
        </Card>
        </Reveal> : null}
      </Container>
    </section>
  );
}
