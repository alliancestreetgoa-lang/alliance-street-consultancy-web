"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Container } from "@/components/ui/container";
import { MagneticButton } from "@/components/ui/magnetic-button";
import { Card } from "@/components/ui/card";
import { FramedImage } from "@/components/ui/framed-image";
import { COMPANY } from "@/lib/site-config";
import { cn } from "@/lib/utils";

const contactSchema = z.object({
  name: z.string().min(1, "Enter your name."),
  email: z.string().email("Enter a valid email address."),
  message: z.string().min(10, "Tell us a little about what you need."),
});

type ContactValues = z.infer<typeof contactSchema>;

export function ContactSection() {
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
    <section className="py-24 sm:py-32">
      <Container className="grid gap-12 lg:grid-cols-[5fr_7fr] lg:gap-16">
        <div className="flex flex-col gap-8">
          <div className="flex flex-col gap-2">
            <span className="text-sm font-medium uppercase tracking-widest text-primary">Reach Us Directly</span>
            <p className="text-muted-foreground">{COMPANY.address}</p>
          </div>
          <div className="flex flex-col gap-3 text-sm">
            <a href={`mailto:${COMPANY.email}`} className="text-foreground hover:text-primary">
              {COMPANY.email}
            </a>
            <span className="text-muted-foreground">
              {COMPANY.phone} <span className="text-xs text-primary/80">(placeholder)</span>
            </span>
            <span className="text-muted-foreground">
              WhatsApp: {COMPANY.whatsapp} <span className="text-xs text-primary/80">(placeholder)</span>
            </span>
          </div>
          <FramedImage
            src="/brand/dubai-skyline.png"
            alt="Dubai skyline including the Burj Khalifa and Burj Al Arab"
            caption="Business Bay, Dubai"
            aspectClassName="aspect-[4/3]"
            sizes="(min-width: 1024px) 420px, 100vw"
          />
        </div>

        <Card hover={false}>
          {submitted ? (
            <p className="text-primary">
              Thanks — this form isn&apos;t wired to send yet. Email{" "}
              <a href={`mailto:${COMPANY.email}`} className="underline">
                {COMPANY.email}
              </a>{" "}
              directly and we&apos;ll reply within one business day.
            </p>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5" noValidate>
              <div>
                <label htmlFor="contact-name" className="mb-2 block text-sm text-foreground/90">
                  Name
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
                  Email
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
                  Message
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
              <MagneticButton variant="primary" onClick={handleSubmit(onSubmit)} className="self-start">
                {isSubmitting ? "Sending..." : "Send Message"}
              </MagneticButton>
            </form>
          )}
        </Card>
      </Container>
    </section>
  );
}
