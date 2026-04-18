import { describe, it, expect } from "vitest";
import { cn } from "../utils";

describe("cn", () => {
  it("merges class names", () => {
    expect(cn("foo", "bar")).toBe("foo bar");
  });

  it("handles conditional classes", () => {
    expect(cn("base", false && "skipped", "included")).toBe("base included");
  });

  it("deduplicates Tailwind conflicting classes (tailwind-merge)", () => {
    // tailwind-merge resolves conflicts: last padding wins
    expect(cn("p-2", "p-4")).toBe("p-4");
  });

  it("handles undefined and null values gracefully", () => {
    expect(cn("a", undefined, null, "b")).toBe("a b");
  });

  it("returns empty string for no input", () => {
    expect(cn()).toBe("");
  });
});
