import { prisma } from "@/lib/prisma";
import { BackButton } from "@/components/layout/BackButton";
import { ReviewActions } from "./ReviewActions";

export const metadata = { title: "Admin — Submissions" };

const FILTERS = ["all", "pending", "approved", "rejected"] as const;
type Filter = (typeof FILTERS)[number];

interface PageProps {
  searchParams: Promise<{ status?: string }>;
}

export default async function AdminSubmissionsPage({ searchParams }: PageProps) {
  const { status: filterParam } = await searchParams;
  const filter: Filter = FILTERS.includes(filterParam as Filter) ? (filterParam as Filter) : "all";

  const projects = await prisma.project.findMany({
    where: filter === "all" ? {} : { status: filter },
    orderBy: { submittedAt: "desc" },
    select: {
      id: true,
      title: true,
      category: true,
      status: true,
      submittedAt: true,
      rejectionReason: true,
      thumbnailColor: true,
      submittedBy: { select: { name: true, email: true } },
      credits: { select: { creditName: true, role: true } },
    },
  });

  return (
    <div>
      <div className="mb-4">
        <BackButton href="/admin" label="Admin overview" />
      </div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-bold tracking-tight">Submissions</h1>
        <FilterTabs active={filter} />
      </div>

      {projects.length === 0 ? (
        <div className="rounded-xl border border-border p-12 text-center text-sm text-muted-foreground">
          No {filter === "all" ? "" : filter} submissions found.
        </div>
      ) : (
        <div className="divide-y divide-border rounded-xl border border-border">
          {projects.map((p) => (
            <div key={p.id} className="p-5">
              <div className="flex items-start gap-4">
                <div
                  className="mt-0.5 h-12 w-12 shrink-0 rounded-lg"
                  style={{ backgroundColor: p.thumbnailColor }}
                />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-baseline gap-2">
                    <h2 className="text-sm font-semibold">{p.title}</h2>
                    <span className="text-xs text-muted-foreground">{p.category}</span>
                  </div>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    By {p.submittedBy.name ?? p.submittedBy.email} &middot;{" "}
                    {new Date(p.submittedAt).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}
                  </p>
                  {p.credits.length > 0 && (
                    <p className="mt-1 text-xs text-muted-foreground">
                      Credits: {p.credits.map((c) => `${c.creditName}${c.role ? ` (${c.role})` : ""}`).join(", ")}
                    </p>
                  )}
                  {p.rejectionReason && (
                    <p className="mt-1 text-xs text-muted-foreground">
                      <span className="font-medium text-foreground">Reason: </span>
                      {p.rejectionReason}
                    </p>
                  )}
                </div>
                <div className="shrink-0">
                  <ReviewActions id={p.id} currentStatus={p.status} />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function FilterTabs({ active }: { active: Filter }) {
  const labels: Record<Filter, string> = {
    all: "All",
    pending: "Pending",
    approved: "Approved",
    rejected: "Rejected",
  };
  return (
    <div className="flex gap-1 rounded-lg border border-border bg-background p-1">
      {FILTERS.map((f) => (
        <a
          key={f}
          href={f === "all" ? "/admin/submissions" : `/admin/submissions?status=${f}`}
          className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
            active === f
              ? "bg-foreground text-background"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          {labels[f]}
        </a>
      ))}
    </div>
  );
}
