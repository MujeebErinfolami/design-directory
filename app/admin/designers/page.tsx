import { prisma } from "@/lib/prisma";
import { VerifyToggle } from "./VerifyToggle";

export const metadata = { title: "Admin — Designers" };

export default async function AdminDesignersPage() {
  const designers = await prisma.designerProfile.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      slug: true,
      displayName: true,
      title: true,
      locationCity: true,
      locationCountry: true,
      specialties: true,
      availability: true,
      isVerified: true,
      isFeatured: true,
      createdAt: true,
      avatarColor: true,
      initials: true,
      user: { select: { email: true } },
    },
  });

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Designers</h1>
        <p className="text-sm text-muted-foreground">{designers.length} profiles</p>
      </div>

      {designers.length === 0 ? (
        <div className="rounded-xl border border-border p-12 text-center text-sm text-muted-foreground">
          No designer profiles found.
        </div>
      ) : (
        <div className="divide-y divide-border rounded-xl border border-border">
          {designers.map((d) => (
            <div key={d.id} className="flex items-center gap-4 p-4">
              <div
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-xs font-semibold text-white"
                style={{ backgroundColor: d.avatarColor }}
              >
                {d.initials || d.displayName.slice(0, 2).toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <a
                    href={`/designers/${d.slug}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-sm font-semibold hover:underline"
                  >
                    {d.displayName}
                  </a>
                  {d.isFeatured && (
                    <span className="rounded-full border border-violet-200 bg-violet-50 px-2 py-0.5 text-xs text-violet-700">
                      Featured
                    </span>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  {[d.title, d.locationCity, d.locationCountry].filter(Boolean).join(" · ")}
                </p>
                <p className="text-xs text-muted-foreground">{d.user.email}</p>
              </div>
              <div className="shrink-0">
                <VerifyToggle id={d.id} isVerified={d.isVerified} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
