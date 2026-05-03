import Link from "next/link";
import type { Project } from "@/lib/data/projects";

export function ProjectCard({ project }: { project: Project }) {
  const aspectClass = project.featured ? "aspect-[3/4]" : "aspect-[4/3]";

  return (
    <Link
      href={`/projects/${project.slug}`}
      aria-label={`View ${project.title}`}
      className={`group relative block overflow-hidden rounded-xl transition-all duration-200 hover:scale-[1.02] hover:shadow-xl hover:shadow-black/25 ${aspectClass}`}
      style={{ backgroundColor: project.thumbnailColor }}
    >
      {/* Real image when present */}
      {project.thumbnailUrl && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={project.thumbnailUrl}
          alt={project.title}
          className="absolute inset-0 h-full w-full object-cover"
        />
      )}

      {/* Featured badge — always visible */}
      {project.featured && (
        <span className="absolute right-3 top-3 z-10 rounded-full bg-white/25 px-2.5 py-0.5 text-xs font-semibold text-white backdrop-blur-sm">
          Featured
        </span>
      )}

      {/* Category — always visible at bottom */}
      <span className="absolute bottom-3 left-3 z-10 rounded-full bg-black/35 px-2.5 py-0.5 text-xs font-medium text-white backdrop-blur-sm">
        {project.category}
      </span>

      {/* Year */}
      <span className="absolute bottom-3 right-3 z-10 text-xs font-medium text-white/50">
        {project.year}
      </span>

      {/* Hover overlay */}
      <div className="absolute inset-0 bg-black/0 transition-colors duration-300 group-hover:bg-black/65" />

      {/* Title + credits — slide up on hover */}
      <div className="absolute inset-x-0 bottom-0 flex translate-y-3 flex-col gap-1.5 p-4 pb-10 opacity-0 transition-all duration-250 group-hover:translate-y-0 group-hover:opacity-100">
        <h2 className="text-base font-bold leading-snug text-white">
          {project.title}
        </h2>
        <p className="text-xs text-white/65">
          {project.designer.name}
          {project.agencyName && project.agencyName !== "Independent" && (
            <span className="text-white/40"> · {project.agencyName}</span>
          )}
        </p>
      </div>
    </Link>
  );
}
