import { describe, it, expect } from "vitest";
import {
  getAllDesigners,
  getDesignerBySlug,
  getFilteredDesigners,
  getUniqueLocations,
  ALL_SPECIALTIES,
  AVAILABILITY_LABELS,
  EXPERIENCE_LABELS,
  type Availability,
  type ExperienceLevel,
  type Specialty,
} from "../designers";

describe("getAllDesigners", () => {
  it("returns an array of designers", async () => {
    const designers = await getAllDesigners();
    expect(Array.isArray(designers)).toBe(true);
    expect(designers.length).toBeGreaterThan(0);
  });

  it("returns designers sorted newest first", async () => {
    const designers = await getAllDesigners();
    for (let i = 0; i < designers.length - 1; i++) {
      const a = new Date(designers[i].createdAt).getTime();
      const b = new Date(designers[i + 1].createdAt).getTime();
      expect(a).toBeGreaterThanOrEqual(b);
    }
  });

  it("each designer has required fields", async () => {
    const designers = await getAllDesigners();
    for (const d of designers) {
      expect(d.id).toBeTruthy();
      expect(d.slug).toBeTruthy();
      expect(d.name).toBeTruthy();
      expect(d.location).toBeTruthy();
      expect(d.location.city).toBeTruthy();
      expect(d.location.country).toBeTruthy();
      expect(Array.isArray(d.specialties)).toBe(true);
      expect(["available", "freelance", "unavailable"]).toContain(d.availability);
      expect(["junior", "mid", "senior"]).toContain(d.experienceLevel);
    }
  });
});

describe("getDesignerBySlug", () => {
  it("returns a designer for a valid slug", async () => {
    const designers = await getAllDesigners();
    const first = designers[0];
    const found = await getDesignerBySlug(first.slug);
    expect(found).toBeDefined();
    expect(found!.slug).toBe(first.slug);
    expect(found!.name).toBe(first.name);
  });

  it("returns undefined for a non-existent slug", async () => {
    const result = await getDesignerBySlug("no-such-designer-abc");
    expect(result).toBeUndefined();
  });
});

describe("getFilteredDesigners — no filters", () => {
  it("returns all designers when given empty filters", async () => {
    const all = await getAllDesigners();
    const filtered = await getFilteredDesigners({});
    expect(filtered.length).toBe(all.length);
  });
});

describe("getFilteredDesigners — text search", () => {
  it("matches on designer name (case-insensitive)", async () => {
    const all = await getAllDesigners();
    const target = all[0];
    const fragment = target.name.split(" ")[0].toLowerCase();
    const results = await getFilteredDesigners({ query: fragment });
    const ids = results.map((d) => d.id);
    expect(ids).toContain(target.id);
  });

  it("returns empty array for a query that matches nothing", async () => {
    const results = await getFilteredDesigners({ query: "zzzzzzunlikelymatch9999" });
    expect(results).toEqual([]);
  });
});

describe("getFilteredDesigners — specialty filter", () => {
  it("filters by each valid specialty", async () => {
    for (const specialty of ALL_SPECIALTIES) {
      const results = await getFilteredDesigners({ specialty: specialty as Specialty });
      for (const d of results) {
        expect(d.specialties).toContain(specialty);
      }
    }
  });
});

describe("getFilteredDesigners — availability filter", () => {
  it("filters by each availability option", async () => {
    for (const availability of Object.keys(AVAILABILITY_LABELS) as Availability[]) {
      const results = await getFilteredDesigners({ availability });
      for (const d of results) {
        expect(d.availability).toBe(availability);
      }
    }
  });
});

describe("getFilteredDesigners — experience filter", () => {
  it("filters by each experience level", async () => {
    for (const experience of Object.keys(EXPERIENCE_LABELS) as ExperienceLevel[]) {
      const results = await getFilteredDesigners({ experience });
      for (const d of results) {
        expect(d.experienceLevel).toBe(experience);
      }
    }
  });
});

describe("getFilteredDesigners — location filter", () => {
  it("filters by city", async () => {
    const all = await getAllDesigners();
    const city = all[0].location.city;
    const results = await getFilteredDesigners({ location: city });
    expect(results.length).toBeGreaterThan(0);
    for (const d of results) {
      const loc = `${d.location.city} ${d.location.country}`.toLowerCase();
      expect(loc).toContain(city.toLowerCase());
    }
  });
});

describe("getFilteredDesigners — sorting", () => {
  it("sorts A→Z by name", async () => {
    const results = await getFilteredDesigners({ sort: "az" });
    for (let i = 0; i < results.length - 1; i++) {
      expect(results[i].name.localeCompare(results[i + 1].name)).toBeLessThanOrEqual(0);
    }
  });

  it("sorts Z→A by name", async () => {
    const results = await getFilteredDesigners({ sort: "za" });
    for (let i = 0; i < results.length - 1; i++) {
      expect(results[i].name.localeCompare(results[i + 1].name)).toBeGreaterThanOrEqual(0);
    }
  });

  it("sorts newest first by default", async () => {
    const results = await getFilteredDesigners({ sort: "newest" });
    for (let i = 0; i < results.length - 1; i++) {
      const a = new Date(results[i].createdAt).getTime();
      const b = new Date(results[i + 1].createdAt).getTime();
      expect(a).toBeGreaterThanOrEqual(b);
    }
  });
});

describe("getUniqueLocations", () => {
  it("returns a non-empty sorted array of city strings", async () => {
    const locations = await getUniqueLocations();
    expect(Array.isArray(locations)).toBe(true);
    expect(locations.length).toBeGreaterThan(0);
    // All strings
    for (const loc of locations) {
      expect(typeof loc).toBe("string");
    }
    // Sorted
    const sorted = [...locations].sort();
    expect(locations).toEqual(sorted);
  });

  it("has no duplicate cities", async () => {
    const locations = await getUniqueLocations();
    const unique = new Set(locations);
    expect(unique.size).toBe(locations.length);
  });
});
