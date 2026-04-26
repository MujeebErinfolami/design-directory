"use client";

import Link from "next/link";
import { CheckCheck, Bell } from "lucide-react";

interface Notification {
  id: string;
  type: string;
  title: string;
  body: string;
  link: string | null;
  read: boolean;
  createdAt: Date;
}

const TYPE_ICON: Record<string, string> = {
  submission_approved: "✅",
  submission_rejected: "❌",
  badge_verified: "🏅",
};

export function NotificationsList({ notifications }: { notifications: Notification[] }) {
  if (notifications.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-xl border border-border py-16 text-center">
        <Bell className="h-8 w-8 text-muted-foreground/40" />
        <p className="text-sm text-muted-foreground">No notifications yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {notifications.map((n) => {
        const icon = TYPE_ICON[n.type] ?? "🔔";
        const date = new Date(n.createdAt).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        });

        const inner = (
          <div
            className={`flex gap-4 rounded-xl border p-4 transition-colors ${
              n.read ? "border-border bg-background" : "border-border bg-muted/40"
            }`}
          >
            <span className="mt-0.5 text-xl leading-none">{icon}</span>
            <div className="min-w-0 flex-1">
              <p className={`text-sm font-medium ${n.read ? "text-foreground" : "text-foreground"}`}>
                {n.title}
              </p>
              <p className="mt-0.5 text-sm text-muted-foreground">{n.body}</p>
              <p className="mt-1.5 text-xs text-muted-foreground">{date}</p>
            </div>
            {!n.read && (
              <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-foreground" />
            )}
          </div>
        );

        return n.link ? (
          <Link key={n.id} href={n.link} className="block hover:opacity-90">
            {inner}
          </Link>
        ) : (
          <div key={n.id}>{inner}</div>
        );
      })}
    </div>
  );
}
