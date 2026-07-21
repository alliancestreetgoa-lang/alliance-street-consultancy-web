// src/components/sections/newsletter.tsx
"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Container } from "@/components/ui/container";
import { MagneticButton } from "@/components/ui/magnetic-button";
import { cn } from "@/lib/utils";

const newsletterSchema = z.object({
  email: z.string().email("Enter a valid email address."),
});

type NewsletterValues = z.infer<typeof newsletterSchema>;

export function Newsletter() {
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
    <section className="py-24 sm:py-32">
      <Container className="flex flex-col items-center gap-6 text-center">
        <h2 className="font-display text-2xl font-medium text-foreground sm:text-3xl">
          Stay ahead of UAE and UK compliance changes.
        </h2>
        <p className="max-w-xl text-muted-foreground">
          Occasional, practical updates on tax and regulatory changes that affect founders — no
          spam.
        </p>
        {submitted ? (
          <p className="text-primary">Thanks — you&apos;re on the list.</p>
        ) : (
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="flex w-full max-w-md flex-col gap-3 sm:flex-row sm:items-start"
            noValidate
          >
            <div className="flex-1">
              <input
                type="email"
                placeholder="you@company.com"
                className={cn(
                  "w-full rounded-full border border-glass-border bg-white/5 px-5 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none",
                  errors.email && "border-destructive"
                )}
                {...register("email")}
              />
              {errors.email ? (
                <p className="mt-2 text-left text-xs text-destructive">{errors.email.message}</p>
              ) : null}
            </div>
            <MagneticButton variant="primary" onClick={handleSubmit(onSubmit)} className="shrink-0">
              {isSubmitting ? "Submitting..." : "Subscribe"}
            </MagneticButton>
          </form>
        )}
      </Container>
    </section>
  );
}
