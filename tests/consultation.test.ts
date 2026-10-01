import { describe, expect, it } from "vitest";
import { consultationSchema } from "../src/lib/consultation";

const valid = {
  name: "Test Visitor", country: "United Arab Emirates", address: "Example Street, Dubai",
  email: "visitor@example.com", phone: "+971 50 123 4567", services: ["UAE Setup", "Advisory"], notes: "Question about A&B costs?",
};

describe("consultation requests", () => {
  it("accepts multiple supported services and optional empty notes", () => {
    expect(consultationSchema.safeParse({ ...valid, notes: "" }).success).toBe(true);
  });
  it("rejects missing details, invalid email or phone, and unsupported services", () => {
    for (const changes of [{ name: " " }, { country: "" }, { address: "" }, { email: "invalid" }, { phone: "123" }, { services: [] }, { services: ["Other"] }]) {
      expect(consultationSchema.safeParse({ ...valid, ...changes }).success).toBe(false);
    }
  });
  it("trims contact fields and preserves the details for future delivery", () => {
    const parsed = consultationSchema.parse({ ...valid, name: "  Test Visitor  " });
    expect(parsed.name).toBe("Test Visitor");
    expect(parsed.services).toEqual(["UAE Setup", "Advisory"]);
    expect(parsed.notes).toBe(valid.notes);
    expect(parsed.address).toBe(valid.address);
  });
});
