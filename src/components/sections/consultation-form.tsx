"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { CONSULTATION_SERVICES, consultationSchema, type ConsultationValues } from "@/lib/consultation";
import { FORMS } from "@/lib/content/settings";
import { useHydrated } from "@/lib/use-hydrated";

const copy = FORMS.consultation;

const inputClass = "w-full rounded-xl border border-border bg-background px-4 py-3 text-base text-foreground outline-none transition-shadow focus:border-primary focus:ring-2 focus:ring-primary/15 aria-invalid:border-destructive";
const fields = [
  { name: "name", label: copy.labels.name, type: "text", autoComplete: "name", maxLength: 100 },
  { name: "country", label: copy.labels.country, type: "text", autoComplete: "country-name", maxLength: 100 },
  { name: "email", label: copy.labels.email, type: "email", autoComplete: "email", maxLength: 254 },
  { name: "phone", label: copy.labels.phone, type: "tel", autoComplete: "tel", maxLength: 30 },
] as const;

export function ConsultationForm() {
  const hydrated = useHydrated();
  const [bookingDetails, setBookingDetails] = useState<ConsultationValues | null>(null);
  const bookingHeading = useRef<HTMLHeadingElement>(null);
  useEffect(() => {
    if (bookingDetails) bookingHeading.current?.focus();
  }, [bookingDetails]);
  const [leadId, setLeadId] = useState<string | null>(null);
  const [saveError, setSaveError] = useState("");
  const [choiceError, setChoiceError] = useState("");
  const [choiceSaving, setChoiceSaving] = useState(false);
  const [enquirySaved, setEnquirySaved] = useState(false);
  const [bookingReady, setBookingReady] = useState(false);
  async function prepareAppointment(values: ConsultationValues) {
    setSaveError("");
    try {
      const { saveLead } = await import("@/lib/firebase-leads");
      const source = window.location.pathname.replace(/\/$/, "").endsWith("/book-appointment") ? "/book-appointment" : "/book-consultation";
      setLeadId(await saveLead(values, source));
      setBookingDetails(values);
    } catch (error) {
      console.error("Lead save failed", error && typeof error === "object" && "code" in error ? error.code : "unknown");
      setSaveError(copy.saveError);
    }
  }
  async function chooseNextStep(choice: "enquiryRequested" | "bookingRequested") {
    if (!leadId || choiceSaving) return;
    setChoiceSaving(true);
    setChoiceError("");
    try {
      const { recordLeadChoice } = await import("@/lib/firebase-leads");
      await recordLeadChoice(leadId, choice);
      if (choice === "enquiryRequested") setEnquirySaved(true);
      else setBookingReady(true);
    } catch {
      setChoiceError(copy.choiceError);
    } finally {
      setChoiceSaving(false);
    }
  }
  const { register, handleSubmit, setFocus, formState: { errors, isSubmitting } } = useForm<ConsultationValues>({
    resolver: zodResolver(consultationSchema),
    defaultValues: { name: "", country: "", email: "", phone: "", address: "", services: [], notes: "" },
  });
  return (
    <form method="post" onSubmit={handleSubmit(prepareAppointment)} onChange={() => { setSaveError(""); setChoiceError(""); }} aria-busy={isSubmitting || choiceSaving} noValidate className="as-neon-card w-full rounded-2xl bg-background p-6 sm:p-10">
      <div hidden={!!bookingDetails}>
      <p className="mb-6 rounded-xl bg-foreground/5 px-4 py-3 text-sm text-muted-foreground">{copy.stepOneNote}</p>
      <fieldset disabled={isSubmitting} className="grid gap-6 sm:grid-cols-2">
        {fields.map(field => <div key={field.name}>
          <label htmlFor={`consultation-${field.name}`} className="mb-2 block text-sm font-medium">{field.label} <span aria-hidden className="text-primary">*</span></label>
          <input id={`consultation-${field.name}`} type={field.type} autoComplete={field.autoComplete} maxLength={field.maxLength} required className={inputClass}
            aria-invalid={!!errors[field.name]} aria-describedby={errors[field.name] ? `consultation-${field.name}-error` : field.name === "phone" ? "phone-hint" : undefined}
            {...register(field.name)} />
          {field.name === "phone" && <p id="phone-hint" className="mt-2 text-xs text-muted-foreground">{copy.phoneHint}</p>}
          {errors[field.name] && <p id={`consultation-${field.name}-error`} role="alert" className="mt-2 text-sm text-destructive">{errors[field.name]?.message}</p>}
        </div>)}
        <div className="sm:col-span-2">
          <label htmlFor="consultation-address" className="mb-2 block text-sm font-medium">{copy.labels.address} <span aria-hidden className="text-primary">*</span></label>
          <textarea id="consultation-address" rows={3} autoComplete="street-address" maxLength={500} required className={inputClass} aria-invalid={!!errors.address} aria-describedby={errors.address ? "address-error" : undefined} {...register("address")} />
          {errors.address && <p id="address-error" role="alert" className="mt-2 text-sm text-destructive">{errors.address.message}</p>}
        </div>
        <fieldset className="sm:col-span-2" aria-describedby={errors.services ? "services-hint services-error" : "services-hint"}>
          <legend className="text-sm font-medium">{copy.labels.services} <span aria-hidden className="text-primary">*</span></legend>
          <p id="services-hint" className="mt-2 text-sm text-muted-foreground">{copy.servicesHint}</p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {CONSULTATION_SERVICES.map(service => <label key={service} className="flex cursor-pointer items-center gap-3 rounded-xl border border-border p-4 transition-colors hover:border-primary/60 has-[:checked]:border-primary has-[:checked]:bg-primary/5 has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-primary/30">
              <input type="checkbox" value={service} className="size-4 accent-primary" {...register("services")} />
              <span className="text-sm font-medium">{service}</span>
            </label>)}
          </div>
          {errors.services && <p id="services-error" role="alert" className="mt-2 text-sm text-destructive">{errors.services.message}</p>}
        </fieldset>
        <div className="sm:col-span-2">
          <label htmlFor="consultation-notes" className="mb-2 block text-sm font-medium">{copy.labels.notes} <span className="font-normal text-muted-foreground">{copy.optionalLabel}</span></label>
          <textarea id="consultation-notes" rows={4} maxLength={1500} placeholder={copy.notesPlaceholder} className={inputClass} aria-invalid={!!errors.notes} aria-describedby={errors.notes ? "notes-error" : undefined} {...register("notes")} />
          {errors.notes && <p id="notes-error" role="alert" className="mt-2 text-sm text-destructive">{errors.notes.message}</p>}
        </div>
      </fieldset>
      <div className="mt-8 flex flex-col items-start gap-4 border-t border-border pt-6">
        <p className="text-sm text-muted-foreground">{copy.consentText} <Link href="/privacy-policy" className="underline underline-offset-4 hover:text-primary">{copy.privacyLinkLabel}</Link>.</p>
        <Button type="submit" size="lg" disabled={!hydrated || isSubmitting}>{isSubmitting ? copy.savingButton : copy.continueButton}</Button>
        {saveError && <p role="alert" className="text-sm text-destructive">{saveError}</p>}
      </div>
      </div>
        {bookingDetails && <section aria-labelledby="appointment-next-title" className="w-full">
          <h2 id="appointment-next-title" ref={bookingHeading} tabIndex={-1} className="text-xl font-semibold outline-none">{copy.stepTwoHeading}</h2>
          <p className="mt-3 text-sm text-muted-foreground">{copy.stepTwoIntro}</p>
          <details className="my-6 border-y border-border py-4">
            <summary className="cursor-pointer text-sm font-medium">{copy.reviewDetails}</summary>
          <dl className="mt-5 grid gap-4 text-sm sm:grid-cols-2">
            <div><dt className="text-muted-foreground">{copy.labels.name}</dt><dd className="mt-1 break-words">{bookingDetails.name}</dd></div>
            <div><dt className="text-muted-foreground">{copy.labels.email}</dt><dd className="mt-1 break-all">{bookingDetails.email}</dd></div>
            <div><dt className="text-muted-foreground">{copy.labels.phone}</dt><dd className="mt-1 break-words">{bookingDetails.phone}</dd></div>
            <div><dt className="text-muted-foreground">{copy.labels.country}</dt><dd className="mt-1 break-words">{bookingDetails.country}</dd></div>
            <div className="sm:col-span-2"><dt className="text-muted-foreground">{copy.labels.address}</dt><dd className="mt-1 whitespace-pre-line break-words">{bookingDetails.address}</dd></div>
            <div className="sm:col-span-2"><dt className="text-muted-foreground">{copy.labels.services}</dt><dd className="mt-1">{bookingDetails.services.join(", ")}</dd></div>
            {bookingDetails.notes && <div className="sm:col-span-2"><dt className="text-muted-foreground">{copy.labels.notes}</dt><dd className="mt-1 whitespace-pre-line break-words">{bookingDetails.notes}</dd></div>}
          </dl>
          </details>
          <div className="grid gap-8 sm:grid-cols-2">
            <div>
              <h3 className="text-lg font-semibold">{copy.enquiryHeading}</h3>
              <p className="mt-3 mb-5 text-sm text-muted-foreground">{copy.enquiryBody}</p>
              <Button type="button" size="lg" variant="outline" disabled={choiceSaving || enquirySaved} onClick={() => chooseNextStep("enquiryRequested")}>{enquirySaved ? copy.enquirySavedButton : copy.enquiryButton}</Button>
              {enquirySaved && <p role="status" className="mt-4 text-sm text-muted-foreground">{copy.enquirySavedMessage}</p>}
            </div>
            <div>
              <h3 className="text-lg font-semibold">{copy.appointmentHeading}</h3>
              <p className="mt-3 mb-5 text-sm text-muted-foreground">{copy.appointmentBody}</p>
              {bookingReady ? <div role="status">
                <p className="mb-3 text-sm">{copy.appointmentSavedMessage}</p>
                <Button asChild size="lg"><a href={FORMS.appointmentUrl} target="_blank" rel="noopener noreferrer">{copy.openCalendarButton} <span className="sr-only">(opens in a new tab)</span></a></Button>
              </div> : <Button type="button" size="lg" disabled={choiceSaving} onClick={() => chooseNextStep("bookingRequested")}>{copy.appointmentButton}</Button>}
              <p className="mt-4 text-xs text-muted-foreground">{copy.appointmentFootnote}</p>
            </div>
          </div>
          {choiceSaving && <p role="status" className="mt-4 text-sm text-muted-foreground">{copy.choiceSaving}</p>}
          {choiceError && <p role="alert" className="mt-4 text-sm text-destructive">{choiceError}</p>}
          <Button type="button" disabled={choiceSaving} variant="link" className="mt-6 px-0" onClick={() => { setBookingDetails(null); setChoiceError(""); requestAnimationFrame(() => setFocus("name")); }}>{copy.editDetails}</Button>
        </section>}
    </form>
  );
}
