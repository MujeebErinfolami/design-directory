import { requireOnboarded } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { ArrowRight, FolderOpen, Bell, PlusCircle, User } from "lucide-react";
import { DashboardShell } from "@/components/layout/DashboardShell";

export const metadata = { title: "Dashboard" };

export default async function DashboardPage() {
  const session = await requireOnboarded();
  const { name, email, accountType, image, id: userId } = session.user;

  const [submissionCount, unreadCount] = await Promise.all([
    prisma.project.count({ where: { submittedById: userId } }),
    prisma.notification.count({ where: { userId, read: false } }),
  ]);

  const user = { name, email, image, accountType };

  return (
    <DashboardShell user={user}>
      {/* Header */}
      <div className="mb-8">
        <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
          Dashboard
        </p>
        <h1 className="mt-2 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          {name ? `Welcome back, ${name.split(" ")[0]}` : "Welcome back"}
        </h1>
      </div>

      {/* Stats */}
      <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-3">
        <StatCard
          label="Submissions"
          value={submissionCount}
          icon={FolderOpen}
          href="/submissions"
        />
        <StatCard
          label="Profile views"
          value="—"
          icon={User}
          href="/profile"
        />
        <StatCard
          label="Notifications"
          value={unreadCount}
          icon={Bell}
          href="/notifications"
          accent={unreadCount > 0}
        />
      </div>

      {/* Quick actions */}
      <div>
        <p className="mb-4 text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
          Quick actions
        </p>
        <div className="grid gap-3 sm:grid-cols-2">
          <ActionCard
            title="Submit a Project"
            description="Share your work with the Rightstar community."
            href="/submit"
            icon={PlusCircle}
          />
          <ActionCard
            title="Edit Profile"
            description="Update your bio, skills, and contact info."
            href="/profile"
            icon={User}
          />
        </div>
      </div>
    </DashboardShell>
  );
}

function StatCard({
  label,
  value,
  icon: Icon,
  href,
  accent,
}: {
  label: string;
  value: string | number;
  icon: React.ElementType;
  href: string;
  accent?: boolean;
}) {
  return (
    <Link
      href={href}
      className="group rounded-xl border border-border bg-card p-5 transition-all hover:border-foreground/20 hover:shadow-md hover:shadow-black/10"
    >
      <div className="flex items-start justify-between">
        <div
          className={`flex h-9 w-9 items-center justify-center rounded-lg ${
            accent ? "bg-brand/20 text-brand" : "bg-muted text-muted-foreground"
          }`}
        >
          <Icon className="h-4 w-4" />
        </div>
        <ArrowRight className="h-4 w-4 text-muted-foreground/40 transition-transform group-hover:translate-x-0.5 group-hover:text-muted-foreground" />
      </div>
      <p
        className={`mt-4 text-2xl font-bold tracking-tight ${
          accent ? "text-brand" : "text-foreground"
        }`}
      >
        {value}
      </p>
      <p className="mt-1 text-xs text-muted-foreground">{label}</p>
    </Link>
  );
}

function ActionCard({
  title,
  description,
  href,
  icon: Icon,
}: {
  title: string;
  description: string;
  href: string;
  icon: React.ElementType;
}) {
  return (
    <Link
      href={href}
      className="group flex items-start gap-4 rounded-xl border border-border bg-card p-5 transition-all hover:border-foreground/20 hover:shadow-md hover:shadow-black/10"
    >
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground transition-colors group-hover:bg-brand/20 group-hover:text-brand">
        <Icon className="h-4 w-4" />
      </div>
      <div>
        <p className="text-sm font-semibold text-foreground">{title}</p>
        <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>
      </div>
    </Link>
  );
}
