"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  User,
  PlusCircle,
  FolderOpen,
  Bell,
  Settings,
  LogOut,
} from "lucide-react";
import { signOut } from "next-auth/react";

export interface DashboardUser {
  name?: string | null;
  email?: string | null;
  image?: string | null;
  accountType?: string | null;
}

const NAV = [
  { href: "/dashboard",     label: "Overview",      icon: LayoutDashboard },
  { href: "/profile",       label: "Profile",        icon: User },
  { href: "/submit",        label: "Submit",         icon: PlusCircle },
  { href: "/submissions",   label: "Submissions",    icon: FolderOpen },
  { href: "/notifications", label: "Notifications",  icon: Bell },
  { href: "/settings",      label: "Settings",       icon: Settings },
];

export function DashboardSidebar({ user }: { user: DashboardUser }) {
  const pathname = usePathname();

  const initials = user.name
    ? user.name.split(" ").filter(Boolean).map((n) => n[0]).join("").slice(0, 2).toUpperCase()
    : "?";

  const roleLabel =
    user.accountType === "designer"
      ? "Creative"
      : user.accountType === "agency"
        ? "Agency"
        : "Member";

  return (
    <>
      {/* ── Desktop sidebar ────────────────────────────────────── */}
      <div className="hidden lg:flex lg:flex-col lg:gap-0.5">
        {/* User block */}
        <div className="mb-6 flex items-center gap-3 px-3">
          {user.image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={user.image}
              alt={user.name ?? ""}
              className="h-9 w-9 rounded-full object-cover"
            />
          ) : (
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand/20 text-xs font-bold text-brand">
              {initials}
            </div>
          )}
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-foreground">
              {user.name ?? "—"}
            </p>
            <p className="truncate text-xs text-muted-foreground">{roleLabel}</p>
          </div>
        </div>

        {/* Nav links */}
        {NAV.map(({ href, label, icon: Icon }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors ${
                active
                  ? "bg-brand/10 font-semibold text-brand"
                  : "font-medium text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {label}
            </Link>
          );
        })}

        {/* Sign out */}
        <div className="mt-6 border-t border-border pt-4">
          <button
            onClick={() => signOut({ callbackUrl: "/" })}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <LogOut className="h-4 w-4 shrink-0" />
            Sign out
          </button>
        </div>
      </div>

      {/* ── Mobile strip ───────────────────────────────────────── */}
      <div className="mb-6 flex items-center gap-1 overflow-x-auto border-b border-border pb-4 lg:hidden">
        {NAV.map(({ href, label, icon: Icon }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={`flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                active
                  ? "bg-brand/10 text-brand"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              <Icon className="h-3.5 w-3.5 shrink-0" />
              {label}
            </Link>
          );
        })}
      </div>
    </>
  );
}
