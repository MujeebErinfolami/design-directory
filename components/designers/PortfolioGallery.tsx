import Link from "next/link";
import type { Project } from "@/lib/data/projects";

interface PortfolioGalleryProps {
  projects: Project[];
}

export function PortfolioGallery({ projects }: PortfolioGalleryProps) {
  if (projects.length === 0) {
    return (
      <div className="rounded-xl border border-border bg-muted/30 px-6 py-10 text-center">
        <p className="text-sm text-muted-foreground">
          No projects listed yet.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {projects.map((project) => (
        <Link
          key={project.slug}
          href={`/projects/${project.slug}`}
          className="group relative overflow-hidden rounded-xl border border-border transition-shadow hover:shadow-md"
          style={{ backgroundColor: project.thumbnailColor }}
        >
          <div className="aspect-[4/3]">
            {/* Category badge */}
            <span className="absolute left-3 top-3 rounded-full bg-background/80 px-2.5 py-0.5 text-xs font-medium text-foreground backdrop-blur-sm">
              {project.category}
            </span>
            {/* Year */}
            <span className="absolute bottom-3 right-3 text-xs font-medium text-foreground/50">
              {project.year}
            </span>
            {/* Hover overlay + title */}
            <div className="absolute inset-0 flex items-end bg-gradient-to-t from-black/20 to-transparent p-3 opacity-0 transition-opacity group-hover:opacity-100">
              <p className="text-xs font-semibold text-foreground/90">
                {project.title}
              </p>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}
