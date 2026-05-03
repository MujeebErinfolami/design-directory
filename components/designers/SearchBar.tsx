"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useRef } from "react";
import { Search, X } from "lucide-react";

interface SearchBarProps {
  value: string;
  total: number;
  sort: string;
}

const SORT_OPTIONS = [
  { value: "newest", label: "Newest" },
  { value: "az", label: "A – Z" },
  { value: "za", label: "Z – A" },
];

export function SearchBar({ value, total, sort }: SearchBarProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const updateParams = useCallback(
    (updates: Record<string, string | null>) => {
      const params = new URLSearchParams(searchParams.toString());
      for (const [key, val] of Object.entries(updates)) {
        if (val === null || val === "") {
          params.delete(key);
        } else {
          params.set(key, val);
        }
      }
      router.push(`/designers?${params.toString()}`, { scroll: false });
    },
    [router, searchParams]
  );

  const handleSearch = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const q = e.target.value;
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => {
        updateParams({ q: q || null });
      }, 300);
    },
    [updateParams]
  );

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
      {/* Search input — full width */}
      <div className="relative flex-1">
        <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          type="search"
          defaultValue={value}
          onChange={handleSearch}
          placeholder="Search by name, role, location…"
          className="h-12 w-full rounded-xl border border-border bg-card py-3 pl-11 pr-10 text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-ring transition-colors"
          aria-label="Search designers"
        />
        {value && (
          <button
            onClick={() => updateParams({ q: null })}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
            aria-label="Clear search"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Count + sort */}
      <div className="flex shrink-0 items-center gap-4">
        <span className="text-xs text-muted-foreground">
          {total} {total === 1 ? "creative" : "creatives"}
        </span>
        <select
          value={sort}
          onChange={(e) => updateParams({ sort: e.target.value })}
          className="rounded-lg border border-border bg-card py-2 pl-3 pr-8 text-xs font-medium text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          aria-label="Sort creatives"
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
