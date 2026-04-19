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
      title: `${designer.name} — Design Directory`,
      description: designer.bio,
    },
  };
}

export default async function DesignerProfilePage({ params }: PageProps) {
  const { slug } = await params;
  const designer = await getDesignerBySlug(slug);
  if (!designer) notFound();

  const projects = await getProjectsByDesignerSlug(slug);

  return (
    <>
      {/* Hero banner — plain container, NOT a second <main> */}
      <div className="border-b border-border bg-muted/20">
        <div className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 md:py-16 lg:px-8">
          {/* Back link */}
          <div className="mb-8">
            <BackButton href="/designers" label="All designers" />
          </div>

          <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:gap-8">
            {/* Avatar */}
            <div
              className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl text-xl font-bold text-white sm:h-24 sm:w-24"
              style={{ backgroundColor: designer.avatarColor }}
            >
              {designer.initials}
            </div>

            {/* Info */}
            <div className="min-w-0 flex-1">
              <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                {designer.name}
              </h1>
              <p className="mt-1 text-base text-muted-foreground">
                {designer.title}
              </p>

              <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted-foreground">
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
                <span
                  className={[
                    "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium",
                    designer.availability === "available"
                      ? "bg-emerald-50 text-emerald-700"
                      : designer.availability === "freelance"
                      ? "bg-amber-50 text-amber-700"
                      : "bg-zinc-100 text-zinc-500",
                  ].join(" ")}
                >
                  <span
                    className={[
                      "h-1.5 w-1.5 rounded-full",
                      designer.availability === "available"
                        ? "bg-emerald-500"
                        : designer.availability === "freelance"
                        ? "bg-amber-400"
                        : "bg-zinc-400",
                    ].join(" ")}
                  />
                  {AVAILABILITY_LABELS[designer.availability]}
                </span>
                <span className="text-xs text-muted-foreground">
                  {EXPERIENCE_LABELS[designer.experienceLevel]}
                </span>
              </div>

              <p className="mt-4 max-w-2xl text-sm leading-relaxed text-muted-foreground">
                {designer.bio}
              </p>

              {designer.awards.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-2">
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

      {/* Body — single <main> via PageWrapper */}
      <PageWrapper>
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-[1fr_280px]">
          {/* Left: portfolio + skills */}
          <div className="space-y-10">
            <section>
              <h2 className="mb-5 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                Portfolio
              </h2>
              <PortfolioGallery projects={projects} />
            </section>

            <section>
              <h2 className="mb-5 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
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
