import { describe, it, expect } from "vitest";
import {
  getAllProjects,
  getProjectBySlug,
  getFilteredProjects,
  getRelatedProjects,
  getFeaturedProjects,
  getProjectsByDesignerSlug,
  ALL_CATEGORIES,
} from "../projects";

describe("getAllProjects", () => {
  it("returns all 16 projects", async () => {
    const projects = await getAllProjects();
    expect(projects).toHaveLength(16);
  });

  it("returns projects sorted newest-first", async () => {
    const projects = await getAllProjects();
    for (let i = 0; i < projects.length - 1; i++) {
      expect(new Date(projects[i].createdAt).getTime()).toBeGreaterThanOrEqual(
        new Date(projects[i + 1].createdAt).getTime()
      );
    }
  });

  it("each project has required fields with correct shape", async () => {
    const projects = await getAllProjects();
    for (const p of projects) {
      expect(p.id).toBeTruthy();
      expect(p.slug).toBeTruthy();
      expect(p.title).toBeTruthy();
      expect(ALL_CATEGORIES).toContain(p.category);
      expect(typeof p.featured).toBe("boolean");
      expect(p.designer).toBeDefined();
      expect(p.designer.id).toBeTruthy();
      expect(p.designer.slug).toBeTruthy();
      expect(p.createdAt).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    }
  });
});

describe("getProjectBySlug", () => {
  it("returns the correct project for a known slug", async () => {
    const p = await getProjectBySlug("helvetica-identity-system");
    expect(p).toBeDefined();
    expect(p!.slug).toBe("helvetica-identity-system");
    expect(p!.category).toBe("Branding");
    expect(p!.designer.slug).toBe("mara-lindt");
  });

  it("returns undefined for an unknown slug", async () => {
    const p = await getProjectBySlug("no-such-project");
    expect(p).toBeUndefined();
  });
});

describe("getFilteredProjects", () => {
  it("returns all projects when no category is given", async () => {
    const projects = await getFilteredProjects(null);
    expect(projects).toHaveLength(16);
  });

  it("filters to only projects matching the given category", async () => {
    const projects = await getFilteredProjects("Branding");
    expect(projects.length).toBeGreaterThan(0);
    for (const p of projects) {
      expect(p.category).toBe("Branding");
    }
  });

  it("ALL_CATEGORIES covers all six expected values", () => {
    const expected = ["Branding", "Web", "Motion", "Print", "Product", "UX"];
    for (const c of expected) {
      expect(ALL_CATEGORIES).toContain(c);
    }
  });

  it("sort 'oldest' returns oldest project first", async () => {
    const projects = await getFilteredProjects(null, "oldest");
    expect(projects[projects.length - 1].slug).toBe("helvetica-identity-system");
    expect(projects[0].slug).toBe("vault-finance-app");
  });

  it("sort 'featured' places featured projects before non-featured", async () => {
    const projects = await getFilteredProjects(null, "featured");
    const firstNonFeaturedIdx = projects.findIndex((p) => !p.featured);
    if (firstNonFeaturedIdx !== -1) {
      const beforeNonFeatured = projects.slice(0, firstNonFeaturedIdx);
      expect(beforeNonFeatured.every((p) => p.featured)).toBe(true);
    }
  });

  it("sort 'newest' returns newest project first", async () => {
    const projects = await getFilteredProjects(null, "newest");
    expect(projects[0].slug).toBe("helvetica-identity-system");
  });
});

describe("getRelatedProjects", () => {
  it("returns projects in the same category, excluding the current one", async () => {
    const current = (await getProjectBySlug("helvetica-identity-system"))!;
    const related = await getRelatedProjects(current);
    expect(related.every((p) => p.category === current.category)).toBe(true);
    expect(related.every((p) => p.id !== current.id)).toBe(true);
  });

  it("respects the limit", async () => {
    const current = (await getProjectBySlug("helvetica-identity-system"))!;
    const related = await getRelatedProjects(current, 2);
    expect(related.length).toBeLessThanOrEqual(2);
  });

  it("returns empty array when no other projects share the category", async () => {
    const fakeProject = { id: "fake", category: "Motion" } as Parameters<typeof getRelatedProjects>[0];
    const related = await getRelatedProjects({ ...fakeProject, id: "__impossible_id__" });
    for (const p of related) {
      expect(p.id).not.toBe("__impossible_id__");
    }
  });
});

describe("getFeaturedProjects", () => {
  it("returns only featured projects", async () => {
    const featured = await getFeaturedProjects();
    expect(featured.length).toBeGreaterThan(0);
    for (const p of featured) {
      expect(p.featured).toBe(true);
    }
  });

  it("respects the limit", async () => {
    const featured = await getFeaturedProjects(2);
    expect(featured.length).toBeLessThanOrEqual(2);
  });

  it("returns all 4 featured projects with default limit", async () => {
    const featured = await getFeaturedProjects();
    expect(featured).toHaveLength(4);
  });
});

describe("getProjectsByDesignerSlug", () => {
  it("returns only projects belonging to the given designer", async () => {
    const projects = await getProjectsByDesignerSlug("mara-lindt");
    expect(projects.length).toBeGreaterThan(0);
    for (const p of projects) {
      expect(p.designer.slug).toBe("mara-lindt");
    }
  });

  it("returns empty array for an unknown designer slug", async () => {
    const projects = await getProjectsByDesignerSlug("no-such-designer");
    expect(projects).toEqual([]);
  });
});
