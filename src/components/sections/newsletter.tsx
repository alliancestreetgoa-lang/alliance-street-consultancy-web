// src/components/sections/newsletter.tsx
"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { Reveal } from "@/components/ui/scroll-reveal";
import { AmbientGlow } from "@/components/ui/ambient-glow";
import { cn } from "@/lib/utils";
import { FORMS } from "@/lib/content/settings";
import type { SectionOf } from "@/lib/content/page-schema";
import { useHydrated } from "@/lib/use-hydrated";

const newsletterSchema = z.object({
  email: z.string().email("Enter a valid email address."),
});

type NewsletterValues = z.infer<typeof newsletterSchema>;

export function Newsletter({ section }: { section: SectionOf<"newsletter"> }) {
  const copy = FORMS.newsletter;
  const hydrated = useHydrated();
  const [submitted, setSubmitted] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<NewsletterValues>({
    resolver: zodResolver(newsletterSchema),
  });

  function onSubmit() {
    setSubmitted(true);
    reset();
  }

  return (
    <section className="relative overflow-hidden py-24 sm:py-32">
      <AmbientGlow className="opacity-30" />
      <Container className="relative z-10">
        <Reveal className="mx-auto flex flex-col items-center gap-6 text-center">
          <h2 className="text-2xl font-semibold text-foreground sm:text-3xl">
            {section.heading}
          </h2>
          <p className="max-w-xl text-muted-foreground">
            {section.body}
          </p>
          {submitted ? (
            <p className="text-primary">{copy.thanksMessage}</p>
          ) : (
            <form
              method="post"
              onSubmit={handleSubmit(onSubmit)}
              className="flex w-full max-w-md flex-col gap-3 sm:flex-row sm:items-start"
              noValidate
            >
              <div className="flex-1">
                <label htmlFor="newsletter-email" className="sr-only">
                  {copy.emailLabel}
                </label>
                <input
                  id="newsletter-email"
                  type="email"
                  placeholder={copy.placeholder}
                  aria-invalid={errors.email ? "true" : "false"}
                  aria-describedby="newsletter-email-error"
                  className={cn(
                    "w-full rounded-full border border-glass-border bg-foreground/5 px-5 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none",
                    errors.email && "border-destructive"
                  )}
                  {...register("email")}
                />
                {errors.email ? (
                  <p
                    id="newsletter-email-error"
                    role="alert"
                    className="mt-2 text-left text-xs text-destructive"
                  >
                    {errors.email.message}
                  </p>
                ) : null}
              </div>
              <Button size="lg" className="shrink-0" disabled={!hydrated} onClick={handleSubmit(onSubmit)}>{isSubmitting ? copy.submittingButton : copy.button}</Button>
            </form>
          )}
        </Reveal>
      </Container>
    </section>
  );
}
