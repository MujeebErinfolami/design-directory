import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { MapPin, Briefcase } from "lucide-react";
import { BackButton } from "@/components/layout/BackButton";
import { PageWrapper } from "@/components/layout/PageWrapper";
import { SkillTags } from "@/components/designers/SkillTags";
import { ContactBlock } from "@/components/designers/ContactBlock";
import { PortfolioGallery } from "@/components/designers/PortfolioGallery";
import {
  getAllDesigners,
  getDesignerBySlug,
  AVAILABILITY_LABELS,
  EXPERIENCE_LABELS,
} from "@/lib/data/designers";
import { getProjectsByDesignerSlug } from "@/lib/data/projects";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const designers = await getAllDesigners();
  return designers.map((d) => ({ slug: d.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const designer = await getDesignerBySlug(slug);
  if (!designer) return {};
  return {
    title: designer.name,
    description: `${designer.title} based in ${designer.location.city}. ${designer.bio.slice(0, 120)}…`,
    openGraph: {
      title: `${designer.name} — Rightstar Collective`,
      description: designer.bio,
    },
  };
}

const availabilityStyles = {
  available: {
    badge: "bg-emerald-500/15 text-emerald-500 dark:text-emerald-400 border border-emerald-500/20",
    dot: "bg-emerald-500",
  },
  freelance: {
    badge: "bg-amber-500/15 text-amber-500 dark:text-amber-400 border border-amber-500/20",
    dot: "bg-amber-500",
  },
  unavailable: {
    badge: "bg-zinc-500/15 text-zinc-500 dark:text-zinc-400 border border-zinc-500/20",
    dot: "bg-zinc-400",
  },
};

export default async function DesignerProfilePage({ params }: PageProps) {
  const { slug } = await params;
  const designer = await getDesignerBySlug(slug);
  if (!designer) notFound();

  const projects = await getProjectsByDesignerSlug(slug);
  const avail = availabilityStyles[designer.availability];

  return (
    <>
      {/* Profile hero */}
      <div className="border-b border-border bg-card">
        <div className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 md:py-16 lg:px-8">
          <div className="mb-8">
            <BackButton href="/designers" label="All creatives" />
          </div>

          <div className="flex flex-col gap-8 sm:flex-row sm:items-start">
            {/* Avatar */}
            {designer.avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={designer.avatarUrl}
                alt={designer.name}
                className="h-24 w-24 shrink-0 rounded-2xl object-cover sm:h-28 sm:w-28"
              />
            ) : (
              <div
                className="flex h-24 w-24 shrink-0 items-center justify-center rounded-2xl text-2xl font-bold text-white sm:h-28 sm:w-28"
                style={{ backgroundColor: designer.avatarColor }}
              >
                {designer.initials}
              </div>
            )}

            {/* Info */}
            <div className="min-w-0 flex-1">
              <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                {designer.name}
              </h1>
              <p className="mt-1.5 text-base text-muted-foreground">
                {designer.title}
              </p>

              <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2.5 text-sm text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <MapPin className="h-3.5 w-3.5" />
                  {designer.location.city}, {designer.location.country}
                </span>

                {designer.agencyAffiliations.length > 0 && (
                  <span className="flex items-center gap-1.5">
                    <Briefcase className="h-3.5 w-3.5" />
                    {designer.agencyAffiliations.join(", ")}
                  </span>
                )}

                <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ${avail.badge}`}>
                  <span className={`h-1.5 w-1.5 rounded-full ${avail.dot}`} />
                  {AVAILABILITY_LABELS[designer.availability]}
                </span>

                <span className="text-xs text-muted-foreground">
                  {EXPERIENCE_LABELS[designer.experienceLevel]}
                </span>
              </div>

              <p className="mt-5 max-w-2xl text-sm leading-relaxed text-muted-foreground">
                {designer.bio}
              </p>

              {designer.awards.length > 0 && (
                <div className="mt-5 flex flex-wrap gap-2">
                  {designer.awards.map((award) => (
                    <span
                      key={award}
                      className="rounded-full border border-border bg-background px-2.5 py-0.5 text-xs text-muted-foreground"
                    >
                      {award}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Body */}
      <PageWrapper>
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-[1fr_280px]">
          {/* Left: portfolio + skills */}
          <div className="space-y-12">
            <section>
              <h2 className="mb-6 text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                Portfolio
              </h2>
              <PortfolioGallery projects={projects} />
            </section>

            <section>
              <h2 className="mb-6 text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                Skills &amp; Tools
              </h2>
              <SkillTags
                specialties={designer.specialties}
                primaryRoles={designer.primaryRoles}
                tools={designer.tools}
              />
            </section>
          </div>

          {/* Right: contact */}
          <div>
            <ContactBlock contact={designer.contact} name={designer.name} />
          </div>
        </div>
      </PageWrapper>
    </>
  );
}
