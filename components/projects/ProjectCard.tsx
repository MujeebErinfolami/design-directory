import Link from "next/link";
import { ExternalLink } from "lucide-react";
import type { Project } from "@/lib/data/projects";

interface ProjectCardProps {
  project: Project;
}

export function ProjectCard({ project }: ProjectCardProps) {
  return (
    <article className="group flex flex-col overflow-hidden rounded-xl border border-border bg-background transition-shadow hover:shadow-md">

      {/* Thumbnail */}
      <Link
        href={`/projects/${project.slug}`}
        aria-label={`View ${project.title}`}
        className="relative block aspect-[4/3] overflow-hidden"
        style={{ backgroundColor: project.thumbnailColor }}
      >
        {/* Featured badge */}
        {project.featured && (
          <span className="absolute right-3 top-3 rounded-full bg-foreground px-2.5 py-0.5 text-xs font-semibold text-background">
            Featured
          </span>
        )}

        {/* Category badge */}
        <span className="absolute left-3 top-3 rounded-full bg-background/80 px-2.5 py-0.5 text-xs font-medium text-foreground backdrop-blur-sm">
          {project.category}
        </span>

        {/* Year */}
        <span className="absolute bottom-3 right-3 text-xs font-medium text-foreground/50">
          {project.year}
        </span>

        {/* Hover overlay */}
        <div className="absolute inset-0 bg-foreground/0 transition-colors group-hover:bg-foreground/5" />
      </Link>

      {/* Body */}
      <div className="flex flex-1 flex-col p-5">
        {/* Title + description */}
        <div className="flex-1">
          <h2 className="text-base font-semibold leading-snug tracking-tight text-foreground">
            <Link
              href={`/projects/${project.slug}`}
              className="hover:underline underline-offset-2"
            >
              {project.title}
            </Link>
          </h2>
          <p className="mt-1.5 line-clamp-2 text-sm leading-relaxed text-muted-foreground">
            {project.description}
          </p>
        </div>

        {/* Tags */}
        {project.tags.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {project.tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="rounded-full border border-border px-2 py-0.5 text-xs text-muted-foreground"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Credits footer */}
        <div className="mt-4 flex items-center justify-between border-t border-border pt-4">
          <div className="flex items-center gap-2.5 min-w-0">
            {/* Designer avatar */}
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-semibold text-muted-foreground">
              {project.designer.initials}
            </div>
            <div className="min-w-0">
              <p className="truncate text-xs font-medium text-foreground">
                {project.designer.name}
              </p>
              {project.agencyName && project.agencyName !== "Independent" ? (
                <p className="truncate text-xs text-muted-foreground">
                  {project.agencyName}
                </p>
              ) : (
                <p className="text-xs text-muted-foreground">Independent</p>
              )}
            </div>
          </div>

          {/* Source link */}
          {project.sourceUrl && (
            <a
              href={project.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`View source for ${project.title}`}
              className="ml-2 shrink-0 rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
          )}
        </div>
      </div>
    </article>
  );
}
