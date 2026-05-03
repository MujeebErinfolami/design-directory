import { DashboardSidebar, type DashboardUser } from "./DashboardSidebar";

interface DashboardShellProps {
  user: DashboardUser;
  children: React.ReactNode;
}

export function DashboardShell({ user, children }: DashboardShellProps) {
  return (
    <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
      <div className="flex flex-col py-8 lg:flex-row lg:gap-12 lg:py-12">
        {/* Sidebar — collapses to horizontal strip on mobile */}
        <div className="lg:w-52 lg:shrink-0">
          <DashboardSidebar user={user} />
        </div>

        {/* Page content */}
        <main className="min-w-0 flex-1">{children}</main>
      </div>
    </div>
  );
}
