import { describe, it, expect, vi, beforeEach } from "vitest";
import { dbPosts } from "./fixtures";

// ── Prisma mock ───────────────────────────────────────────────────────────────

vi.mock("@/lib/prisma", () => ({
  prisma: {
    blogPost: {
      findMany:   vi.fn(),
      findUnique: vi.fn(),
    },
  },
}));

import { prisma } from "@/lib/prisma";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mockFindMany   = prisma.blogPost.findMany   as any as ReturnType<typeof vi.fn>;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mockFindUnique = prisma.blogPost.findUnique as any as ReturnType<typeof vi.fn>;

// ── Imports under test ────────────────────────────────────────────────────────

import {
  getAllPosts,
  getPostBySlug,
  getFeaturedPosts,
  getRelatedPosts,
  formatPostDate,
  CATEGORY_STYLES,
} from "../posts";

// ── Setup ─────────────────────────────────────────────────────────────────────

beforeEach(() => {
  vi.clearAllMocks();
  // Default: newest-first (post1 Jan 14, post2 Jan 7, post3 Dec 20)
  mockFindMany.mockResolvedValue([dbPosts[0], dbPosts[1], dbPosts[2]]);
  mockFindUnique.mockResolvedValue(null);
});

// ── getAllPosts ────────────────────────────────────────────────────────────────

describe("getAllPosts", () => {
  it("returns one Post per DB row", async () => {
    const posts = await getAllPosts();
    expect(posts).toHaveLength(3);
  });

  it("maps DB row to Post shape — spot-checks post1", async () => {
    mockFindMany.mockResolvedValue([dbPosts[0]]);
    const [p] = await getAllPosts();
    expect(p.slug).toBe("rise-of-editorial-branding");
    expect(p.title).toBe("The Rise of Editorial Branding in 2026");
    expect(p.excerpt).toBe("Brand identities are borrowing the visual language of print journalism.");
    expect(p.category).toBe("Branding");
    expect(p.featured).toBe(true);
    expect(p.date).toBe("2026-01-14");
    expect(p.readTime).toBe("6 min read");
  });

  it("maps author name and title into the author object", async () => {
    mockFindMany.mockResolvedValue([dbPosts[0]]);
    const [p] = await getAllPosts();
    expect(p.author.name).toBe("Mara Lindt");
    expect(p.author.title).toBe("Brand Strategist");
  });

  it("formats publishedAt as YYYY-MM-DD date string", async () => {
    mockFindMany.mockResolvedValue([dbPosts[2]]); // Dec 20 2025
    const [p] = await getAllPosts();
    expect(p.date).toBe("2025-12-20");
  });

  it("each post has required fields", async () => {
    const posts = await getAllPosts();
    for (const p of posts) {
      expect(p.slug).toBeTruthy();
      expect(p.title).toBeTruthy();
      expect(p.excerpt).toBeTruthy();
      expect(p.category).toBeTruthy();
      expect(p.author).toBeDefined();
      expect(p.author.name).toBeTruthy();
      expect(p.date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(typeof p.featured).toBe("boolean");
      expect(typeof p.body).toBe("string");
    }
  });
});

// ── getPostBySlug ─────────────────────────────────────────────────────────────

describe("getPostBySlug", () => {
  it("returns the mapped post when Prisma finds a match", async () => {
    mockFindUnique.mockResolvedValue(dbPosts[1]);
    const found = await getPostBySlug("ux-case-study-wins-clients");
    expect(found).toBeDefined();
    expect(found!.slug).toBe("ux-case-study-wins-clients");
    expect(found!.author.name).toBe("Priya Sharma");
  });

  it("returns undefined when Prisma returns null", async () => {
    mockFindUnique.mockResolvedValue(null);
    const result = await getPostBySlug("does-not-exist");
    expect(result).toBeUndefined();
  });
});

// ── getFeaturedPosts ──────────────────────────────────────────────────────────

describe("getFeaturedPosts", () => {
  it("returns the rows Prisma provides (featured filter is applied by the query)", async () => {
    // post1 and post3 are featured
    mockFindMany.mockResolvedValue([dbPosts[0], dbPosts[2]]);
    const posts = await getFeaturedPosts();
    expect(posts).toHaveLength(2);
    for (const p of posts) {
      expect(p.featured).toBe(true);
    }
  });

  it("respects a limit of 1", async () => {
    mockFindMany.mockResolvedValue([dbPosts[0]]);
    const posts = await getFeaturedPosts(1);
    expect(posts).toHaveLength(1);
  });

  it("returns an empty array when there are no featured posts", async () => {
    mockFindMany.mockResolvedValue([]);
    const posts = await getFeaturedPosts();
    expect(posts).toEqual([]);
  });
});

// ── getRelatedPosts ───────────────────────────────────────────────────────────

describe("getRelatedPosts", () => {
  it("maps and returns the rows Prisma provides", async () => {
    // post1 is Branding; related to another Branding post
    mockFindMany.mockResolvedValue([]);
    const current = { category: "Branding", slug: "rise-of-editorial-branding" } as Parameters<typeof getRelatedPosts>[0];
    const related = await getRelatedPosts(current);
    expect(related).toEqual([]);
  });

  it("returns the correct post shape for related results", async () => {
    mockFindMany.mockResolvedValue([dbPosts[2]]);
    const current = { category: "Typography", slug: "something-else" } as Parameters<typeof getRelatedPosts>[0];
    const related = await getRelatedPosts(current);
    expect(related).toHaveLength(1);
    expect(related[0].slug).toBe("typography-systems-product-design");
    expect(related[0].category).toBe("Typography");
  });

  it("respects the limit — Prisma handles take, so result honours mock length", async () => {
    mockFindMany.mockResolvedValue([dbPosts[2]]);
    const current = { category: "Typography", slug: "other-slug" } as Parameters<typeof getRelatedPosts>[0];
    const related = await getRelatedPosts(current, 2);
    expect(related.length).toBeLessThanOrEqual(2);
  });
});

// ── formatPostDate ────────────────────────────────────────────────────────────

describe("formatPostDate", () => {
  it("formats a valid ISO date string to a human-readable form", () => {
    const result = formatPostDate("2026-01-14");
    expect(result).toMatch(/\w+ \d+, \d{4}/);
    expect(result).toContain("2026");
    expect(result).toContain("Jan");
    expect(result).toContain("14");
  });

  it("correctly formats month and day with no leading zero in output", () => {
    const result = formatPostDate("2026-03-05");
    expect(result).toContain("Mar");
    expect(result).toContain("5");
    expect(result).toContain("2026");
  });

  it("handles December correctly", () => {
    const result = formatPostDate("2025-12-20");
    expect(result).toContain("Dec");
    expect(result).toContain("20");
    expect(result).toContain("2025");
  });
});

// ── CATEGORY_STYLES ───────────────────────────────────────────────────────────

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

  it("includes styles for core categories", () => {
    expect(CATEGORY_STYLES["Branding"]).toBeTruthy();
    expect(CATEGORY_STYLES["UX"]).toBeTruthy();
    expect(CATEGORY_STYLES["Typography"]).toBeTruthy();
  });
});
