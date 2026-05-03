"use client";

import Link from "next/link";
import { Bell, CheckCircle2, XCircle, Award } from "lucide-react";

interface Notification {
  id: string;
  type: string;
  title: string;
  body: string;
  link: string | null;
  read: boolean;
  createdAt: Date;
}

function TypeIcon({ type }: { type: string }) {
  if (type === "submission_approved")
    return (
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-500/15">
        <CheckCircle2 className="h-4 w-4 text-emerald-500" />
      </div>
    );
  if (type === "submission_rejected")
    return (
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-red-500/15">
        <XCircle className="h-4 w-4 text-red-500" />
      </div>
    );
  if (type === "badge_verified")
    return (
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand/15">
        <Award className="h-4 w-4 text-brand" />
      </div>
    );
  return (
    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted">
      <Bell className="h-4 w-4 text-muted-foreground" />
    </div>
  );
}

export function NotificationsList({ notifications }: { notifications: Notification[] }) {
  if (notifications.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-xl border border-border bg-card py-16 text-center">
        <Bell className="h-8 w-8 text-muted-foreground/40" />
        <p className="text-sm text-muted-foreground">No notifications yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {notifications.map((n) => {
        const date = new Date(n.createdAt).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        });

        const inner = (
          <div
            className={`flex gap-4 rounded-xl border p-4 transition-colors ${
              n.read
                ? "border-border bg-card"
                : "border-brand/20 bg-brand/5"
            }`}
          >
            <TypeIcon type={n.type} />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-foreground">{n.title}</p>
              <p className="mt-0.5 text-sm text-muted-foreground">{n.body}</p>
              <p className="mt-1.5 text-xs text-muted-foreground">{date}</p>
            </div>
            {!n.read && (
              <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-brand" />
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
