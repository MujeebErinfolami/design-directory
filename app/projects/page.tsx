import { Suspense } from "react";
import type { Metadata } from "next";
import { PageWrapper } from "@/components/layout/PageWrapper";
import { ProjectGrid } from "@/components/projects/ProjectGrid";
import { ProjectFilters } from "@/components/projects/ProjectFilters";
import {
  getFilteredProjects,
  type Category,
  type SortOption,
} from "@/lib/data/projects";

export const metadata: Metadata = {
  title: "Projects",
  description:
    "Browse credited design projects — branding, web, motion, print, product, and UX.",
  openGraph: {
    title: "Projects — Rightstar Collective",
    description:
      "Browse outstanding creative projects — branding, web, motion, print, product, and UX.",
  },
};

interface PageProps {
  searchParams: Promise<{ category?: string; sort?: string }>;
}

export default async function ProjectsPage({ searchParams }: PageProps) {
  const params = await searchParams;

  const rawCategory = params.category as Category | undefined;
  const rawSort = (params.sort as SortOption) ?? "newest";

  const VALID_CATEGORIES: Category[] = [
    "Branding", "Web", "Motion", "Print", "Product", "UX",
  ];
  const VALID_SORTS: SortOption[] = ["newest", "oldest", "featured"];

  const activeCategory =
    rawCategory && VALID_CATEGORIES.includes(rawCategory) ? rawCategory : null;
  const activeSort = VALID_SORTS.includes(rawSort) ? rawSort : "newest";

  const projects = await getFilteredProjects(activeCategory, activeSort);

  return (
    <PageWrapper>
      {/* Page header */}
      <div className="mb-10 border-b border-border pb-10">
        <p className="mb-6 inline-flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
          <span className="h-px w-10 bg-muted-foreground/40" />
          Rightstar Collective
        </p>
        <h1
          className="font-bold leading-[0.95] tracking-tight text-foreground"
          style={{ fontSize: "clamp(2.75rem, 6vw, 5.5rem)" }}
        >
          Projects
        </h1>
        <p className="mt-4 max-w-xl text-base text-muted-foreground">
          Credited creative work from independent creatives and leading studios worldwide.
        </p>
      </div>

      {/* Category filter tabs */}
      <Suspense fallback={<div className="h-14 border-b border-border" />}>
        <ProjectFilters
          activeCategory={activeCategory}
          activeSort={activeSort}
          total={projects.length}
        />
      </Suspense>

      {/* Masonry grid */}
      <div className="mt-8">
        <ProjectGrid projects={projects} />
      </div>
    </PageWrapper>
  );
}
