import postsData from "@/data/posts.json";

// ── Public types ─────────────────────────────────────────────────────────────

export interface PostAuthor {
  name: string;
  title: string;
}

export interface Post {
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  author: PostAuthor;
  date: string; // ISO: "2026-01-14"
  readTime: string;
  featured: boolean;
  body: string;
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

export function formatPostDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

// ── Data ──────────────────────────────────────────────────────────────────────

const posts = postsData as Post[];

// ── Query functions (async to match the Prisma interface) ─────────────────────

export async function getAllPosts(): Promise<Post[]> {
  return [...posts].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );
}

export async function getPostBySlug(slug: string): Promise<Post | undefined> {
  return posts.find((p) => p.slug === slug);
}

export async function getFeaturedPosts(limit = 3): Promise<Post[]> {
  return posts.filter((p) => p.featured).slice(0, limit);
}

export async function getRelatedPosts(current: Post, limit = 3): Promise<Post[]> {
  return posts
    .filter((p) => p.slug !== current.slug && p.category === current.category)
    .slice(0, limit);
}
