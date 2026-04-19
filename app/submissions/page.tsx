import { requireOnboarded } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PageWrapper } from "@/components/layout/PageWrapper";
import { BackButton } from "@/components/layout/BackButton";
import Link from "next/link";

export const metadata = { title: "My Submissions" };

const STATUS_STYLES = {
  pending:  "bg-amber-50 text-amber-700 border-amber-200",
  approved: "bg-emerald-50 text-emerald-700 border-emerald-200",
  rejected: "bg-red-50 text-red-700 border-red-200",
} as const;

const STATUS_LABELS = {
  pending:  "Pending review",
  approved: "Approved",
  rejected: "Rejected",
} as const;

export default async function SubmissionsPage() {
  const session = await requireOnboarded();

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
    <PageWrapper>
      <div className="py-12">
        <div className="mb-6">
          <BackButton href="/dashboard" label="Dashboard" />
        </div>
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">My Submissions</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {submissions.length === 0
                ? "No submissions yet."
                : `${submissions.length} project${submissions.length === 1 ? "" : "s"} submitted.`}
            </p>
          </div>
          <Link
            href="/submit"
            className="rounded-lg bg-foreground px-4 py-2 text-sm font-medium text-background transition-opacity hover:opacity-80"
          >
            Submit project
          </Link>
        </div>

        {submissions.length === 0 ? (
          <div className="rounded-xl border border-border p-12 text-center">
            <p className="text-muted-foreground">You haven&apos;t submitted any projects yet.</p>
            <Link
              href="/submit"
              className="mt-4 inline-block text-sm font-medium underline hover:no-underline"
            >
              Submit your first project →
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-border rounded-xl border border-border">
            {submissions.map((project) => (
              <div key={project.id} className="flex items-start gap-4 p-5">
                <div
                  className="mt-0.5 h-12 w-12 shrink-0 rounded-lg"
                  style={{ backgroundColor: project.thumbnailColor }}
                />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-sm font-semibold leading-tight">{project.title}</h2>
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
                    className={`rounded-full border px-2.5 py-0.5 text-xs font-medium ${STATUS_STYLES[project.status]}`}
                  >
                    {STATUS_LABELS[project.status]}
                  </span>
                  {project.status === "approved" && (
                    <Link
                      href={`/projects/${project.slug}`}
                      className="text-xs text-muted-foreground underline hover:no-underline"
                    >
                      View
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </PageWrapper>
  );
}

function formatDate(date: Date) {
  return date.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
}
