import { prisma } from "@/lib/prisma";

// ── Public types ─────────────────────────────────────────────────────────────

export interface PostAuthor {
  name: string;
  title: string;
}

export type RichBlock =
  | { type: "paragraph"; content: string }
  | { type: "heading"; content: string }
  | { type: "image"; url: string; caption: string };

export interface Post {
  slug: string;
  title: string;
  subtitle: string;
  excerpt: string;
  coverImageUrl: string;
  contentBlocks: RichBlock[];
  category: string;
  author: PostAuthor;
  date: string; // ISO: "2026-01-14"
  readTime: string;
  featured: boolean;
  body: string; // legacy plain-text body for seeded posts
}

// ── Constants ─────────────────────────────────────────────────────────────────

export const CATEGORY_STYLES: Record<string, string> = {
  Branding:   "bg-stone-500/15 text-stone-600 dark:text-stone-400",
  UX:         "bg-slate-500/15 text-slate-600 dark:text-slate-400",
  Motion:     "bg-zinc-500/15 text-zinc-500 dark:text-zinc-400",
  Typography: "bg-orange-500/15 text-orange-600 dark:text-orange-400",
  Process:    "bg-blue-500/15 text-blue-600 dark:text-blue-400",
  Color:      "bg-violet-500/15 text-violet-600 dark:text-violet-400",
  Career:     "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
  Layout:     "bg-amber-500/15 text-amber-600 dark:text-amber-400",
  Strategy:   "bg-rose-500/15 text-rose-600 dark:text-rose-400",
};

export function formatPostDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

// ── Mapper ────────────────────────────────────────────────────────────────────

function mapPost(p: {
  slug: string;
  title: string;
  subtitle: string;
  excerpt: string;
  coverImageUrl: string;
  contentBlocks: unknown;
  category: string;
  authorName: string;
  authorTitle: string;
  publishedAt: Date;
  readTime: string;
  featured: boolean;
  body: string;
}): Post {
  return {
    slug: p.slug,
    title: p.title,
    subtitle: p.subtitle ?? "",
    excerpt: p.excerpt,
    coverImageUrl: p.coverImageUrl ?? "",
    contentBlocks: Array.isArray(p.contentBlocks) ? (p.contentBlocks as RichBlock[]) : [],
    category: p.category,
    author: { name: p.authorName, title: p.authorTitle },
    date: p.publishedAt.toISOString().slice(0, 10),
    readTime: p.readTime,
    featured: p.featured,
    body: p.body,
  };
}

// ── Query functions ───────────────────────────────────────────────────────────

export async function getAllPosts(): Promise<Post[]> {
  const posts = await prisma.blogPost.findMany({
    orderBy: { publishedAt: "desc" },
  });
  return posts.map(mapPost);
}

export async function getPostBySlug(slug: string): Promise<Post | undefined> {
  const p = await prisma.blogPost.findUnique({ where: { slug } });
  return p ? mapPost(p) : undefined;
}

export async function getFeaturedPosts(limit = 3): Promise<Post[]> {
  const posts = await prisma.blogPost.findMany({
    where: { featured: true },
    orderBy: { publishedAt: "desc" },
    take: limit,
  });
  return posts.map(mapPost);
}

export async function getRelatedPosts(current: Post, limit = 3): Promise<Post[]> {
  const posts = await prisma.blogPost.findMany({
    where: {
      slug: { not: current.slug },
      category: current.category,
    },
    orderBy: { publishedAt: "desc" },
    take: limit,
  });
  return posts.map(mapPost);
}
