import Link from "next/link";
import type { Metadata } from "next";
import { PageWrapper } from "@/components/layout/PageWrapper";
import { BlogGrid } from "@/components/blog/BlogGrid";
import {
  getAllPosts,
  getFeaturedPosts,
  formatPostDate,
  CATEGORY_STYLES,
} from "@/lib/data/posts";

export const metadata: Metadata = {
  title: "Blog",
  description:
    "Ideas on design craft — branding, UX, motion, typography, and the practice of design.",
  openGraph: {
    title: "Blog — Rightstar Collective",
    description:
      "Ideas on design craft — branding, UX, motion, typography, and the practice of design.",
  },
};

export default async function BlogIndexPage() {
  const [featuredList, allPosts] = await Promise.all([
    getFeaturedPosts(1),
    getAllPosts(),
  ]);
  const featured = featuredList[0];
  const remaining = featured
    ? allPosts.filter((p) => p.slug !== featured.slug)
    : allPosts;

  return (
    <PageWrapper>
      {/* Page header */}
      <div className="mb-12 border-b border-border pb-8">
        <p className="mb-3 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          <span className="h-px w-8 bg-foreground/30" />
          Rightstar Collective
        </p>
        <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
          Blog
        </h1>
        <p className="mt-3 max-w-xl text-base text-muted-foreground">
          Ideas on design craft — branding, UX, motion, typography, and the
          practice of creative work.
        </p>
      </div>

      {/* Featured post — wider, more prominent */}
      {featured && (
        <div className="mb-10">
          <p className="mb-4 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            Featured
          </p>
          <Link
            href={`/blog/${featured.slug}`}
            className="group flex flex-col gap-6 overflow-hidden rounded-xl border border-border bg-background p-8 transition-colors hover:bg-muted/40 sm:flex-row sm:items-start sm:gap-10 lg:p-10"
          >
            {/* Left: category + title + excerpt */}
            <div className="flex-1 min-w-0">
              <span
                className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                  CATEGORY_STYLES[featured.category] ??
                  "bg-zinc-100 text-zinc-700"
                }`}
              >
                {featured.category}
              </span>
              <h2 className="mt-4 text-2xl font-bold leading-snug tracking-tight text-foreground group-hover:underline group-hover:underline-offset-2 sm:text-3xl">
                {featured.title}
              </h2>
              <p className="mt-3 text-base leading-relaxed text-muted-foreground">
                {featured.excerpt}
              </p>
            </div>

            {/* Right: author + meta */}
            <div className="flex shrink-0 flex-row items-center gap-3 sm:flex-col sm:items-end sm:gap-4 sm:text-right">
              <div className="flex items-center gap-2 sm:flex-col sm:items-end sm:gap-1">
                <p className="text-sm font-medium text-foreground">
                  {featured.author.name}
                </p>
                <p className="text-xs text-muted-foreground">
                  {featured.author.title}
                </p>
              </div>
              <div className="text-xs text-muted-foreground">
                <p>{formatPostDate(featured.date)}</p>
                <p className="mt-0.5">{featured.readTime}</p>
              </div>
            </div>
          </Link>
        </div>
      )}

      {/* All remaining posts */}
      {remaining.length > 0 && (
        <>
          <p className="mb-4 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            All Articles
          </p>
          <BlogGrid posts={remaining} />
        </>
      )}
    </PageWrapper>
  );
}
