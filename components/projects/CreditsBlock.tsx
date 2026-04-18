import Link from "next/link";
import { ExternalLink, MapPin, Calendar, Wrench } from "lucide-react";
import type { Project } from "@/lib/data/projects";

interface CreditsBlockProps {
  project: Project;
}

export function CreditsBlock({ project }: CreditsBlockProps) {
  return (
    <aside className="rounded-xl border border-border bg-muted/30 p-6">
      <h2 className="mb-5 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
        Credits
      </h2>

      <dl className="space-y-4">
        {/* Designer */}
        <div className="flex items-start gap-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-semibold text-muted-foreground">
            {project.designer.initials}
          </div>
          <div>
            <dt className="text-xs text-muted-foreground">Designer</dt>
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
        {project.agencyName && (
          <div className="flex items-start gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-border bg-background">
              <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
            </div>
            <div>
              <dt className="text-xs text-muted-foreground">Agency</dt>
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
        <div className="flex items-start gap-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-border bg-background">
            <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
          </div>
          <div>
            <dt className="text-xs text-muted-foreground">Year</dt>
            <dd className="mt-0.5 text-sm font-medium text-foreground">
              {project.year}
            </dd>
          </div>
        </div>

        {/* Category + Tags */}
        <div className="flex items-start gap-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-border bg-background">
            <Wrench className="h-3.5 w-3.5 text-muted-foreground" />
          </div>
          <div>
            <dt className="text-xs text-muted-foreground">Category &amp; Tags</dt>
            <dd className="mt-1.5 flex flex-wrap gap-1.5">
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

      {/* Source link CTA */}
      {project.sourceUrl && (
        <a
          href={project.sourceUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-6 flex w-full items-center justify-center gap-2 rounded-md border border-border bg-background px-4 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-muted"
        >
          <ExternalLink className="h-3.5 w-3.5" />
          View Source
        </a>
      )}
    </aside>
  );
}
