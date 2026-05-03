import Link from "next/link";
import type { Project } from "@/lib/data/projects";

interface PortfolioGalleryProps {
  projects: Project[];
}

export function PortfolioGallery({ projects }: PortfolioGalleryProps) {
  if (projects.length === 0) {
    return (
      <div className="rounded-xl border border-border bg-card px-6 py-12 text-center">
        <p className="text-sm text-muted-foreground">No projects listed yet.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {projects.map((project) => (
        <Link
          key={project.slug}
          href={`/projects/${project.slug}`}
          className="group relative overflow-hidden rounded-xl border border-border transition-all duration-200 hover:scale-[1.02] hover:shadow-xl hover:shadow-black/20"
          style={{ backgroundColor: project.thumbnailColor }}
        >
          <div className="aspect-[4/3] relative">
            {/* Category badge */}
            <span className="absolute left-3 top-3 z-10 rounded-full bg-black/40 px-2.5 py-0.5 text-xs font-medium text-white backdrop-blur-sm">
              {project.category}
            </span>

            {/* Year */}
            <span className="absolute bottom-3 right-3 z-10 text-xs font-medium text-white/60">
              {project.year}
            </span>

            {/* Hover overlay */}
            <div className="absolute inset-0 bg-black/0 transition-colors duration-300 group-hover:bg-black/55" />

            {/* Title on hover */}
            <div className="absolute inset-x-0 bottom-0 flex translate-y-2 items-end p-4 opacity-0 transition-all duration-200 group-hover:translate-y-0 group-hover:opacity-100">
              <p className="text-sm font-semibold leading-snug text-white">
                {project.title}
              </p>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}
