import Link from "next/link";
import { ExternalLink, Calendar, Wrench, User } from "lucide-react";
import type { Project } from "@/lib/data/projects";

export function CreditsBlock({ project }: { project: Project }) {
  return (
    <aside className="rounded-xl border border-border bg-card p-6">
      <h2 className="mb-5 text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
        Credits
      </h2>

      <dl className="space-y-4">
        {/* Designer */}
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-semibold text-muted-foreground">
            {project.designer.initials}
          </div>
          <div>
            <dt className="text-[10px] text-muted-foreground uppercase tracking-wider">Creative</dt>
            <dd className="mt-0.5 text-sm font-medium text-foreground">
              <Link
                href={`/designers/${project.designer.slug}`}
                className="hover:underline underline-offset-2"
              >
                {project.designer.name}
              </Link>
            </dd>
          </div>
        </div>

        {/* Agency */}
        {project.agencyName && project.agencyName !== "Independent" && (
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-border bg-background">
              <User className="h-3.5 w-3.5 text-muted-foreground" />
            </div>
            <div>
              <dt className="text-[10px] text-muted-foreground uppercase tracking-wider">Agency</dt>
              <dd className="mt-0.5 text-sm font-medium text-foreground">
                {project.agencyUrl ? (
                  <a
                    href={project.agencyUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:underline underline-offset-2"
                  >
                    {project.agencyName}
                  </a>
                ) : (
                  project.agencyName
                )}
              </dd>
            </div>
          </div>
        )}

        {/* Year */}
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-border bg-background">
            <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
          </div>
          <div>
            <dt className="text-[10px] text-muted-foreground uppercase tracking-wider">Year</dt>
            <dd className="mt-0.5 text-sm font-medium text-foreground">{project.year}</dd>
          </div>
        </div>

        {/* Category + Tags */}
        <div className="flex items-start gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-border bg-background">
            <Wrench className="h-3.5 w-3.5 text-muted-foreground" />
          </div>
          <div>
            <dt className="text-[10px] text-muted-foreground uppercase tracking-wider">
              Category &amp; Tags
            </dt>
            <dd className="mt-2 flex flex-wrap gap-1.5">
              <span className="rounded-full bg-foreground px-2.5 py-0.5 text-xs font-medium text-background">
                {project.category}
              </span>
              {project.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full border border-border px-2.5 py-0.5 text-xs text-muted-foreground"
                >
                  {tag}
                </span>
              ))}
            </dd>
          </div>
        </div>
      </dl>

      {project.sourceUrl && (
        <a
          href={project.sourceUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-6 flex w-full items-center justify-center gap-2 rounded-lg border border-border bg-background px-4 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-muted"
        >
          <ExternalLink className="h-3.5 w-3.5" />
          View Source
        </a>
      )}
    </aside>
  );
}
