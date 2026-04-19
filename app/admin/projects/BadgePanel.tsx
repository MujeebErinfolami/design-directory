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
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}

const badgeActiveClass: Record<BadgeType, string> = {
  featured:     "border-violet-200 bg-violet-50 text-violet-700 hover:bg-violet-100",
  editors_pick: "border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100",
  best_of_year: "border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100",
};
