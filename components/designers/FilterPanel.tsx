"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useState } from "react";
import { SlidersHorizontal, X } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  ALL_SPECIALTIES,
  AVAILABILITY_LABELS,
  EXPERIENCE_LABELS,
  type Specialty,
  type Availability,
  type ExperienceLevel,
} from "@/lib/data/designers";

interface FilterPanelProps {
  activeSpecialty: Specialty | null;
  activeAvailability: Availability | null;
  activeExperience: ExperienceLevel | null;
  hasActiveFilters: boolean;
}

export function FilterPanel({
  activeSpecialty,
  activeAvailability,
  activeExperience,
  hasActiveFilters,
}: FilterPanelProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [mobileOpen, setMobileOpen] = useState(false);

  const updateParams = useCallback(
    (updates: Record<string, string | null>) => {
      const params = new URLSearchParams(searchParams.toString());
      for (const [key, val] of Object.entries(updates)) {
        if (val === null) {
          params.delete(key);
        } else {
          params.set(key, val);
        }
      }
      router.push(`/designers?${params.toString()}`, { scroll: false });
    },
    [router, searchParams]
  );

  const clearAll = useCallback(() => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("specialty");
    params.delete("availability");
    params.delete("experience");
    router.push(`/designers?${params.toString()}`, { scroll: false });
    setMobileOpen(false);
  }, [router, searchParams]);

  const panelContent = (
    <div className="space-y-6">
      {/* Header row */}
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          Filters
        </p>
        {hasActiveFilters && (
          <button
            onClick={clearAll}
            className="text-xs font-medium text-muted-foreground hover:text-foreground underline-offset-2 hover:underline"
          >
            Clear all
          </button>
        )}
      </div>

      {/* Role */}
      <div>
        <p className="mb-3 text-xs font-semibold text-foreground">Role</p>
        <div className="flex flex-col gap-1.5">
          {ALL_SPECIALTIES.map((s) => (
            <button
              key={s}
              onClick={() =>
                updateParams({
                  specialty: activeSpecialty === s ? null : s,
                })
              }
              className={cn(
                "w-full rounded-md px-3 py-1.5 text-left text-xs font-medium transition-colors",
                activeSpecialty === s
                  ? "bg-foreground text-background"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Availability */}
      <div>
        <p className="mb-3 text-xs font-semibold text-foreground">
          Availability
        </p>
        <div className="flex flex-col gap-1.5">
          {(Object.keys(AVAILABILITY_LABELS) as Availability[]).map((a) => (
            <button
              key={a}
              onClick={() =>
                updateParams({
                  availability: activeAvailability === a ? null : a,
                })
              }
              className={cn(
                "w-full rounded-md px-3 py-1.5 text-left text-xs font-medium transition-colors",
                activeAvailability === a
                  ? "bg-foreground text-background"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              {AVAILABILITY_LABELS[a]}
            </button>
          ))}
        </div>
      </div>

      {/* Experience */}
      <div>
        <p className="mb-3 text-xs font-semibold text-foreground">
          Experience
        </p>
        <div className="flex flex-col gap-1.5">
          {(Object.keys(EXPERIENCE_LABELS) as ExperienceLevel[]).map((e) => (
            <button
              key={e}
              onClick={() =>
                updateParams({
                  experience: activeExperience === e ? null : e,
                })
              }
              className={cn(
                "w-full rounded-md px-3 py-1.5 text-left text-xs font-medium transition-colors",
                activeExperience === e
                  ? "bg-foreground text-background"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              {EXPERIENCE_LABELS[e]}
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile toggle */}
      <div className="lg:hidden">
        <button
          onClick={() => setMobileOpen((o) => !o)}
          className={cn(
            "inline-flex items-center gap-2 rounded-md border px-3 py-2 text-xs font-semibold transition-colors",
            hasActiveFilters || mobileOpen
              ? "border-foreground bg-foreground text-background"
              : "border-border bg-background text-muted-foreground hover:text-foreground"
          )}
          aria-expanded={mobileOpen}
        >
          <SlidersHorizontal className="h-3.5 w-3.5" />
          Filters
          {hasActiveFilters && (
            <span className="ml-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-background text-foreground text-[10px] font-bold">
              {[activeSpecialty, activeAvailability, activeExperience].filter(Boolean).length}
            </span>
          )}
        </button>

        {/* Mobile drawer */}
        {mobileOpen && (
          <div className="mt-3 rounded-xl border border-border bg-background p-5 shadow-md">
            <div className="mb-4 flex items-center justify-between">
              <p className="text-sm font-semibold text-foreground">Filters</p>
              <button
                onClick={() => setMobileOpen(false)}
                className="text-muted-foreground hover:text-foreground"
                aria-label="Close filters"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            {panelContent}
          </div>
        )}
      </div>

      {/* Desktop sidebar */}
      <aside className="hidden lg:block w-52 shrink-0">
        <div className="sticky top-24">
          {panelContent}
        </div>
      </aside>
    </>
  );
}
