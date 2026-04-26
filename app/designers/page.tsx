import { Suspense } from "react";
import type { Metadata } from "next";
import { PageWrapper } from "@/components/layout/PageWrapper";
import { SearchBar } from "@/components/designers/SearchBar";
import { FilterPanel } from "@/components/designers/FilterPanel";
import { DesignerGrid } from "@/components/designers/DesignerGrid";
import {
  getFilteredDesigners,
  type Specialty,
  type Availability,
  type ExperienceLevel,
  type DesignerSort,
  ALL_SPECIALTIES,
  AVAILABILITY_LABELS,
  EXPERIENCE_LABELS,
} from "@/lib/data/designers";

export const metadata: Metadata = {
  title: "Creatives",
  description: "Search and discover talented creatives by role, availability, and location.",
  openGraph: {
    title: "Creatives — Rightstar Collective",
    description: "Search and discover talented creatives by role, availability, and location.",
  },
};

const VALID_SORTS: DesignerSort[] = ["newest", "az", "za"];

interface PageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

function getString(v: string | string[] | undefined): string {
  return typeof v === "string" ? v : "";
}

export default async function DesignersPage({ searchParams }: PageProps) {
  const params = await searchParams;

  const q = getString(params.q);
  const sortRaw = getString(params.sort);
  const sort: DesignerSort = VALID_SORTS.includes(sortRaw as DesignerSort)
    ? (sortRaw as DesignerSort)
    : "newest";

  const specialtyRaw = getString(params.specialty);
  const activeSpecialty: Specialty | null = ALL_SPECIALTIES.includes(
    specialtyRaw as Specialty
  )
    ? (specialtyRaw as Specialty)
    : null;

  const availabilityRaw = getString(params.availability);
  const activeAvailability: Availability | null = (
    Object.keys(AVAILABILITY_LABELS) as Availability[]
  ).includes(availabilityRaw as Availability)
    ? (availabilityRaw as Availability)
    : null;

  const experienceRaw = getString(params.experience);
  const activeExperience: ExperienceLevel | null = (
    Object.keys(EXPERIENCE_LABELS) as ExperienceLevel[]
  ).includes(experienceRaw as ExperienceLevel)
    ? (experienceRaw as ExperienceLevel)
    : null;

  const hasActiveFilters = !!(activeSpecialty || activeAvailability || activeExperience);

  const designers = await getFilteredDesigners({
    query: q,
    specialty: activeSpecialty,
    availability: activeAvailability,
    experience: activeExperience,
    sort,
  });

  return (
    <PageWrapper>
      {/* Page header */}
      <div className="mb-8 border-b border-border pb-8">
        <p className="mb-3 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          <span className="h-px w-8 bg-foreground/30" />
          Rightstar Collective
        </p>
        <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
          Creatives
        </h1>
        <p className="mt-3 max-w-xl text-base text-muted-foreground">
          Discover talented creatives by role, availability, and location.
        </p>
      </div>

      {/* Search + sort bar */}
      <div className="mb-8">
        <Suspense>
          <SearchBar value={q} total={designers.length} sort={sort} />
        </Suspense>
      </div>

      {/* Two-column layout: sidebar + grid */}
      <div className="flex gap-10">
        {/* Filter sidebar */}
        <Suspense>
          <FilterPanel
            activeSpecialty={activeSpecialty}
            activeAvailability={activeAvailability}
            activeExperience={activeExperience}
            hasActiveFilters={hasActiveFilters}
          />
        </Suspense>

        {/* Designer grid */}
        <div className="min-w-0 flex-1">
          <DesignerGrid designers={designers} />
        </div>
      </div>
    </PageWrapper>
  );
}
