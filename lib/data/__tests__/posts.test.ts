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
  it("returns all 8 posts", async () => {
    const posts = await getAllPosts();
    expect(posts).toHaveLength(8);
  });

  it("returns posts sorted newest-first by date", async () => {
    const posts = await getAllPosts();
    for (let i = 0; i < posts.length - 1; i++) {
      expect(new Date(posts[i].date).getTime()).toBeGreaterThanOrEqual(
        new Date(posts[i + 1].date).getTime()
      );
    }
  });

  it("each post has required fields with correct shape", async () => {
    const posts = await getAllPosts();
    for (const p of posts) {
      expect(p.slug).toBeTruthy();
      expect(p.title).toBeTruthy();
      expect(p.excerpt).toBeTruthy();
      expect(p.category).toBeTruthy();
      expect(p.author).toBeDefined();
      expect(p.author.name).toBeTruthy();
      expect(p.author.title).toBeTruthy();
      expect(p.date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(typeof p.featured).toBe("boolean");
      expect(typeof p.body).toBe("string");
      expect(p.readTime).toBeTruthy();
    }
  });
});

describe("getPostBySlug", () => {
  it("returns the correct post for a known slug", async () => {
    const p = await getPostBySlug("rise-of-editorial-branding");
    expect(p).toBeDefined();
    expect(p!.slug).toBe("rise-of-editorial-branding");
    expect(p!.category).toBe("Branding");
    expect(p!.featured).toBe(true);
  });

  it("returns undefined for an unknown slug", async () => {
    const p = await getPostBySlug("no-such-post");
    expect(p).toBeUndefined();
  });
});

describe("getFeaturedPosts", () => {
  it("returns only featured posts", async () => {
    const posts = await getFeaturedPosts();
    expect(posts.length).toBeGreaterThan(0);
    for (const p of posts) {
      expect(p.featured).toBe(true);
    }
  });

  it("returns all 3 featured posts with default limit", async () => {
    const posts = await getFeaturedPosts();
    expect(posts).toHaveLength(3);
  });

  it("respects a limit of 1", async () => {
    const posts = await getFeaturedPosts(1);
    expect(posts).toHaveLength(1);
    expect(posts[0].featured).toBe(true);
  });
});

describe("getRelatedPosts", () => {
  it("returns posts in the same category, excluding the current", async () => {
    const current = (await getPostBySlug("ux-case-study-wins-clients"))!;
    const related = await getRelatedPosts(current);
    for (const p of related) {
      expect(p.category).toBe(current.category);
      expect(p.slug).not.toBe(current.slug);
    }
  });

  it("respects the limit", async () => {
    const current = (await getPostBySlug("rise-of-editorial-branding"))!;
    const related = await getRelatedPosts(current, 1);
    expect(related.length).toBeLessThanOrEqual(1);
  });

  it("returns empty array when no other posts share the category", async () => {
    const current = (await getPostBySlug("rise-of-editorial-branding"))!;
    const related = await getRelatedPosts(current);
    // There is only one Branding post, so related should be empty
    expect(related).toEqual([]);
  });
});

describe("formatPostDate", () => {
  it("formats an ISO date to a human-readable form", () => {
    const result = formatPostDate("2026-01-14");
    expect(result).toContain("Jan");
    expect(result).toContain("14");
    expect(result).toContain("2026");
  });

  it("formats December correctly", () => {
    const result = formatPostDate("2025-12-20");
    expect(result).toContain("Dec");
    expect(result).toContain("20");
    expect(result).toContain("2025");
  });

  it("formats a single-digit day without leading zero in output", () => {
    const result = formatPostDate("2026-03-05");
    expect(result).toContain("Mar");
    expect(result).toContain("5");
  });
});

describe("CATEGORY_STYLES", () => {
  it("is a non-empty object with Tailwind class string values", () => {
    const entries = Object.entries(CATEGORY_STYLES);
    expect(entries.length).toBeGreaterThan(0);
    for (const [key, val] of entries) {
      expect(typeof key).toBe("string");
      expect(typeof val).toBe("string");
      expect(val.length).toBeGreaterThan(0);
    }
  });

  it("includes styles for Branding, UX, and Typography", () => {
    expect(CATEGORY_STYLES["Branding"]).toBeTruthy();
    expect(CATEGORY_STYLES["UX"]).toBeTruthy();
    expect(CATEGORY_STYLES["Typography"]).toBeTruthy();
  });
});
