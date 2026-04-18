interface SkillTagsProps {
  specialties: string[];
  tools: string[];
}

export function SkillTags({ specialties, tools }: SkillTagsProps) {
  return (
    <div className="space-y-4">
      {specialties.length > 0 && (
        <div>
          <p className="mb-2.5 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            Specialties
          </p>
          <div className="flex flex-wrap gap-2">
            {specialties.map((s) => (
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
