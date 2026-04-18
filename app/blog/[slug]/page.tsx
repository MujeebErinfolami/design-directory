import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { PageWrapper } from "@/components/layout/PageWrapper";
import { AuthorByline } from "@/components/blog/AuthorByline";
import { BlogCard } from "@/components/blog/BlogCard";
import {
  getAllPosts,
  getPostBySlug,
  getRelatedPosts,
  formatPostDate,
  CATEGORY_STYLES,
} from "@/lib/data/posts";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const posts = await getAllPosts();
  return posts.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) return { title: "Post not found" };
  return {
    title: post.title,
    description: post.excerpt,
    openGraph: {
      title: `${post.title} — Design Directory`,
      description: post.excerpt,
    },
  };
}

export default async function BlogPostPage({ params }: PageProps) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) notFound();

  const related = await getRelatedPosts(post, 3);
  const categoryStyle =
    CATEGORY_STYLES[post.category] ?? "bg-zinc-100 text-zinc-700";

  return (
    <PageWrapper>
      {/* Back link */}
      <Link
        href="/blog"
        className="group mb-10 inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-3.5 w-3.5 transition-transform group-hover:-translate-x-0.5" />
        All articles
      </Link>

      {/* Article */}
      <article className="mx-auto max-w-2xl">
        {/* Category */}
        <span
          className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${categoryStyle}`}
        >
          {post.category}
        </span>

        {/* Title */}
        <h1 className="mt-5 text-3xl font-bold leading-tight tracking-tight text-foreground sm:text-4xl">
          {post.title}
        </h1>

        {/* Excerpt */}
        <p className="mt-4 text-lg leading-relaxed text-muted-foreground">
          {post.excerpt}
        </p>

        {/* Byline */}
        <div className="mt-8 border-t border-border pt-8">
          <AuthorByline
            author={post.author}
            date={formatPostDate(post.date)}
            readTime={post.readTime}
          />
        </div>

        {/* Body */}
        <div className="mt-10 space-y-6">
          {post.body.split("\n\n").map((para, i) => (
            <p
              key={i}
              className="text-base leading-relaxed text-foreground/80"
            >
              {para}
            </p>
          ))}
        </div>
      </article>

      {/* Related posts */}
      {related.length > 0 && (
        <div className="mt-20">
          <div className="mb-6 flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              More in {post.category}
            </p>
            <Link
              href="/blog"
              className="text-xs font-medium text-muted-foreground underline-offset-2 hover:text-foreground hover:underline"
            >
              All articles
            </Link>
          </div>
          <div className="grid grid-cols-1 gap-px border border-border bg-border sm:grid-cols-2 lg:grid-cols-3">
            {related.map((r) => (
              <BlogCard key={r.slug} post={r} />
            ))}
          </div>
        </div>
      )}

      {related.length === 0 && (
        <div className="mt-16 text-center">
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 rounded-md border border-border px-5 py-2.5 text-sm font-medium text-muted-foreground hover:text-foreground"
          >
            Browse all articles
          </Link>
        </div>
      )}
    </PageWrapper>
  );
}
