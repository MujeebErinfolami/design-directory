import { BlogCard } from "./BlogCard";
import type { Post } from "@/lib/data/posts";

interface BlogGridProps {
  posts: Post[];
}

export function BlogGrid({ posts }: BlogGridProps) {
  if (posts.length === 0) {
    return (
      <div className="rounded-xl border border-border bg-muted/30 px-6 py-16 text-center">
        <p className="text-sm text-muted-foreground">No posts found.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-px border border-border bg-border sm:grid-cols-2 lg:grid-cols-3">
      {posts.map((post) => (
        <BlogCard key={post.slug} post={post} />
      ))}
    </div>
  );
}
