import type { Project } from "@/lib/data/projects";

export function ProjectHero({ project }: { project: Project }) {
  return (
    <div className="relative overflow-hidden border-b border-border">
      {project.thumbnailUrl ? (
        <div className="relative min-h-80 lg:min-h-[560px]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={project.thumbnailUrl}
            alt={project.title}
            className="absolute inset-0 h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
          <div className="relative flex min-h-80 items-end px-4 pb-12 pt-24 sm:px-6 lg:min-h-[560px] lg:px-8">
            <HeroContent project={project} light />
          </div>
        </div>
      ) : (
        <div
          className="relative flex min-h-80 items-end px-4 pb-12 pt-24 sm:px-6 lg:min-h-[480px] lg:px-8"
          style={{ backgroundColor: project.thumbnailColor }}
        >
          {/* Subtle bottom gradient so text is legible on any color */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
          <div className="relative w-full">
            <HeroContent project={project} light />
          </div>
        </div>
      )}
    </div>
  );
}

function HeroContent({ project, light }: { project: Project; light?: boolean }) {
  return (
    <div className="mx-auto w-full max-w-7xl">
      <div className="mb-4 flex items-center gap-3">
        <span className="rounded-full bg-white/20 px-3 py-1 text-xs font-semibold text-white backdrop-blur-sm">
          {project.category}
        </span>
        {project.featured && (
          <span className="rounded-full bg-white/25 px-3 py-1 text-xs font-semibold text-white backdrop-blur-sm">
            Featured
          </span>
        )}
      </div>

      <h1
        className="font-bold leading-[0.95] tracking-tight text-white"
        style={{ fontSize: "clamp(2rem, 5.5vw, 5rem)" }}
      >
        {project.title}
      </h1>

      {project.tagline && (
        <p className="mt-3 max-w-2xl text-lg font-light text-white/75">
          {project.tagline}
        </p>
      )}
    </div>
  );
}
