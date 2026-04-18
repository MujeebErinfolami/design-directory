import { describe, it, expect, vi, beforeEach } from "vitest";
import { dbDesigners } from "./fixtures";

// ── Prisma mock ───────────────────────────────────────────────────────────────

vi.mock("@/lib/prisma", () => ({
  prisma: {
    designerProfile: {
      findMany:   vi.fn(),
      findUnique: vi.fn(),
    },
  },
}));

import { prisma } from "@/lib/prisma";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mockFindMany   = prisma.designerProfile.findMany   as any as ReturnType<typeof vi.fn>;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mockFindUnique = prisma.designerProfile.findUnique as any as ReturnType<typeof vi.fn>;

// ── Imports under test ────────────────────────────────────────────────────────

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
} from "../designers";

// ── Setup ─────────────────────────────────────────────────────────────────────

// Extended fixture for findUnique (needs projectCredits relation)
const dbDesignerWithCredits = {
  ...dbDesigners[0],
  projectCredits: [
    { project: { slug: "helvetica-identity-system" } },
  ],
};

beforeEach(() => {
  vi.clearAllMocks();
  // Default: return all three designers in newest-first order
  mockFindMany.mockResolvedValue([dbDesigners[2], dbDesigners[1], dbDesigners[0]]);
  mockFindUnique.mockResolvedValue(null);
});

// ── getAllDesigners ────────────────────────────────────────────────────────────

describe("getAllDesigners", () => {
  it("returns one Designer per DB row", async () => {
    const designers = await getAllDesigners();
    expect(designers).toHaveLength(3);
  });

  it("maps DB row to Designer shape — spot-checks dp1 (Mara Lindt)", async () => {
    mockFindMany.mockResolvedValue([dbDesigners[0]]);
    const [d] = await getAllDesigners();
    expect(d.id).toBe("dp1");
    expect(d.slug).toBe("mara-lindt");
    expect(d.name).toBe("Mara Lindt");
    expect(d.title).toBe("Brand & Type Designer");
    expect(d.initials).toBe("ML");
    expect(d.avatarColor).toBe("#e7e5e4");
    expect(d.availability).toBe("available");
    expect(d.experienceLevel).toBe("senior");
    expect(d.createdAt).toBe("2024-01-10");
  });

  it("maps location fields correctly", async () => {
    mockFindMany.mockResolvedValue([dbDesigners[0]]);
    const [d] = await getAllDesigners();
    expect(d.location.city).toBe("Berlin");
    expect(d.location.country).toBe("Germany");
    expect(d.location.countryCode).toBe("DE");
  });

  it("maps contact fields correctly", async () => {
    mockFindMany.mockResolvedValue([dbDesigners[0]]);
    const [d] = await getAllDesigners();
    expect(d.contact.email).toBe("mara@studionord.com");
    expect(d.contact.website).toBe("https://maralindt.com");
    expect(d.contact.dribbble).toBe("https://dribbble.com/maralindt");
  });

  it("maps agency affiliations from agencyMemberships", async () => {
    mockFindMany.mockResolvedValue([dbDesigners[0]]);
    const [d] = await getAllDesigners();
    expect(d.agencyAffiliations).toEqual(["Studio Nord"]);
  });

  it("returns empty agencyAffiliations when designer has no memberships", async () => {
    mockFindMany.mockResolvedValue([dbDesigners[1]]);
    const [d] = await getAllDesigners();
    expect(d.agencyAffiliations).toEqual([]);
  });

  it("each designer has required fields", async () => {
    const designers = await getAllDesigners();
    for (const d of designers) {
      expect(d.id).toBeTruthy();
      expect(d.slug).toBeTruthy();
      expect(d.name).toBeTruthy();
      expect(d.location).toBeDefined();
      expect(d.location.city).toBeTruthy();
      expect(d.location.country).toBeTruthy();
      expect(Array.isArray(d.specialties)).toBe(true);
      expect(d.createdAt).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    }
  });
});

// ── getDesignerBySlug ─────────────────────────────────────────────────────────

describe("getDesignerBySlug", () => {
  it("returns the mapped designer and includes projectSlugs", async () => {
    mockFindUnique.mockResolvedValue(dbDesignerWithCredits);
    const found = await getDesignerBySlug("mara-lindt");
    expect(found).toBeDefined();
    expect(found!.slug).toBe("mara-lindt");
    expect(found!.name).toBe("Mara Lindt");
    expect(found!.projectSlugs).toEqual(["helvetica-identity-system"]);
  });

  it("returns empty projectSlugs when designer has no credits", async () => {
    mockFindUnique.mockResolvedValue({ ...dbDesigners[1], projectCredits: [] });
    const found = await getDesignerBySlug("felix-kwan");
    expect(found!.projectSlugs).toEqual([]);
  });

  it("returns undefined when Prisma returns null", async () => {
    mockFindUnique.mockResolvedValue(null);
    const result = await getDesignerBySlug("no-such-designer");
    expect(result).toBeUndefined();
  });
});

// ── getFilteredDesigners — no filters ─────────────────────────────────────────

describe("getFilteredDesigners — no filters", () => {
  it("returns all rows from Prisma when no filters are given", async () => {
    const filtered = await getFilteredDesigners({});
    expect(filtered).toHaveLength(3);
  });
});

// ── getFilteredDesigners — text search (JS-level logic) ───────────────────────

describe("getFilteredDesigners — text search", () => {
  beforeEach(() => {
    // Text search: Prisma mock returns all; JS filter runs on top
    mockFindMany.mockResolvedValue([...dbDesigners]);
  });

  it("matches on display name (case-insensitive)", async () => {
    const results = await getFilteredDesigners({ query: "mara" });
    expect(results.map((d) => d.id)).toContain("dp1");
    expect(results.map((d) => d.id)).not.toContain("dp2");
  });

  it("matches on job title", async () => {
    const results = await getFilteredDesigners({ query: "ux designer" });
    expect(results.map((d) => d.id)).toContain("dp3");
    expect(results).toHaveLength(1);
  });

  it("matches on bio text", async () => {
    const results = await getFilteredDesigners({ query: "hong kong" });
    expect(results.map((d) => d.id)).toContain("dp2");
  });

  it("matches on specialty", async () => {
    const results = await getFilteredDesigners({ query: "typography" });
    expect(results.map((d) => d.id)).toContain("dp1");
  });

  it("matches on tool", async () => {
    const results = await getFilteredDesigners({ query: "framer" });
    expect(results.map((d) => d.id)).toContain("dp2");
    expect(results).toHaveLength(1);
  });

  it("matches on agency name", async () => {
    const results = await getFilteredDesigners({ query: "studio nord" });
    expect(results.map((d) => d.id)).toContain("dp1");
    expect(results).toHaveLength(1);
  });

  it("returns empty array when nothing matches", async () => {
    const results = await getFilteredDesigners({ query: "zzznomatch9999" });
    expect(results).toEqual([]);
  });
});

// ── getFilteredDesigners — structured filters ─────────────────────────────────

describe("getFilteredDesigners — availability filter", () => {
  it("returns only available designers when mocked with matching data", async () => {
    mockFindMany.mockResolvedValue([dbDesigners[0]]); // "available"
    const results = await getFilteredDesigners({ availability: "available" as Availability });
    expect(results).toHaveLength(1);
    expect(results[0].availability).toBe("available");
  });

  it("returns only freelance designers when mocked with matching data", async () => {
    mockFindMany.mockResolvedValue([dbDesigners[1]]); // "freelance"
    const results = await getFilteredDesigners({ availability: "freelance" as Availability });
    expect(results).toHaveLength(1);
    expect(results[0].availability).toBe("freelance");
  });
});

describe("getFilteredDesigners — experience filter", () => {
  it("returns only senior designers when mocked with matching data", async () => {
    mockFindMany.mockResolvedValue([dbDesigners[0]]); // "senior"
    const results = await getFilteredDesigners({ experience: "senior" as ExperienceLevel });
    expect(results).toHaveLength(1);
    expect(results[0].experienceLevel).toBe("senior");
  });

  it("returns only junior designers when mocked with matching data", async () => {
    mockFindMany.mockResolvedValue([dbDesigners[2]]); // "junior"
    const results = await getFilteredDesigners({ experience: "junior" as ExperienceLevel });
    expect(results).toHaveLength(1);
    expect(results[0].experienceLevel).toBe("junior");
  });
});

describe("getFilteredDesigners — location filter", () => {
  it("returns only designers from the given city", async () => {
    mockFindMany.mockResolvedValue([dbDesigners[0]]); // Berlin
    const results = await getFilteredDesigners({ location: "Berlin" });
    expect(results).toHaveLength(1);
    expect(results[0].location.city).toBe("Berlin");
  });
});

// ── getFilteredDesigners — sorting ────────────────────────────────────────────

describe("getFilteredDesigners — sorting", () => {
  it("passes A→Z rows through in the order Prisma returns them", async () => {
    // A→Z: Felix, Mara, Priya
    mockFindMany.mockResolvedValue([dbDesigners[1], dbDesigners[0], dbDesigners[2]]);
    const results = await getFilteredDesigners({ sort: "az" });
    expect(results[0].name).toBe("Felix Kwan");
    expect(results[1].name).toBe("Mara Lindt");
    expect(results[2].name).toBe("Priya Sharma");
  });

  it("passes Z→A rows through in the order Prisma returns them", async () => {
    // Z→A: Priya, Mara, Felix
    mockFindMany.mockResolvedValue([dbDesigners[2], dbDesigners[0], dbDesigners[1]]);
    const results = await getFilteredDesigners({ sort: "za" });
    expect(results[0].name).toBe("Priya Sharma");
    expect(results[2].name).toBe("Felix Kwan");
  });

  it("passes newest-first rows through in the order Prisma returns them", async () => {
    // Newest-first: Priya (Mar), Felix (Feb), Mara (Jan)
    mockFindMany.mockResolvedValue([dbDesigners[2], dbDesigners[1], dbDesigners[0]]);
    const results = await getFilteredDesigners({ sort: "newest" });
    expect(results[0].id).toBe("dp3");
    expect(results[2].id).toBe("dp1");
  });
});

// ── Constants ─────────────────────────────────────────────────────────────────

describe("ALL_SPECIALTIES", () => {
  it("is a non-empty array of strings", () => {
    expect(Array.isArray(ALL_SPECIALTIES)).toBe(true);
    expect(ALL_SPECIALTIES.length).toBeGreaterThan(0);
    for (const s of ALL_SPECIALTIES) {
      expect(typeof s).toBe("string");
    }
  });

  it("includes common design specialties", () => {
    expect(ALL_SPECIALTIES).toContain("Branding");
    expect(ALL_SPECIALTIES).toContain("UX/UI");
  });
});

describe("AVAILABILITY_LABELS / EXPERIENCE_LABELS", () => {
  it("AVAILABILITY_LABELS covers all three availability states", () => {
    expect(AVAILABILITY_LABELS.available).toBeTruthy();
    expect(AVAILABILITY_LABELS.freelance).toBeTruthy();
    expect(AVAILABILITY_LABELS.unavailable).toBeTruthy();
  });

  it("EXPERIENCE_LABELS covers junior, mid, and senior", () => {
    expect(EXPERIENCE_LABELS.junior).toBeTruthy();
    expect(EXPERIENCE_LABELS.mid).toBeTruthy();
    expect(EXPERIENCE_LABELS.senior).toBeTruthy();
  });
});

// ── getUniqueLocations ────────────────────────────────────────────────────────

describe("getUniqueLocations", () => {
  it("maps { locationCity } rows to a plain string array", async () => {
    mockFindMany.mockResolvedValue([
      { locationCity: "Berlin" },
      { locationCity: "Hong Kong" },
      { locationCity: "London" },
    ]);
    const locations = await getUniqueLocations();
    expect(locations).toEqual(["Berlin", "Hong Kong", "London"]);
  });

  it("returns an empty array when Prisma returns no rows", async () => {
    mockFindMany.mockResolvedValue([]);
    const locations = await getUniqueLocations();
    expect(locations).toEqual([]);
  });
});
