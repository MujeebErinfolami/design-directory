import type { PostAuthor } from "@/lib/data/posts";

interface AuthorBylineProps {
  author: PostAuthor;
  date: string; // already formatted
  readTime: string;
}

export function AuthorByline({ author, date, readTime }: AuthorBylineProps) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-muted text-sm font-semibold text-muted-foreground">
        {author.name[0]}
      </div>
      <div>
        <p className="text-sm font-medium text-foreground">{author.name}</p>
        <p className="text-xs text-muted-foreground">
          {author.title} &middot; {date} &middot; {readTime}
        </p>
      </div>
    </div>
  );
}
