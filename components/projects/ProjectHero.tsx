import type { Project } from "@/lib/data/projects";

interface ProjectHeroProps {
  project: Project;
}

export function ProjectHero({ project }: ProjectHeroProps) {
  return (
    <div className="relative overflow-hidden border-b border-border">
      {/* Hero image or colour fallback */}
      {project.thumbnailUrl ? (
        <div className="relative min-h-72 lg:min-h-[480px]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={project.thumbnailUrl}
            alt={project.title}
            className="absolute inset-0 h-full w-full object-cover"
          />
          {/* Dark scrim for text legibility */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
          <div className="relative flex min-h-72 items-end px-4 pb-10 pt-20 sm:px-6 lg:min-h-[480px] lg:px-8">
            <HeroContent project={project} light />
          </div>
        </div>
      ) : (
        <div
          className="flex min-h-72 items-end px-4 pb-10 pt-20 sm:px-6 lg:min-h-96 lg:px-8"
          style={{ backgroundColor: project.thumbnailColor }}
        >
          <HeroContent project={project} />
        </div>
      )}
    </div>
  );
}

function HeroContent({ project, light }: { project: Project; light?: boolean }) {
  const text = light ? "text-white" : "text-foreground";
  const muted = light ? "text-white/70" : "text-foreground/70";
  const badge = light ? "bg-white/20 text-white backdrop-blur-sm" : "bg-background/80 text-foreground backdrop-blur-sm";
  const featuredBadge = light ? "bg-white text-foreground" : "bg-foreground text-background";

  return (
    <div className="mx-auto w-full max-w-7xl">
      <div className="flex items-center gap-3">
        <span className={`rounded-full px-3 py-1 text-xs font-semibold ${badge}`}>
          {project.category}
        </span>
        {project.featured && (
          <span className={`rounded-full px-3 py-1 text-xs font-semibold ${featuredBadge}`}>
            Featured
          </span>
        )}
      </div>

      <h1 className={`mt-4 max-w-3xl text-4xl font-bold leading-tight tracking-tight sm:text-5xl lg:text-6xl ${text}`}>
        {project.title}
      </h1>

      {project.tagline && (
        <p className={`mt-3 max-w-2xl text-lg font-light ${muted}`}>{project.tagline}</p>
      )}

      <p className={`mt-3 max-w-2xl text-base leading-relaxed sm:text-lg ${muted}`}>
        {project.description}
      </p>
    </div>
  );
}
