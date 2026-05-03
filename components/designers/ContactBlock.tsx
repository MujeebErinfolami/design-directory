import { Globe, ExternalLink, Mail } from "lucide-react";
import type { DesignerContact } from "@/lib/data/designers";

interface ContactBlockProps {
  contact: DesignerContact;
  name: string;
}

const socialLinks = [
  { key: "linkedin" as const, label: "LinkedIn" },
  { key: "instagram" as const, label: "Instagram" },
  { key: "behance" as const, label: "Behance" },
  { key: "dribbble" as const, label: "Dribbble" },
];

export function ContactBlock({ contact, name }: ContactBlockProps) {
  const hasSocial = socialLinks.some((s) => !!contact[s.key]);

  return (
    <aside className="rounded-xl border border-border bg-card p-6">
      <h2 className="mb-5 text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
        Contact
      </h2>

      <div className="space-y-3">
        {contact.email && (
          <a
            href={`mailto:${contact.email}`}
            className="flex items-center gap-3 rounded-lg border border-border p-3 text-sm text-foreground transition-colors hover:bg-muted"
          >
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-muted">
              <Mail className="h-3.5 w-3.5 text-muted-foreground" />
            </span>
            <span className="truncate text-xs">{contact.email}</span>
          </a>
        )}

        {contact.website && (
          <a
            href={contact.website}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 rounded-lg border border-border p-3 text-sm text-foreground transition-colors hover:bg-muted"
          >
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-muted">
              <Globe className="h-3.5 w-3.5 text-muted-foreground" />
            </span>
            <span className="truncate text-xs">
              {contact.website.replace(/^https?:\/\//, "")}
            </span>
          </a>
        )}
      </div>

      {hasSocial && (
        <div className="mt-5 flex flex-wrap gap-2 border-t border-border pt-5">
          {socialLinks
            .filter((s) => !!contact[s.key])
            .map((s) => (
              <a
                key={s.key}
                href={contact[s.key]}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`${name} on ${s.label}`}
                className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-background px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                <ExternalLink className="h-3 w-3" />
                {s.label}
              </a>
            ))}
        </div>
      )}

      {contact.email && (
        <a
          href={`mailto:${contact.email}`}
          className="mt-5 flex w-full items-center justify-center gap-2 rounded-lg bg-foreground px-4 py-2.5 text-sm font-semibold text-background transition-opacity hover:opacity-80"
        >
          Get in touch
        </a>
      )}
    </aside>
  );
}
