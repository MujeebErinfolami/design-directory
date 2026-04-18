import type { Project } from "@/lib/data/projects";

interface ProjectHeroProps {
  project: Project;
}

export function ProjectHero({ project }: ProjectHeroProps) {
  return (
    <div className="relative overflow-hidden border-b border-border">
      {/* Coloured backdrop */}
      <div
        className="flex min-h-72 items-end px-4 pb-10 pt-20 sm:px-6 lg:min-h-96 lg:px-8"
        style={{ backgroundColor: project.thumbnailColor }}
      >
        <div className="mx-auto w-full max-w-7xl">
          {/* Category + featured */}
          <div className="flex items-center gap-3">
            <span className="rounded-full bg-background/80 px-3 py-1 text-xs font-semibold text-foreground backdrop-blur-sm">
              {project.category}
            </span>
            {project.featured && (
              <span className="rounded-full bg-foreground px-3 py-1 text-xs font-semibold text-background">
                Featured
              </span>
            )}
          </div>

          {/* Title */}
          <h1 className="mt-4 max-w-3xl text-4xl font-bold leading-tight tracking-tight text-foreground sm:text-5xl lg:text-6xl">
            {project.title}
          </h1>

          {/* Short description */}
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-foreground/70 sm:text-lg">
            {project.description}
          </p>
        </div>
      </div>
    </div>
  );
}
