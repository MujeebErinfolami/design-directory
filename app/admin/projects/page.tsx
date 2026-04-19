import { prisma } from "@/lib/prisma";
import { BadgePanel } from "./BadgePanel";

export const metadata = { title: "Admin — Projects" };

export default async function AdminProjectsPage() {
  const projects = await prisma.project.findMany({
    where: { status: "approved" },
    orderBy: { submittedAt: "desc" },
    select: {
      id: true,
      slug: true,
      title: true,
      category: true,
      year: true,
      thumbnailColor: true,
      isFeatured: true,
      submittedAt: true,
      submittedBy: { select: { name: true } },
      badges: { select: { badge: true } },
      credits: { select: { creditName: true } },
    },
  });

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Approved Projects</h1>
        <p className="text-sm text-muted-foreground">{projects.length} projects</p>
      </div>

      {projects.length === 0 ? (
        <div className="rounded-xl border border-border p-12 text-center text-sm text-muted-foreground">
          No approved projects yet.
        </div>
      ) : (
        <div className="divide-y divide-border rounded-xl border border-border">
          {projects.map((p) => {
            const badges = p.badges.map((b) => b.badge) as ("featured" | "editors_pick" | "best_of_year")[];
            return (
              <div key={p.id} className="flex items-center gap-4 p-4">
                <div
                  className="h-12 w-12 shrink-0 rounded-lg"
                  style={{ backgroundColor: p.thumbnailColor }}
                />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <a
                      href={`/projects/${p.slug}`}
                      target="_blank"
                      rel="noreferrer"
                      className="text-sm font-semibold hover:underline"
                    >
                      {p.title}
                    </a>
                    <span className="text-xs text-muted-foreground">{p.category}</span>
                    <span className="text-xs text-muted-foreground">{p.year}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {p.submittedBy.name}
                    {p.credits.length > 0 && ` · ${p.credits.map((c) => c.creditName).join(", ")}`}
                  </p>
                </div>
                <div className="shrink-0">
                  <BadgePanel projectId={p.id} initialBadges={badges} />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
