import Link from "next/link";
import { MapPin, ExternalLink, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Designer, Availability } from "@/lib/data/designers";

const AVAIL: Record<Availability, { label: string; dot: string; text: string }> = {
  available: {
    label: "Available",
    dot: "bg-emerald-500",
    text: "text-emerald-500 dark:text-emerald-400",
  },
  freelance: {
    label: "Open to freelance",
    dot: "bg-amber-500",
    text: "text-amber-500 dark:text-amber-400",
  },
  unavailable: {
    label: "Not available",
    dot: "bg-zinc-400",
    text: "text-zinc-500 dark:text-zinc-400",
  },
};

export function DesignerCard({ designer }: { designer: Designer }) {
  const avail = AVAIL[designer.availability];

  return (
    <article className="group flex flex-col overflow-hidden rounded-xl border border-border bg-card transition-all duration-200 hover:scale-[1.02] hover:shadow-xl hover:shadow-black/20">

      {/* Profile image — full-width color block */}
      <Link
        href={`/designers/${designer.slug}`}
        aria-label={`View ${designer.name}'s profile`}
        className="relative block aspect-[4/3] overflow-hidden"
        style={{ backgroundColor: designer.avatarColor }}
      >
        {/* Large initials */}
        <span className="absolute inset-0 flex items-center justify-center select-none text-6xl font-bold text-white/30">
          {designer.initials}
        </span>

        {/* Hover overlay */}
        <div className="absolute inset-0 bg-black/0 transition-colors duration-300 group-hover:bg-black/55" />

        {/* "View Profile" — slides up on hover */}
        <div className="absolute inset-x-0 bottom-0 flex translate-y-2 items-center gap-2 px-4 py-4 opacity-0 transition-all duration-200 group-hover:translate-y-0 group-hover:opacity-100">
          <span className="text-sm font-semibold text-white">View Profile</span>
          <ArrowRight className="h-3.5 w-3.5 text-white" />
        </div>
      </Link>

      {/* Card body */}
      <div className="flex flex-1 flex-col gap-3 p-5">
        {/* Name + title */}
        <div>
          <h2 className="text-base font-bold leading-tight tracking-tight text-foreground">
            <Link
              href={`/designers/${designer.slug}`}
              className="hover:underline underline-offset-2"
            >
              {designer.name}
            </Link>
          </h2>
          <p className="mt-0.5 text-sm text-muted-foreground">{designer.title}</p>
        </div>

        {/* Location */}
        <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <MapPin className="h-3 w-3 shrink-0" />
          {designer.location.city}, {designer.location.country}
        </p>

        {/* Primary roles */}
        {designer.primaryRoles.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {designer.primaryRoles.slice(0, 3).map((r) => (
              <span
                key={r}
                className="rounded-full border border-border px-2.5 py-0.5 text-xs font-medium text-muted-foreground"
              >
                {r}
              </span>
            ))}
            {designer.primaryRoles.length > 3 && (
              <span className="rounded-full border border-border px-2.5 py-0.5 text-xs text-muted-foreground">
                +{designer.primaryRoles.length - 3}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Footer — availability + website */}
      <div className="flex items-center justify-between border-t border-border px-5 py-3">
        <span className={cn("flex items-center gap-1.5 text-xs font-medium", avail.text)}>
          <span className={cn("h-1.5 w-1.5 rounded-full", avail.dot)} />
          {avail.label}
        </span>

        {designer.contact.website && (
          <a
            href={designer.contact.website}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`${designer.name}'s website`}
            className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <ExternalLink className="h-3.5 w-3.5" />
          </a>
        )}
      </div>
    </article>
  );
}
