import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { getFeaturedPosts, formatPostDate, CATEGORY_STYLES } from "@/lib/data/posts";

export async function BlogPreviewSection() {
  const posts = await getFeaturedPosts(3);

  return (
    <section id="blog" className="bg-background py-24 lg:py-36">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="mb-14 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="mb-8 inline-flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
              <span className="h-px w-10 bg-muted-foreground/40" />
              From the Blog
            </p>
            <h2
              className="font-bold leading-[0.95] tracking-tight text-foreground"
              style={{ fontSize: "clamp(2.5rem, 5.5vw, 4.5rem)" }}
            >
              Ideas on{" "}
              <span className="italic font-light">design craft.</span>
            </h2>
          </div>
          <Link
            href="/blog"
            className="group inline-flex shrink-0 items-center gap-2 text-sm font-semibold text-foreground underline-offset-4 hover:underline"
          >
            All articles
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 gap-px border border-border bg-border sm:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => {
            const categoryStyle =
              CATEGORY_STYLES[post.category] ?? "bg-zinc-500/15 text-zinc-500 dark:text-zinc-400";
            return (
              <article
                key={post.slug}
                className="group flex flex-col bg-background p-8 transition-colors duration-200 hover:bg-card/80"
              >
                {/* Category + date */}
                <div className="flex items-center justify-between">
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${categoryStyle}`}
                  >
                    {post.category}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {formatPostDate(post.date)}
                  </span>
                </div>

                {/* Title */}
                <h3 className="mt-6 text-xl font-semibold leading-snug tracking-tight text-foreground">
                  <Link
                    href={`/blog/${post.slug}`}
                    className="hover:underline underline-offset-2"
                  >
                    {post.title}
                  </Link>
                </h3>

                {/* Excerpt */}
                <p className="mt-3 flex-1 text-sm leading-relaxed text-muted-foreground">
                  {post.excerpt}
                </p>

                {/* Footer */}
                <div className="mt-8 flex items-center justify-between border-t border-border pt-5">
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-7 w-7 items-center justify-center rounded-full bg-muted text-xs font-semibold text-muted-foreground">
                      {post.author.name[0]}
                    </div>
                    <span className="text-xs font-medium text-foreground">
                      {post.author.name}
                    </span>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {post.readTime}
                  </span>
                </div>
              </article>
            );
          })}
        </div>

      </div>
    </section>
  );
}
