"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { APPOINTMENT_URL, CONSULTATION_SERVICES, consultationSchema, type ConsultationValues } from "@/lib/consultation";

const inputClass = "w-full rounded-xl border border-border bg-background px-4 py-3 text-base text-foreground outline-none transition-shadow focus:border-primary focus:ring-2 focus:ring-primary/15 aria-invalid:border-destructive";
const fields = [
  { name: "name", label: "Full name", type: "text", autoComplete: "name", maxLength: 100 },
  { name: "country", label: "Country", type: "text", autoComplete: "country-name", maxLength: 100 },
  { name: "email", label: "Email address", type: "email", autoComplete: "email", maxLength: 254 },
  { name: "phone", label: "Contact number", type: "tel", autoComplete: "tel", maxLength: 30 },
] as const;

export function ConsultationForm() {
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
      setSaveError("We couldn’t save your details. Please check your connection and try Continue again. Your entries are still here.");
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
      setChoiceError("Your contact details are saved, but we couldn’t save this choice. Please try again.");
    } finally {
      setChoiceSaving(false);
    }
  }
  const { register, handleSubmit, setFocus, formState: { errors, isSubmitting } } = useForm<ConsultationValues>({
    resolver: zodResolver(consultationSchema),
    defaultValues: { name: "", country: "", email: "", phone: "", address: "", services: [], notes: "" },
  });
  return (
    <form onSubmit={handleSubmit(prepareAppointment)} onChange={() => { setSaveError(""); setChoiceError(""); }} aria-busy={isSubmitting || choiceSaving} noValidate className="as-neon-card w-full rounded-2xl bg-background p-6 sm:p-10">
      <div hidden={!!bookingDetails}>
      <p className="mb-6 rounded-xl bg-foreground/5 px-4 py-3 text-sm text-muted-foreground">Step 1 of 2 — Your details. Press Continue to save your details with Alliance Street, then choose an enquiry or a Zoom appointment.</p>
      <fieldset disabled={isSubmitting} className="grid gap-6 sm:grid-cols-2">
        {fields.map(field => <div key={field.name}>
          <label htmlFor={`consultation-${field.name}`} className="mb-2 block text-sm font-medium">{field.label} <span aria-hidden className="text-primary">*</span></label>
          <input id={`consultation-${field.name}`} type={field.type} autoComplete={field.autoComplete} maxLength={field.maxLength} required className={inputClass}
            aria-invalid={!!errors[field.name]} aria-describedby={errors[field.name] ? `consultation-${field.name}-error` : field.name === "phone" ? "phone-hint" : undefined}
            {...register(field.name)} />
          {field.name === "phone" && <p id="phone-hint" className="mt-2 text-xs text-muted-foreground">Include your country code, for example +971 or +44.</p>}
          {errors[field.name] && <p id={`consultation-${field.name}-error`} role="alert" className="mt-2 text-sm text-destructive">{errors[field.name]?.message}</p>}
        </div>)}
        <div className="sm:col-span-2">
          <label htmlFor="consultation-address" className="mb-2 block text-sm font-medium">Address <span aria-hidden className="text-primary">*</span></label>
          <textarea id="consultation-address" rows={3} autoComplete="street-address" maxLength={500} required className={inputClass} aria-invalid={!!errors.address} aria-describedby={errors.address ? "address-error" : undefined} {...register("address")} />
          {errors.address && <p id="address-error" role="alert" className="mt-2 text-sm text-destructive">{errors.address.message}</p>}
        </div>
        <fieldset className="sm:col-span-2" aria-describedby={errors.services ? "services-hint services-error" : "services-hint"}>
          <legend className="text-sm font-medium">Which services do you need? <span aria-hidden className="text-primary">*</span></legend>
          <p id="services-hint" className="mt-2 text-sm text-muted-foreground">Choose one or more.</p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {CONSULTATION_SERVICES.map(service => <label key={service} className="flex cursor-pointer items-center gap-3 rounded-xl border border-border p-4 transition-colors hover:border-primary/60 has-[:checked]:border-primary has-[:checked]:bg-primary/5 has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-primary/30">
              <input type="checkbox" value={service} className="size-4 accent-primary" {...register("services")} />
              <span className="text-sm font-medium">{service}</span>
            </label>)}
          </div>
          {errors.services && <p id="services-error" role="alert" className="mt-2 text-sm text-destructive">{errors.services.message}</p>}
        </fieldset>
        <div className="sm:col-span-2">
          <label htmlFor="consultation-notes" className="mb-2 block text-sm font-medium">Additional information <span className="font-normal text-muted-foreground">(optional)</span></label>
          <textarea id="consultation-notes" rows={4} maxLength={1500} placeholder="Tell us about your business, your questions, or anything you would like us to know." className={inputClass} aria-invalid={!!errors.notes} aria-describedby={errors.notes ? "notes-error" : undefined} {...register("notes")} />
          {errors.notes && <p id="notes-error" role="alert" className="mt-2 text-sm text-destructive">{errors.notes.message}</p>}
        </div>
      </fieldset>
      <div className="mt-8 flex flex-col items-start gap-4 border-t border-border pt-6">
        <p className="text-sm text-muted-foreground">By pressing Continue, you ask Alliance Street to save these details and contact you about your selected services, even if you do not finish booking. Read our <Link href="/privacy-policy" className="underline underline-offset-4 hover:text-primary">privacy policy</Link>.</p>
        <Button type="submit" size="lg" disabled={isSubmitting}>{isSubmitting ? "Saving your details…" : "Continue"}</Button>
        {saveError && <p role="alert" className="text-sm text-destructive">{saveError}</p>}
      </div>
      </div>
        {bookingDetails && <section aria-labelledby="appointment-next-title" className="w-full">
          <h2 id="appointment-next-title" ref={bookingHeading} tabIndex={-1} className="text-xl font-semibold outline-none">Step 2 of 2 — How would you like to connect?</h2>
          <p className="mt-3 text-sm text-muted-foreground">Your details have been saved. Choose an enquiry or a scheduled conversation.</p>
          <details className="my-6 border-y border-border py-4">
            <summary className="cursor-pointer text-sm font-medium">Review your details</summary>
          <dl className="mt-5 grid gap-4 text-sm sm:grid-cols-2">
            <div><dt className="text-muted-foreground">Name</dt><dd className="mt-1 break-words">{bookingDetails.name}</dd></div>
            <div><dt className="text-muted-foreground">Email</dt><dd className="mt-1 break-all">{bookingDetails.email}</dd></div>
            <div><dt className="text-muted-foreground">Contact number</dt><dd className="mt-1 break-words">{bookingDetails.phone}</dd></div>
            <div><dt className="text-muted-foreground">Country</dt><dd className="mt-1 break-words">{bookingDetails.country}</dd></div>
            <div className="sm:col-span-2"><dt className="text-muted-foreground">Address</dt><dd className="mt-1 whitespace-pre-line break-words">{bookingDetails.address}</dd></div>
            <div className="sm:col-span-2"><dt className="text-muted-foreground">Services</dt><dd className="mt-1">{bookingDetails.services.join(", ")}</dd></div>
            {bookingDetails.notes && <div className="sm:col-span-2"><dt className="text-muted-foreground">Additional information</dt><dd className="mt-1 whitespace-pre-line break-words">{bookingDetails.notes}</dd></div>}
          </dl>
          </details>
          <div className="grid gap-8 sm:grid-cols-2">
            <div>
              <h3 className="text-lg font-semibold">Send an enquiry</h3>
              <p className="mt-3 mb-5 text-sm text-muted-foreground">Ask our team to follow up about the services you selected. We’ll record your request alongside your saved details.</p>
              <Button type="button" size="lg" variant="outline" disabled={choiceSaving || enquirySaved} onClick={() => chooseNextStep("enquiryRequested")}>{enquirySaved ? "Enquiry saved" : "Send enquiry"}</Button>
              {enquirySaved && <p role="status" className="mt-4 text-sm text-muted-foreground">Your enquiry has been saved for our team. You can also book a Zoom appointment.</p>}
            </div>
            <div>
              <h3 className="text-lg font-semibold">Book an appointment</h3>
              <p className="mt-3 mb-5 text-sm text-muted-foreground">Choose a time for a 30-minute Zoom call with Stallone Shaikh. Confirm your booking in Zoom to reserve the appointment.</p>
              {bookingReady ? <div role="status">
                <p className="mb-3 text-sm">Your appointment preference is saved. Choose and confirm your time in Zoom next.</p>
                <Button asChild size="lg"><a href={APPOINTMENT_URL} target="_blank" rel="noopener noreferrer">Open Zoom calendar <span className="sr-only">(opens in a new tab)</span></a></Button>
              </div> : <Button type="button" size="lg" disabled={choiceSaving} onClick={() => chooseNextStep("bookingRequested")}>Book appointment</Button>}
              <p className="mt-4 text-xs text-muted-foreground">Your details remain saved with Alliance Street. Zoom asks for booking details separately; a booking is confirmed only after you complete its calendar steps.</p>
            </div>
          </div>
          {choiceSaving && <p role="status" className="mt-4 text-sm text-muted-foreground">Saving your choice…</p>}
          {choiceError && <p role="alert" className="mt-4 text-sm text-destructive">{choiceError}</p>}
          <Button type="button" disabled={choiceSaving} variant="link" className="mt-6 px-0" onClick={() => { setBookingDetails(null); setChoiceError(""); requestAnimationFrame(() => setFocus("name")); }}>Edit details</Button>
        </section>}
    </form>
  );
}
