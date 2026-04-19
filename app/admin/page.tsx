import { prisma } from "@/lib/prisma";
import Link from "next/link";

export const metadata = { title: "Admin — Overview" };

export default async function AdminPage() {
  const [pending, approved, rejected, designers, agencies] = await Promise.all([
    prisma.project.count({ where: { status: "pending" } }),
    prisma.project.count({ where: { status: "approved" } }),
    prisma.project.count({ where: { status: "rejected" } }),
    prisma.designerProfile.count(),
    prisma.agencyProfile.count(),
  ]);

  const stats = [
    { label: "Pending Review",      value: pending,   href: "/admin/submissions", highlight: pending > 0 },
    { label: "Approved Projects",   value: approved,  href: "/admin/projects",    highlight: false },
    { label: "Rejected Projects",   value: rejected,  href: "/admin/submissions", highlight: false },
    { label: "Designer Profiles",   value: designers, href: "/admin/designers",   highlight: false },
    { label: "Agency Profiles",     value: agencies,  href: "/admin/designers",   highlight: false },
  ];

  return (
    <div>
      <h1 className="mb-8 text-2xl font-bold tracking-tight">Overview</h1>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {stats.map(({ label, value, href, highlight }) => (
          <Link
            key={label}
            href={href}
            className={`group rounded-xl border p-5 transition-shadow hover:shadow-md ${
              highlight ? "border-amber-200 bg-amber-50" : "border-border bg-background"
            }`}
          >
            <p className={`text-3xl font-bold tabular-nums ${highlight ? "text-amber-700" : ""}`}>
              {value}
            </p>
            <p className={`mt-1 text-sm ${highlight ? "text-amber-600" : "text-muted-foreground"}`}>
              {label}
            </p>
          </Link>
        ))}
      </div>

      <div className="mt-10 grid gap-4 sm:grid-cols-3">
        <QuickLink href="/admin/submissions" title="Review Queue" description="Approve or reject pending project submissions." />
        <QuickLink href="/admin/designers"   title="Verify Designers" description="Grant or revoke verification badges for designers." />
        <QuickLink href="/admin/projects"    title="Assign Badges" description="Mark approved projects as Featured, Editor's Pick, or Best of Year." />
      </div>
    </div>
  );
}

function QuickLink({ href, title, description }: { href: string; title: string; description: string }) {
  return (
    <Link href={href} className="rounded-xl border border-border bg-background p-5 transition-shadow hover:shadow-md">
      <h2 className="font-semibold">{title}</h2>
      <p className="mt-1 text-sm text-muted-foreground">{description}</p>
      <p className="mt-3 text-sm font-medium">Open →</p>
    </Link>
  );
}
