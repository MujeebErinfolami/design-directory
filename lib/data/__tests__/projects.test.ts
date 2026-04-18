import { describe, it, expect } from "vitest";
import {
  getAllProjects,
  getProjectBySlug,
  getFilteredProjects,
  getRelatedProjects,
  getFeaturedProjects,
  getProjectsByDesignerSlug,
  ALL_CATEGORIES,
  type Category,
} from "../projects";

describe("getAllProjects", () => {
  it("returns an array of projects", async () => {
    const projects = await getAllProjects();
    expect(Array.isArray(projects)).toBe(true);
    expect(projects.length).toBeGreaterThan(0);
  });

  it("returns projects sorted newest first", async () => {
    const projects = await getAllProjects();
    for (let i = 0; i < projects.length - 1; i++) {
      const a = new Date(projects[i].createdAt).getTime();
      const b = new Date(projects[i + 1].createdAt).getTime();
      expect(a).toBeGreaterThanOrEqual(b);
    }
  });

  it("each project has required fields", async () => {
    const projects = await getAllProjects();
    for (const p of projects) {
      expect(p.id).toBeTruthy();
      expect(p.slug).toBeTruthy();
      expect(p.title).toBeTruthy();
      expect(p.category).toBeTruthy();
      expect(ALL_CATEGORIES).toContain(p.category);
      expect(p.designer).toBeTruthy();
      expect(p.designer.slug).toBeTruthy();
    }
  });
});

describe("getProjectBySlug", () => {
  it("returns a project for a valid slug", async () => {
    const projects = await getAllProjects();
    const first = projects[0];
    const found = await getProjectBySlug(first.slug);
    expect(found).toBeDefined();
    expect(found!.slug).toBe(first.slug);
  });

  it("returns undefined for a non-existent slug", async () => {
    const result = await getProjectBySlug("this-slug-does-not-exist-xyz");
    expect(result).toBeUndefined();
  });
});

describe("getFilteredProjects", () => {
  it("returns all projects when no category is given", async () => {
    const all = await getAllProjects();
    const filtered = await getFilteredProjects(null);
    expect(filtered.length).toBe(all.length);
  });

  it("filters by each valid category", async () => {
    for (const cat of ALL_CATEGORIES) {
      const filtered = await getFilteredProjects(cat as Category);
      for (const p of filtered) {
        expect(p.category).toBe(cat);
      }
    }
  });

  it("sorts by oldest", async () => {
    const projects = await getFilteredProjects(null, "oldest");
    for (let i = 0; i < projects.length - 1; i++) {
      const a = new Date(projects[i].createdAt).getTime();
      const b = new Date(projects[i + 1].createdAt).getTime();
      expect(a).toBeLessThanOrEqual(b);
    }
  });

  it("sorts by featured first", async () => {
    const projects = await getFilteredProjects(null, "featured");
    const firstNonFeatured = projects.findIndex((p) => !p.featured);
    if (firstNonFeatured !== -1) {
      for (let i = firstNonFeatured; i < projects.length; i++) {
        expect(projects[i].featured).toBe(false);
      }
    }
  });
});

describe("getRelatedProjects", () => {
  it("returns projects with the same category excluding the current one", async () => {
    const projects = await getAllProjects();
    const current = projects[0];
    const related = await getRelatedProjects(current);
    for (const p of related) {
      expect(p.category).toBe(current.category);
      expect(p.id).not.toBe(current.id);
    }
  });

  it("respects the limit parameter", async () => {
    const projects = await getAllProjects();
    const current = projects[0];
    const related = await getRelatedProjects(current, 2);
    expect(related.length).toBeLessThanOrEqual(2);
  });
});

describe("getFeaturedProjects", () => {
  it("returns only featured projects", async () => {
    const featured = await getFeaturedProjects();
    for (const p of featured) {
      expect(p.featured).toBe(true);
    }
  });

  it("respects the limit parameter", async () => {
    const featured = await getFeaturedProjects(2);
    expect(featured.length).toBeLessThanOrEqual(2);
  });
});

describe("getProjectsByDesignerSlug", () => {
  it("returns projects for a known designer slug", async () => {
    const projects = await getAllProjects();
    const designerSlug = projects[0].designer.slug;
    const result = await getProjectsByDesignerSlug(designerSlug);
    expect(result.length).toBeGreaterThan(0);
    for (const p of result) {
      expect(p.designer.slug).toBe(designerSlug);
    }
  });

  it("returns empty array for unknown designer slug", async () => {
    const result = await getProjectsByDesignerSlug("unknown-designer-xyz");
    expect(result).toEqual([]);
  });
});
