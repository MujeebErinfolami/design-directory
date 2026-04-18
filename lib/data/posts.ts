import { prisma } from "@/lib/prisma";
import type { BlogPost as PrismaPost } from "@prisma/client";

// ── Public types ──────────────────────────────────────────────────────────────

export interface PostAuthor {
  name:  string;
  title: string;
}

export interface Post {
  slug:     string;
  title:    string;
  excerpt:  string;
  category: string;
  author:   PostAuthor;
  date:     string; // ISO "YYYY-MM-DD"
  readTime: string;
  featured: boolean;
  body:     string;
}

// ── Constants ─────────────────────────────────────────────────────────────────

export const CATEGORY_STYLES: Record<string, string> = {
  Branding:   "bg-stone-100 text-stone-700",
  UX:         "bg-slate-100 text-slate-700",
  Motion:     "bg-zinc-100 text-zinc-700",
  Typography: "bg-orange-50 text-orange-700",
  Process:    "bg-blue-50 text-blue-700",
  Color:      "bg-violet-50 text-violet-700",
  Career:     "bg-emerald-50 text-emerald-700",
  Layout:     "bg-amber-50 text-amber-700",
};

// ── Mapper ────────────────────────────────────────────────────────────────────

function toPost(p: PrismaPost): Post {
  return {
    slug:     p.slug,
    title:    p.title,
    excerpt:  p.excerpt,
    category: p.category,
    author:   { name: p.authorName, title: p.authorTitle },
    date:     p.publishedAt.toISOString().slice(0, 10),
    readTime: p.readTime,
    featured: p.featured,
    body:     p.body,
  };
}

// ── Utilities ─────────────────────────────────────────────────────────────────

export function formatPostDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    year:  "numeric",
    month: "short",
    day:   "numeric",
  });
}

// ── Query functions ───────────────────────────────────────────────────────────

export async function getAllPosts(): Promise<Post[]> {
  const rows = await prisma.blogPost.findMany({
    orderBy: { publishedAt: "desc" },
  });
  return rows.map(toPost);
}

export async function getPostBySlug(slug: string): Promise<Post | undefined> {
  const row = await prisma.blogPost.findUnique({ where: { slug } });
  return row ? toPost(row) : undefined;
}

export async function getFeaturedPosts(limit = 3): Promise<Post[]> {
  const rows = await prisma.blogPost.findMany({
    where:   { featured: true },
    orderBy: { publishedAt: "desc" },
    take:    limit,
  });
  return rows.map(toPost);
}

export async function getRelatedPosts(current: Post, limit = 3): Promise<Post[]> {
  const rows = await prisma.blogPost.findMany({
    where:   { category: current.category, NOT: { slug: current.slug } },
    orderBy: { publishedAt: "desc" },
    take:    limit,
  });
  return rows.map(toPost);
}
