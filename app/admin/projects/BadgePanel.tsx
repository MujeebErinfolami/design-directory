"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type BadgeType = "featured" | "editors_pick" | "best_of_year";

const BADGE_LABELS: Record<BadgeType, string> = {
  featured:     "Featured",
  editors_pick: "Editor's Pick",
  best_of_year: "Best of Year",
};

export function BadgePanel({
  projectId,
  initialBadges,
}: {
  projectId: string;
  initialBadges: BadgeType[];
}) {
  const router = useRouter();
  const [badges, setBadges] = useState<BadgeType[]>(initialBadges);
  const [loading, setLoading] = useState<BadgeType | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function toggleBadge(badge: BadgeType) {
    const action = badges.includes(badge) ? "revoke" : "grant";
    setLoading(badge);
    setError(null);
    try {
      const res = await fetch(`/api/admin/projects/${projectId}/badges`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ badge, action }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Update failed");
      setBadges(data.badges as BadgeType[]);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Update failed");
    } finally {
      setLoading(null);
    }
  }

  return (
    <div className="flex flex-col items-end gap-1.5">
      <div className="flex flex-wrap justify-end gap-1.5">
        {(Object.keys(BADGE_LABELS) as BadgeType[]).map((badge) => {
          const active = badges.includes(badge);
          return (
            <button
              key={badge}
              onClick={() => toggleBadge(badge)}
              disabled={loading !== null}
              className={`rounded-full border px-2.5 py-0.5 text-xs font-medium transition-colors disabled:opacity-60 ${
                active
                  ? badgeActiveClass[badge]
                  : "border-border bg-background text-muted-foreground hover:border-foreground/40 hover:text-foreground"
              }`}
            >
              {loading === badge ? "…" : (active ? "✓ " : "") + BADGE_LABELS[badge]}
            </button>
          );
        })}
      </div>
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}

const badgeActiveClass: Record<BadgeType, string> = {
  featured:     "border-violet-500/20 bg-violet-500/15 text-violet-600 dark:text-violet-400 hover:bg-violet-500/25",
  editors_pick: "border-blue-500/20 bg-blue-500/15 text-blue-600 dark:text-blue-400 hover:bg-blue-500/25",
  best_of_year: "border-amber-500/20 bg-amber-500/15 text-amber-600 dark:text-amber-400 hover:bg-amber-500/25",
};
