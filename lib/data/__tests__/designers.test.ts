import { describe, it, expect } from "vitest";
import {
  getAllDesigners,
  getDesignerBySlug,
  getFilteredDesigners,
  getUniqueLocations,
  ALL_SPECIALTIES,
  AVAILABILITY_LABELS,
  EXPERIENCE_LABELS,
} from "../designers";

describe("getAllDesigners", () => {
  it("returns all 20 designers", async () => {
    const designers = await getAllDesigners();
    expect(designers).toHaveLength(20);
  });

  it("returns designers sorted newest-first", async () => {
    const designers = await getAllDesigners();
    for (let i = 0; i < designers.length - 1; i++) {
      expect(new Date(designers[i].createdAt).getTime()).toBeGreaterThanOrEqual(
        new Date(designers[i + 1].createdAt).getTime()
      );
    }
  });

  it("each designer has required fields with correct shape", async () => {
    const designers = await getAllDesigners();
    for (const d of designers) {
      expect(d.id).toBeTruthy();
      expect(d.slug).toBeTruthy();
      expect(d.name).toBeTruthy();
      expect(d.location).toBeDefined();
      expect(d.location.city).toBeTruthy();
      expect(d.location.country).toBeTruthy();
      expect(Array.isArray(d.specialties)).toBe(true);
      expect(Array.isArray(d.tools)).toBe(true);
      expect(d.contact).toBeDefined();
      expect(d.createdAt).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    }
  });
});

describe("getDesignerBySlug", () => {
  it("returns the correct designer for a known slug", async () => {
    const d = await getDesignerBySlug("mara-lindt");
    expect(d).toBeDefined();
    expect(d!.slug).toBe("mara-lindt");
    expect(d!.location.city).toBe("Berlin");
    expect(d!.availability).toBe("available");
    expect(d!.experienceLevel).toBe("senior");
  });

  it("returns undefined for an unknown slug", async () => {
    const d = await getDesignerBySlug("no-such-designer");
    expect(d).toBeUndefined();
  });
});

describe("getFilteredDesigners — no filters", () => {
  it("returns all 20 designers when no filters are given", async () => {
    const results = await getFilteredDesigners({});
    expect(results).toHaveLength(20);
  });
});

describe("getFilteredDesigners — text search", () => {
  it("matches on name (case-insensitive)", async () => {
    const results = await getFilteredDesigners({ query: "mara" });
    expect(results.map((d) => d.slug)).toContain("mara-lindt");
  });

  it("matches on job title", async () => {
    const results = await getFilteredDesigners({ query: "brand" });
    expect(results.length).toBeGreaterThan(0);
  });

  it("matches on location city", async () => {
    const results = await getFilteredDesigners({ query: "berlin" });
    expect(results.length).toBeGreaterThan(0);
    expect(results.every((d) => d.location.city.toLowerCase().includes("berlin"))).toBe(true);
  });

  it("returns empty array when nothing matches", async () => {
    const results = await getFilteredDesigners({ query: "zzznomatch9999" });
    expect(results).toEqual([]);
  });
});

describe("getFilteredDesigners — availability filter", () => {
  it("returns only available designers", async () => {
    const results = await getFilteredDesigners({ availability: "available" });
    expect(results.length).toBeGreaterThan(0);
    for (const d of results) {
      expect(d.availability).toBe("available");
    }
  });

  it("returns only freelance designers", async () => {
    const results = await getFilteredDesigners({ availability: "freelance" });
    expect(results.length).toBeGreaterThan(0);
    for (const d of results) {
      expect(d.availability).toBe("freelance");
    }
  });
});

describe("getFilteredDesigners — experience filter", () => {
  it("returns only senior designers", async () => {
    const results = await getFilteredDesigners({ experience: "senior" });
    expect(results.length).toBeGreaterThan(0);
    for (const d of results) {
      expect(d.experienceLevel).toBe("senior");
    }
  });
});

describe("getFilteredDesigners — location filter", () => {
  it("matches designers by city", async () => {
    const results = await getFilteredDesigners({ location: "Berlin" });
    expect(results.length).toBeGreaterThan(0);
    for (const d of results) {
      expect(
        d.location.city.toLowerCase().includes("berlin") ||
        d.location.country.toLowerCase().includes("berlin")
      ).toBe(true);
    }
  });
});

describe("getFilteredDesigners — sorting", () => {
  it("sort 'az' returns names in ascending order", async () => {
    const results = await getFilteredDesigners({ sort: "az" });
    for (let i = 0; i < results.length - 1; i++) {
      expect(results[i].name.localeCompare(results[i + 1].name)).toBeLessThanOrEqual(0);
    }
  });

  it("sort 'za' returns names in descending order", async () => {
    const results = await getFilteredDesigners({ sort: "za" });
    for (let i = 0; i < results.length - 1; i++) {
      expect(results[i].name.localeCompare(results[i + 1].name)).toBeGreaterThanOrEqual(0);
    }
  });

  it("sort 'newest' returns newest designer first", async () => {
    const results = await getFilteredDesigners({ sort: "newest" });
    expect(results[0].slug).toBe("isabela-santos");
  });
});

describe("getUniqueLocations", () => {
  it("returns a non-empty sorted array of city strings", async () => {
    const locations = await getUniqueLocations();
    expect(locations.length).toBeGreaterThan(0);
    for (const loc of locations) {
      expect(typeof loc).toBe("string");
    }
    const sorted = [...locations].sort();
    expect(locations).toEqual(sorted);
  });

  it("contains Berlin", async () => {
    const locations = await getUniqueLocations();
    expect(locations).toContain("Berlin");
  });

  it("contains no duplicates", async () => {
    const locations = await getUniqueLocations();
    expect(new Set(locations).size).toBe(locations.length);
  });
});

describe("ALL_SPECIALTIES", () => {
  it("is a non-empty array of strings", () => {
    expect(Array.isArray(ALL_SPECIALTIES)).toBe(true);
    expect(ALL_SPECIALTIES.length).toBeGreaterThan(0);
    for (const s of ALL_SPECIALTIES) {
      expect(typeof s).toBe("string");
    }
  });

  it("includes Branding and UX/UI", () => {
    expect(ALL_SPECIALTIES).toContain("Branding");
    expect(ALL_SPECIALTIES).toContain("UX/UI");
  });
});

describe("AVAILABILITY_LABELS / EXPERIENCE_LABELS", () => {
  it("AVAILABILITY_LABELS covers all three states", () => {
    expect(AVAILABILITY_LABELS.available).toBeTruthy();
    expect(AVAILABILITY_LABELS.freelance).toBeTruthy();
    expect(AVAILABILITY_LABELS.unavailable).toBeTruthy();
  });

  it("EXPERIENCE_LABELS covers junior, mid, senior", () => {
    expect(EXPERIENCE_LABELS.junior).toBeTruthy();
    expect(EXPERIENCE_LABELS.mid).toBeTruthy();
    expect(EXPERIENCE_LABELS.senior).toBeTruthy();
  });
});
