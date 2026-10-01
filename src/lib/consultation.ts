import { z } from "zod";

export const CONSULTATION_SERVICES = [
  "UAE Setup", "UAE Tax & Compliance", "UK Services", "Advisory",
] as const;

export const consultationSchema = z.object({
  name: z.string().trim().min(2, "Enter your full name.").max(100),
  country: z.string().trim().min(2, "Enter your country.").max(100),
  address: z.string().trim().min(5, "Enter your address.").max(500),
  email: z.string().trim().email("Enter a valid email address.").max(254),
  phone: z.string().trim().regex(/^[+\d\s().-]+$/, "Enter a valid contact number, including country code.").refine(value => {
    const digits = value.replace(/\D/g, "");
    return digits.length >= 7 && digits.length <= 15;
  }, "Enter a contact number with 7–15 digits, including country code."),
  services: z.array(z.enum(CONSULTATION_SERVICES)).min(1, "Choose at least one service."),
  notes: z.string().trim().max(1500, "Keep your note under 1,500 characters."),
});

export type ConsultationValues = z.infer<typeof consultationSchema>;

// Published booking destination linked from Stallone Shaikh’s personal profile.
export const APPOINTMENT_URL = "https://scheduler.zoom.us/stallone-shaikh/strategic-advisory-call";
