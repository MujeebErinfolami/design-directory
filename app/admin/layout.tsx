import { requireAdmin } from "@/lib/auth";
import Link from "next/link";

const NAV = [
  { href: "/admin",              label: "Overview" },
  { href: "/admin/submissions",  label: "Submissions" },
  { href: "/admin/designers",    label: "Creatives" },
  { href: "/admin/projects",     label: "Projects" },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await requireAdmin();
  return (
    <div className="min-h-screen">
      <div className="border-b border-border bg-background">
        <div className="mx-auto flex max-w-7xl items-center gap-6 px-4 py-3 sm:px-6 lg:px-8">
          <span className="text-sm font-semibold">Admin</span>
          <nav className="flex items-center gap-4">
            {NAV.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className="text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                {label}
              </Link>
            ))}
          </nav>
          <div className="ml-auto">
            <Link href="/" className="text-xs text-muted-foreground hover:text-foreground">
              ← Back to site
            </Link>
          </div>
        </div>
      </div>
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">{children}</div>
    </div>
  );
}
