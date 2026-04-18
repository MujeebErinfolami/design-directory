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
    <section className="border-t border-border py-16">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold tracking-tight text-foreground">
          More in{" "}
          <span className="italic font-light">{category}</span>
        </h2>
        <Link
          href={`/projects?category=${category}`}
          className="group inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground"
        >
          View all
          <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
        </Link>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {projects.map((p) => (
          <ProjectCard key={p.id} project={p} />
        ))}
      </div>
    </section>
  );
}
