import Link from "next/link";
import { MapPin, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Designer, Availability } from "@/lib/data/designers";

const AVAILABILITY_CONFIG: Record<
  Availability,
  { label: string; dot: string; text: string }
> = {
  available: {
    label: "Available",
    dot: "bg-emerald-500",
    text: "text-emerald-700",
  },
  freelance: {
    label: "Open to freelance",
    dot: "bg-amber-500",
    text: "text-amber-700",
  },
  unavailable: {
    label: "Not available",
    dot: "bg-zinc-400",
    text: "text-zinc-500",
  },
};

interface DesignerCardProps {
  designer: Designer;
}

export function DesignerCard({ designer }: DesignerCardProps) {
  const avail = AVAILABILITY_CONFIG[designer.availability];

  return (
    <article className="group flex flex-col rounded-xl border border-border bg-background transition-shadow hover:shadow-md">
      <div className="flex flex-1 flex-col p-5">
        {/* Top row: avatar + name + title */}
        <div className="flex items-start gap-4">
          <Link
            href={`/designers/${designer.slug}`}
            aria-label={`View ${designer.name}'s profile`}
            className="shrink-0"
          >
            <div
              className="flex h-14 w-14 items-center justify-center rounded-xl text-base font-bold text-foreground/70 transition-transform group-hover:scale-105"
              style={{ backgroundColor: designer.avatarColor }}
            >
              {designer.initials}
            </div>
          </Link>

          <div className="min-w-0 flex-1">
            <h2 className="truncate text-base font-semibold leading-tight tracking-tight text-foreground">
              <Link
                href={`/designers/${designer.slug}`}
                className="hover:underline underline-offset-2"
              >
                {designer.name}
              </Link>
            </h2>
            <p className="mt-0.5 truncate text-sm text-muted-foreground">
              {designer.title}
            </p>
            <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
              <MapPin className="h-3 w-3 shrink-0" />
              <span className="truncate">
                {designer.location.city}, {designer.location.country}
              </span>
            </p>
          </div>
        </div>

        {/* Specialties */}
        {designer.specialties.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-1.5">
            {designer.specialties.map((s) => (
              <span
                key={s}
                className="rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-foreground"
              >
                {s}
              </span>
            ))}
          </div>
        )}

        {/* Tools (secondary) */}
        {designer.tools.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1.5">
            {designer.tools.slice(0, 3).map((t) => (
              <span
                key={t}
                className="rounded-full border border-border px-2 py-0.5 text-xs text-muted-foreground"
              >
                {t}
              </span>
            ))}
            {designer.tools.length > 3 && (
              <span className="rounded-full border border-border px-2 py-0.5 text-xs text-muted-foreground">
                +{designer.tools.length - 3}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between border-t border-border px-5 py-3">
        {/* Availability */}
        <span className={cn("flex items-center gap-1.5 text-xs font-medium", avail.text)}>
          <span className={cn("h-1.5 w-1.5 rounded-full", avail.dot)} />
          {avail.label}
        </span>

        {/* Actions */}
        <div className="flex items-center gap-1">
          <Link
            href={`/designers/${designer.slug}`}
            className="rounded-md px-2.5 py-1 text-xs font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          >
            Profile
          </Link>
          {designer.contact.website && (
            <a
              href={designer.contact.website}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`${designer.name}'s website`}
              className="rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
            >
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
          )}
        </div>
      </div>
    </article>
  );
}
