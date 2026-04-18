import { describe, it, expect } from "vitest";
import {
  getAllPosts,
  getPostBySlug,
  getFeaturedPosts,
  getRelatedPosts,
  formatPostDate,
  CATEGORY_STYLES,
} from "../posts";

describe("getAllPosts", () => {
  it("returns a non-empty array", async () => {
    const posts = await getAllPosts();
    expect(Array.isArray(posts)).toBe(true);
    expect(posts.length).toBeGreaterThan(0);
  });

  it("returns posts sorted newest first", async () => {
    const posts = await getAllPosts();
    for (let i = 0; i < posts.length - 1; i++) {
      const a = new Date(posts[i].date).getTime();
      const b = new Date(posts[i + 1].date).getTime();
      expect(a).toBeGreaterThanOrEqual(b);
    }
  });

  it("each post has required fields", async () => {
    const posts = await getAllPosts();
    for (const p of posts) {
      expect(p.slug).toBeTruthy();
      expect(p.title).toBeTruthy();
      expect(p.excerpt).toBeTruthy();
      expect(p.category).toBeTruthy();
      expect(p.author).toBeTruthy();
      expect(p.author.name).toBeTruthy();
      expect(p.date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(typeof p.featured).toBe("boolean");
    }
  });
});

describe("getPostBySlug", () => {
  it("returns the correct post for a valid slug", async () => {
    const posts = await getAllPosts();
    const first = posts[0];
    const found = await getPostBySlug(first.slug);
    expect(found).toBeDefined();
    expect(found!.slug).toBe(first.slug);
    expect(found!.title).toBe(first.title);
  });

  it("returns undefined for a non-existent slug", async () => {
    const result = await getPostBySlug("no-such-post-xyz-9999");
    expect(result).toBeUndefined();
  });
});

describe("getFeaturedPosts", () => {
  it("returns only featured posts", async () => {
    const posts = await getFeaturedPosts();
    for (const p of posts) {
      expect(p.featured).toBe(true);
    }
  });

  it("respects the limit parameter", async () => {
    const posts = await getFeaturedPosts(1);
    expect(posts.length).toBeLessThanOrEqual(1);
  });

  it("returns at most all featured posts regardless of limit", async () => {
    const all = await getAllPosts();
    const totalFeatured = all.filter((p) => p.featured).length;
    const result = await getFeaturedPosts(100);
    expect(result.length).toBeLessThanOrEqual(totalFeatured);
  });
});

describe("getRelatedPosts", () => {
  it("excludes the current post from results", async () => {
    const posts = await getAllPosts();
    const current = posts[0];
    const related = await getRelatedPosts(current);
    const slugs = related.map((p) => p.slug);
    expect(slugs).not.toContain(current.slug);
  });

  it("returns posts in the same category", async () => {
    const posts = await getAllPosts();
    const current = posts[0];
    const related = await getRelatedPosts(current);
    for (const p of related) {
      expect(p.category).toBe(current.category);
    }
  });

  it("respects the limit parameter", async () => {
    const posts = await getAllPosts();
    const current = posts[0];
    const related = await getRelatedPosts(current, 2);
    expect(related.length).toBeLessThanOrEqual(2);
  });
});

describe("formatPostDate", () => {
  it("formats a valid ISO date string", () => {
    const result = formatPostDate("2026-01-14");
    // Should produce something like "Jan 14, 2026"
    expect(result).toMatch(/\w+ \d+, \d{4}/);
  });

  it("correctly formats month and year", () => {
    const result = formatPostDate("2026-03-05");
    expect(result).toContain("2026");
    expect(result).toContain("Mar");
    expect(result).toContain("5");
  });
});

describe("CATEGORY_STYLES", () => {
  it("is a non-empty object with string values", () => {
    expect(typeof CATEGORY_STYLES).toBe("object");
    const entries = Object.entries(CATEGORY_STYLES);
    expect(entries.length).toBeGreaterThan(0);
    for (const [key, val] of entries) {
      expect(typeof key).toBe("string");
      expect(typeof val).toBe("string");
      expect(val.length).toBeGreaterThan(0);
    }
  });
});
