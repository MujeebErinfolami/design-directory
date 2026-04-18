"use client";

import { signOut } from "next-auth/react";
import Link from "next/link";

interface Props {
  user: { name: string; email: string; image: string | null } | null;
}

export function AuthButton({ user }: Props) {
  if (!user) {
    return (
      <Link
        href="/auth/signin"
        className="rounded-md border border-border px-3 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:border-foreground hover:text-foreground"
      >
        Sign in
      </Link>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <Link href="/dashboard" className="flex items-center gap-2 group">
        {user.image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={user.image}
            alt={user.name}
            className="h-8 w-8 rounded-full object-cover ring-2 ring-transparent group-hover:ring-border transition-all"
          />
        ) : (
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-xs font-semibold">
            {user.name?.[0] ?? "?"}
          </span>
        )}
      </Link>
      <button
        onClick={() => signOut({ callbackUrl: "/" })}
        className="text-xs text-muted-foreground hover:text-foreground transition-colors"
      >
        Sign out
      </button>
    </div>
  );
}
