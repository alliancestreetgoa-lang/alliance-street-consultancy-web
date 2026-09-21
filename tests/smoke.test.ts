import { describe, expect, it } from "vitest";
import { cn } from "@/lib/utils";

describe("test harness", () => {
  it("resolves the @/ alias", () => {
    expect(cn("a", "b")).toBe("a b");
  });
});
