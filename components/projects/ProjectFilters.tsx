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

export function ProjectFilters({ activeCategory, activeSort, total }: ProjectFiltersProps) {
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
      {/* Category tabs — horizontally scrollable on mobile */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
        <button
          onClick={() => updateParams({ category: null })}
          className={cn(
            "shrink-0 rounded-lg px-4 py-2 text-xs font-semibold transition-colors",
            activeCategory === null
              ? "bg-brand text-white"
              : "text-muted-foreground hover:bg-muted hover:text-foreground"
          )}
        >
          All
        </button>
        {ALL_CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() =>
              updateParams({ category: activeCategory === cat ? null : cat })
            }
            className={cn(
              "shrink-0 rounded-lg px-4 py-2 text-xs font-semibold transition-colors",
              activeCategory === cat
                ? "bg-brand text-white"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            )}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Count + sort */}
      <div className="flex shrink-0 items-center gap-4">
        <span className="text-xs text-muted-foreground">
          {total} {total === 1 ? "project" : "projects"}
        </span>
        <select
          value={activeSort}
          onChange={(e) => updateParams({ sort: e.target.value as SortOption })}
          className="rounded-lg border border-border bg-card py-2 pl-3 pr-8 text-xs font-medium text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
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
