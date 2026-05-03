import { requireOnboarded } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { DashboardShell } from "@/components/layout/DashboardShell";

export const metadata = { title: "My Submissions" };

const STATUS_STYLES: Record<string, string> = {
  draft:    "bg-zinc-500/15 text-zinc-400 border border-zinc-500/20",
  pending:  "bg-amber-500/15 text-amber-500 dark:text-amber-400 border border-amber-500/20",
  approved: "bg-emerald-500/15 text-emerald-500 dark:text-emerald-400 border border-emerald-500/20",
  rejected: "bg-red-500/15 text-red-500 dark:text-red-400 border border-red-500/20",
};

const STATUS_LABELS: Record<string, string> = {
  draft:    "Draft",
  pending:  "Pending review",
  approved: "Approved",
  rejected: "Rejected",
};

export default async function SubmissionsPage() {
  const session = await requireOnboarded();
  const { name, email, image, accountType } = session.user;
  const user = { name, email, image, accountType };

  const submissions = await prisma.project.findMany({
    where:   { submittedById: session.user.id },
    orderBy: { submittedAt: "desc" },
    select: {
      id: true,
      slug: true,
      title: true,
      category: true,
      status: true,
      submittedAt: true,
      reviewedAt: true,
      rejectionReason: true,
      thumbnailColor: true,
    },
  });

  return (
    <DashboardShell user={user}>
      <div className="mb-8 flex items-start justify-between gap-4">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            Dashboard
          </p>
          <h1 className="mt-2 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            My Submissions
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {submissions.length === 0
              ? "No submissions yet."
              : `${submissions.length} project${submissions.length === 1 ? "" : "s"} submitted.`}
          </p>
        </div>
        <Link
          href="/submit"
          className="shrink-0 rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90"
        >
          Submit project
        </Link>
      </div>

      {submissions.length === 0 ? (
        <div className="rounded-xl border border-border bg-card p-12 text-center">
          <p className="text-muted-foreground">You haven&apos;t submitted any projects yet.</p>
          <Link
            href="/submit"
            className="mt-4 inline-block text-sm font-medium text-brand underline underline-offset-2 hover:no-underline"
          >
            Submit your first project →
          </Link>
        </div>
      ) : (
        <div className="divide-y divide-border rounded-xl border border-border bg-card">
          {submissions.map((project) => (
            <div key={project.id} className="flex items-start gap-4 p-5">
              <div
                className="mt-0.5 h-12 w-12 shrink-0 rounded-lg"
                style={{ backgroundColor: project.thumbnailColor }}
              />
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-sm font-semibold leading-tight text-foreground">
                    {project.title}
                  </h2>
                  <span className="text-xs text-muted-foreground">{project.category}</span>
                </div>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  Submitted {formatDate(project.submittedAt)}
                  {project.reviewedAt && ` · Reviewed ${formatDate(project.reviewedAt)}`}
                </p>
                {project.status === "rejected" && project.rejectionReason && (
                  <p className="mt-1.5 text-xs text-muted-foreground">
                    <span className="font-medium text-foreground">Reason: </span>
                    {project.rejectionReason}
                  </p>
                )}
              </div>
              <div className="flex shrink-0 items-center gap-3">
                <span
                  className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_STYLES[project.status]}`}
                >
                  {STATUS_LABELS[project.status]}
                </span>
                {project.status === "approved" && (
                  <Link
                    href={`/projects/${project.slug}`}
                    className="text-xs text-brand underline underline-offset-2 hover:no-underline"
                  >
                    View
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </DashboardShell>
  );
}

function formatDate(date: Date) {
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}
