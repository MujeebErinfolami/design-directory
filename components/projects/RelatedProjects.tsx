import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { Project } from "@/lib/data/projects";
import { ProjectCard } from "./ProjectCard";

interface RelatedProjectsProps {
  projects: Project[];
  category: string;
}

export function RelatedProjects({ projects, category }: RelatedProjectsProps) {
  if (projects.length === 0) return null;

  return (
    <section className="border-t border-border pt-16">
      <div className="mb-8 flex items-center justify-between">
        <h2 className="text-lg font-bold tracking-tight text-foreground">
          More in{" "}
          <span className="italic font-light">{category}</span>
        </h2>
        <Link
          href={`/projects?category=${category}`}
          className="group inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          View all
          <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
        </Link>
      </div>

      <div className="columns-1 gap-5 sm:columns-2 lg:columns-3">
        {projects.map((p) => (
          <div key={p.id} className="mb-5 break-inside-avoid">
            <ProjectCard project={p} />
          </div>
        ))}
      </div>
    </section>
  );
}
