import siteJson from "@/content/site.json";

/**
 * Placeholders an editor can type into copy so contact details stay in one
 * place: {{company.name}}, {{company.email}}, {{company.phone}},
 * {{company.address}} and {{year}}. Unknown placeholders are left visible so a
 * typo is noticed in preview rather than silently dropped.
 */
export function fill(text: string): string {
  const { company } = siteJson;
  const values: Record<string, string> = {
    "company.name": company.name,
    "company.email": company.email,
    "company.phone": company.phone,
    "company.address": company.address,
    year: String(new Date().getFullYear()),
  };
  return text.replace(/\{\{\s*([\w.]+)\s*\}\}/g, (match, key: string) => values[key] ?? match);
}
