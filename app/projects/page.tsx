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
    "Browse thousands of credited design projects — branding, web, motion, print, product, and UX.",
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
      <div className="mb-10 border-b border-border pb-8">
        <p className="mb-3 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          <span className="h-px w-8 bg-foreground/30" />
          Rightstar Collective
        </p>
        <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
          Projects
        </h1>
        <p className="mt-3 max-w-xl text-base text-muted-foreground">
          Credited creative work from independent creatives and leading studios
          worldwide.
        </p>
      </div>

      {/* Filters — wrapped in Suspense because useSearchParams requires it */}
      <Suspense fallback={<div className="h-12 border-b border-border" />}>
        <ProjectFilters
          activeCategory={activeCategory}
          activeSort={activeSort}
          total={projects.length}
        />
      </Suspense>

      {/* Grid */}
      <div className="mt-8">
        <ProjectGrid projects={projects} />
      </div>
    </PageWrapper>
  );
}
