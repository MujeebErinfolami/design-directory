import { Globe, ExternalLink, Mail } from "lucide-react";
import type { DesignerContact } from "@/lib/data/designers";

interface ContactBlockProps {
  contact: DesignerContact;
  name: string;
}

const socialLinks = [
  {
    key: "linkedin" as const,
    label: "LinkedIn",
    icon: ExternalLink,
  },
  {
    key: "instagram" as const,
    label: "Instagram",
    icon: ExternalLink,
  },
  {
    key: "behance" as const,
    label: "Behance",
    icon: ExternalLink,
  },
  {
    key: "dribbble" as const,
    label: "Dribbble",
    icon: ExternalLink,
  },
];

export function ContactBlock({ contact, name }: ContactBlockProps) {
  const hasSocial = socialLinks.some((s) => !!contact[s.key]);

  return (
    <aside className="rounded-xl border border-border bg-muted/30 p-6">
      <h2 className="mb-5 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
        Contact
      </h2>

      <div className="space-y-3">
        {/* Email */}
        {contact.email && (
          <a
            href={`mailto:${contact.email}`}
            className="flex items-center gap-3 text-sm text-foreground hover:underline underline-offset-2"
          >
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-border bg-background">
              <Mail className="h-3.5 w-3.5 text-muted-foreground" />
            </span>
            <span className="truncate">{contact.email}</span>
          </a>
        )}

        {/* Website */}
        {contact.website && (
          <a
            href={contact.website}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 text-sm text-foreground hover:underline underline-offset-2"
          >
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-border bg-background">
              <Globe className="h-3.5 w-3.5 text-muted-foreground" />
            </span>
            <span className="truncate">
              {contact.website.replace(/^https?:\/\//, "")}
            </span>
          </a>
        )}
      </div>

      {/* Social links */}
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
                className="flex items-center gap-1.5 rounded-md border border-border bg-background px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground hover:bg-muted"
              >
                <s.icon className="h-3 w-3" />
                {s.label}
              </a>
            ))}
        </div>
      )}

      {/* Get in touch CTA */}
      {contact.email && (
        <a
          href={`mailto:${contact.email}`}
          className="mt-5 flex w-full items-center justify-center gap-2 rounded-md bg-foreground px-4 py-2.5 text-sm font-semibold text-background transition-opacity hover:opacity-80"
        >
          Get in touch
        </a>
      )}
    </aside>
  );
}
