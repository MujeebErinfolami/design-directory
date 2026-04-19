"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { AuthButton } from "./AuthButton";

const navLinks = [
  { href: "/projects", label: "Projects" },
  { href: "/designers", label: "Designers" },
  { href: "/blog", label: "Blog" },
];

interface Props {
  user: { name: string; email: string; image: string | null } | null;
}

export function ClientNav({ user }: Props) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();

  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(href + "/");

  return (
    <>
      {/* Desktop nav */}
      <nav className="hidden items-center gap-1 md:flex" aria-label="Main navigation">
        {navLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={cn(
              "rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
              isActive(link.href)
                ? "bg-muted text-foreground"
                : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
            )}
            aria-current={isActive(link.href) ? "page" : undefined}
          >
            {link.label}
          </Link>
        ))}
      </nav>

      {/* Desktop right side */}
      <div className="hidden items-center gap-3 md:flex">
        <Link
          href="/submit"
          className="rounded-md bg-foreground px-4 py-2 text-sm font-semibold text-background transition-opacity hover:opacity-80"
        >
          Submit Project
        </Link>
        <AuthButton user={user} />
      </div>

      {/* Mobile menu button */}
      <button
        className="flex items-center justify-center rounded-md p-2 text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring md:hidden"
        onClick={() => setMobileOpen((o) => !o)}
        aria-label={mobileOpen ? "Close menu" : "Open menu"}
        aria-expanded={mobileOpen}
        aria-controls="mobile-nav"
      >
        {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>

      {/* Mobile drawer */}
      <div
        id="mobile-nav"
        className={cn(
          "absolute left-0 right-0 top-full overflow-hidden border-t border-border bg-background transition-all duration-200 md:hidden",
          mobileOpen ? "max-h-96" : "max-h-0"
        )}
      >
        <nav className="flex flex-col gap-1 px-4 py-3" aria-label="Mobile navigation">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "rounded-md px-3 py-2 text-sm font-medium transition-colors",
                isActive(link.href)
                  ? "bg-muted text-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
              aria-current={isActive(link.href) ? "page" : undefined}
              onClick={() => setMobileOpen(false)}
            >
              {link.label}
            </Link>
          ))}
          <Link
            href="/submit"
            className="mt-2 rounded-md bg-foreground px-3 py-2 text-center text-sm font-semibold text-background"
            onClick={() => setMobileOpen(false)}
          >
            Submit Project
          </Link>
          <div className="mt-2 px-3 py-1">
            <AuthButton user={user} />
          </div>
        </nav>
      </div>
    </>
  );
}
