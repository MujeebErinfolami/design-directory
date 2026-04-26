"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Bell } from "lucide-react";

export function NotificationBell() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    fetch("/api/notifications")
      .then((r) => r.json())
      .then((d) => setCount(d.unreadCount ?? 0))
      .catch(() => {});

    // Recheck every 60 seconds
    const id = setInterval(() => {
      fetch("/api/notifications")
        .then((r) => r.json())
        .then((d) => setCount(d.unreadCount ?? 0))
        .catch(() => {});
    }, 60_000);
    return () => clearInterval(id);
  }, []);

  return (
    <Link href="/notifications" className="relative flex items-center text-muted-foreground hover:text-foreground transition-colors">
      <Bell className="h-5 w-5" />
      {count > 0 && (
        <span className="absolute -right-1.5 -top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-foreground text-[10px] font-semibold text-background">
          {count > 9 ? "9+" : count}
        </span>
      )}
    </Link>
  );
}
