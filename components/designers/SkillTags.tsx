interface SkillTagsProps {
  specialties: string[];
  tools: string[];
  primaryRoles?: string[];
}

export function SkillTags({ specialties, tools, primaryRoles }: SkillTagsProps) {
  const roles = primaryRoles && primaryRoles.length > 0 ? primaryRoles : specialties;
  return (
    <div className="space-y-4">
      {roles.length > 0 && (
        <div>
          <p className="mb-2.5 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            Roles
          </p>
          <div className="flex flex-wrap gap-2">
            {roles.map((s) => (
              <span
                key={s}
                className="rounded-full bg-foreground px-3 py-1 text-xs font-semibold text-background"
              >
                {s}
              </span>
            ))}
          </div>
        </div>
      )}

      {tools.length > 0 && (
        <div>
          <p className="mb-2.5 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            Tools
          </p>
          <div className="flex flex-wrap gap-2">
            {tools.map((t) => (
              <span
                key={t}
                className="rounded-full border border-border px-3 py-1 text-xs text-muted-foreground"
              >
                {t}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
