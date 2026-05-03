import type { Project } from "@/lib/data/projects";
import { ProjectCard } from "./ProjectCard";

interface ProjectGridProps {
  projects: Project[];
}

export function ProjectGrid({ projects }: ProjectGridProps) {
  if (projects.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-border bg-card py-24 text-center">
        <p className="text-lg font-semibold text-foreground">No projects found</p>
        <p className="mt-2 text-sm text-muted-foreground">
          Try a different category or sort order.
        </p>
      </div>
    );
  }

  return (
    <div className="columns-1 gap-5 sm:columns-2 lg:columns-3">
      {projects.map((project) => (
        <div key={project.id} className="mb-5 break-inside-avoid">
          <ProjectCard project={project} />
        </div>
      ))}
    </div>
  );
}
