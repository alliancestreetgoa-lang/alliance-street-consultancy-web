import formsJson from "@/content/forms.json";
import servicePageJson from "@/content/service-page.json";
import type { z } from "zod";
import type { formsSchema, servicePageSchema } from "./schema";

/** Visitor-facing form copy and the appointment link. Validated in tests. */
export const FORMS = formsJson as z.infer<typeof formsSchema>;

/** Labels used by every service detail page. */
export const SERVICE_PAGE = servicePageJson as z.infer<typeof servicePageSchema>;
