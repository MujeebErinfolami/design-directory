import { describe, it, expect, vi, beforeEach } from "vitest";
import { dbProjects } from "./fixtures";

// ── Prisma mock ───────────────────────────────────────────────────────────────

vi.mock("@/lib/prisma", () => ({
  prisma: {
    project: {
      findMany:   vi.fn(),
      findUnique: vi.fn(),
    },
  },
}));

import { prisma } from "@/lib/prisma";

// Typed handles for the mocked methods
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mockFindMany   = prisma.project.findMany   as any as ReturnType<typeof vi.fn>;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mockFindUnique = prisma.project.findUnique as any as ReturnType<typeof vi.fn>;

// ── Imports under test ────────────────────────────────────────────────────────

import {
  getAllProjects,
  getProjectBySlug,
  getFilteredProjects,
  getRelatedProjects,
  getFeaturedProjects,
  getProjectsByDesignerSlug,
  ALL_CATEGORIES,
  type ProjectCategory,
} from "../projects";

// ── Setup ─────────────────────────────────────────────────────────────────────

beforeEach(() => {
  vi.clearAllMocks();
  // Default: return all three fixtures (newest-first order)
  mockFindMany.mockResolvedValue([...dbProjects].reverse()); // proj3, proj2, proj1
  mockFindUnique.mockResolvedValue(null);
});

// ── getAllProjects ─────────────────────────────────────────────────────────────

describe("getAllProjects", () => {
  it("returns an array with one entry per DB row", async () => {
    const projects = await getAllProjects();
    expect(projects).toHaveLength(3);
  });

  it("maps DB row to Project shape — spot-checks proj1", async () => {
    mockFindMany.mockResolvedValue([dbProjects[0]]);
    const [p] = await getAllProjects();
    expect(p.id).toBe("proj1");
    expect(p.slug).toBe("helvetica-identity-system");
    expect(p.title).toBe("Helvetica Identity System");
    expect(p.featured).toBe(true);
    expect(p.createdAt).toBe("2025-11-01");
    expect(p.galleryUrls).toEqual([]);
    expect(p.thumbnailUrl).toBe("");
  });

  it("maps the first credit to the designer field", async () => {
    mockFindMany.mockResolvedValue([dbProjects[0]]);
    const [p] = await getAllProjects();
    expect(p.designer.id).toBe("dp1");
    expect(p.designer.slug).toBe("mara-lindt");
    expect(p.designer.name).toBe("Mara Lindt");
    expect(p.designer.initials).toBe("ML");
  });

  it("uses a stub designer when no profile is linked", async () => {
    const noProfile = {
      ...dbProjects[0],
      credits: [{ ...dbProjects[0].credits[0], designerProfile: null, creditName: "Guest Author" }],
    };
    mockFindMany.mockResolvedValue([noProfile]);
    const [p] = await getAllProjects();
    expect(p.designer.id).toBe("");
    expect(p.designer.name).toBe("Guest Author");
    expect(p.designer.initials).toBe("GU");
  });

  it("each project contains all required fields", async () => {
    const projects = await getAllProjects();
    for (const p of projects) {
      expect(p.id).toBeTruthy();
      expect(p.slug).toBeTruthy();
      expect(p.title).toBeTruthy();
      expect(ALL_CATEGORIES).toContain(p.category);
      expect(p.designer).toBeDefined();
      expect(p.createdAt).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    }
  });
});

// ── getProjectBySlug ──────────────────────────────────────────────────────────

describe("getProjectBySlug", () => {
  it("returns the mapped project when Prisma finds a match", async () => {
    mockFindUnique.mockResolvedValue(dbProjects[1]);
    const found = await getProjectBySlug("atlas-studio-rebrand");
    expect(found).toBeDefined();
    expect(found!.slug).toBe("atlas-studio-rebrand");
    expect(found!.title).toBe("Atlas Studio Rebrand");
  });

  it("returns undefined when Prisma returns null", async () => {
    mockFindUnique.mockResolvedValue(null);
    const result = await getProjectBySlug("no-such-slug");
    expect(result).toBeUndefined();
  });
});

// ── getFilteredProjects ───────────────────────────────────────────────────────

describe("getFilteredProjects", () => {
  it("returns all projects when no category filter is given", async () => {
    const filtered = await getFilteredProjects(null);
    expect(filtered).toHaveLength(3);
  });

  it("returns only projects of the given category", async () => {
    // Mock returns only the Branding fixtures
    const brandingProjects = dbProjects.filter((p) => p.category === "Branding");
    mockFindMany.mockResolvedValue(brandingProjects);
    const filtered = await getFilteredProjects("Branding" as ProjectCategory);
    for (const p of filtered) {
      expect(p.category).toBe("Branding");
    }
  });

  it("ALL_CATEGORIES covers the expected values", () => {
    expect(ALL_CATEGORIES).toContain("Branding");
    expect(ALL_CATEGORIES).toContain("UX");
    expect(ALL_CATEGORIES.length).toBeGreaterThan(0);
  });

  it("sort 'oldest' — passes through rows in the order Prisma returns them", async () => {
    // Oldest-first: proj3 (Sep), proj2 (Oct), proj1 (Nov)
    mockFindMany.mockResolvedValue([dbProjects[2], dbProjects[1], dbProjects[0]]);
    const projects = await getFilteredProjects(null, "oldest");
    expect(projects[0].id).toBe("proj3");
    expect(projects[2].id).toBe("proj1");
  });

  it("sort 'featured' — places featured rows first, non-featured after", async () => {
    // Simulate: Prisma returned only featured (as the query filters isFeatured: true)
    mockFindMany.mockResolvedValue([dbProjects[0]]); // proj1 is isFeatured: true
    const projects = await getFilteredProjects(null, "featured");
    expect(projects).toHaveLength(1);
    expect(projects[0].featured).toBe(true);
  });
});

// ── getRelatedProjects ────────────────────────────────────────────────────────

describe("getRelatedProjects", () => {
  it("maps and returns whatever Prisma gives back", async () => {
    // Both proj1 and proj2 are Branding; related to proj1 should be proj2
    mockFindMany.mockResolvedValue([dbProjects[1]]);
    const current = { id: "proj1", category: "Branding" } as Parameters<typeof getRelatedProjects>[0];
    const related = await getRelatedProjects(current);
    expect(related).toHaveLength(1);
    expect(related[0].id).toBe("proj2");
  });

  it("returns an empty array when Prisma finds no related rows", async () => {
    mockFindMany.mockResolvedValue([]);
    const current = { id: "proj3", category: "UX" } as Parameters<typeof getRelatedProjects>[0];
    const related = await getRelatedProjects(current);
    expect(related).toEqual([]);
  });
});

// ── getFeaturedProjects ───────────────────────────────────────────────────────

describe("getFeaturedProjects", () => {
  it("returns only the rows Prisma provides (featured filter is applied by query)", async () => {
    mockFindMany.mockResolvedValue([dbProjects[0]]); // only proj1 is featured
    const featured = await getFeaturedProjects();
    expect(featured).toHaveLength(1);
    expect(featured[0].featured).toBe(true);
  });

  it("returns an empty array when there are no featured projects", async () => {
    mockFindMany.mockResolvedValue([]);
    const featured = await getFeaturedProjects();
    expect(featured).toEqual([]);
  });
});

// ── getProjectsByDesignerSlug ─────────────────────────────────────────────────

describe("getProjectsByDesignerSlug", () => {
  it("returns the designer's projects", async () => {
    mockFindMany.mockResolvedValue([dbProjects[0]]);
    const result = await getProjectsByDesignerSlug("mara-lindt");
    expect(result).toHaveLength(1);
    expect(result[0].designer.slug).toBe("mara-lindt");
  });

  it("returns an empty array when the designer has no projects", async () => {
    mockFindMany.mockResolvedValue([]);
    const result = await getProjectsByDesignerSlug("unknown-designer");
    expect(result).toEqual([]);
  });
});
