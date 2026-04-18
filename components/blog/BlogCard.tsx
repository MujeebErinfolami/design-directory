import Link from "next/link";
import type { Post } from "@/lib/data/posts";
import { formatPostDate, CATEGORY_STYLES } from "@/lib/data/posts";

interface BlogCardProps {
  post: Post;
}

export function BlogCard({ post }: BlogCardProps) {
  const categoryStyle =
    CATEGORY_STYLES[post.category] ?? "bg-zinc-100 text-zinc-700";

  return (
    <article className="group flex flex-col bg-background p-8 transition-colors hover:bg-muted/40">
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
      <h2 className="mt-5 text-lg font-semibold leading-snug tracking-tight text-foreground">
        <Link
          href={`/blog/${post.slug}`}
          className="hover:underline underline-offset-2"
        >
          {post.title}
        </Link>
      </h2>

      {/* Excerpt */}
      <p className="mt-3 flex-1 text-sm leading-relaxed text-muted-foreground">
        {post.excerpt}
      </p>

      {/* Footer */}
      <div className="mt-6 flex items-center justify-between border-t border-border pt-5">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-muted text-xs font-semibold text-muted-foreground">
            {post.author.name[0]}
          </div>
          <span className="text-xs font-medium text-foreground">
            {post.author.name}
          </span>
        </div>
        <span className="text-xs text-muted-foreground">{post.readTime}</span>
      </div>
    </article>
  );
}
