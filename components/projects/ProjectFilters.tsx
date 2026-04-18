"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";
import { cn } from "@/lib/utils";
import { ALL_CATEGORIES, type Category, type SortOption } from "@/lib/data/projects";

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: "newest", label: "Newest" },
  { value: "oldest", label: "Oldest" },
  { value: "featured", label: "Featured first" },
];

interface ProjectFiltersProps {
  activeCategory: Category | null;
  activeSort: SortOption;
  total: number;
}

export function ProjectFilters({
  activeCategory,
  activeSort,
  total,
}: ProjectFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const updateParams = useCallback(
    (updates: Record<string, string | null>) => {
      const params = new URLSearchParams(searchParams.toString());
      for (const [key, value] of Object.entries(updates)) {
        if (value === null) {
          params.delete(key);
        } else {
          params.set(key, value);
        }
      }
      router.push(`/projects?${params.toString()}`, { scroll: false });
    },
    [router, searchParams]
  );

  return (
    <div className="flex flex-col gap-4 border-b border-border pb-6 sm:flex-row sm:items-center sm:justify-between">
      {/* Category pills */}
      <div className="flex flex-wrap items-center gap-2">
        <button
          onClick={() => updateParams({ category: null })}
          className={cn(
            "rounded-full border px-3.5 py-1.5 text-xs font-semibold transition-colors",
            activeCategory === null
              ? "border-foreground bg-foreground text-background"
              : "border-border bg-background text-muted-foreground hover:border-foreground/40 hover:text-foreground"
          )}
        >
          All
        </button>
        {ALL_CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() =>
              updateParams({
                category: activeCategory === cat ? null : cat,
              })
            }
            className={cn(
              "rounded-full border px-3.5 py-1.5 text-xs font-semibold transition-colors",
              activeCategory === cat
                ? "border-foreground bg-foreground text-background"
                : "border-border bg-background text-muted-foreground hover:border-foreground/40 hover:text-foreground"
            )}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Sort + count */}
      <div className="flex items-center gap-4">
        <span className="shrink-0 text-xs text-muted-foreground">
          {total} {total === 1 ? "project" : "projects"}
        </span>
        <select
          value={activeSort}
          onChange={(e) =>
            updateParams({ sort: e.target.value as SortOption })
          }
          className="rounded-md border border-border bg-background py-1.5 pl-3 pr-8 text-xs font-medium text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          aria-label="Sort projects"
        >
          {SORT_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
