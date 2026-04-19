import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { PageWrapper } from "@/components/layout/PageWrapper";
import { BackButton } from "@/components/layout/BackButton";
import { ProjectHero } from "@/components/projects/ProjectHero";
import { CreditsBlock } from "@/components/projects/CreditsBlock";
import { RelatedProjects } from "@/components/projects/RelatedProjects";
import {
  getProjectBySlug,
  getRelatedProjects,
  getAllProjects,
} from "@/lib/data/projects";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const projects = await getAllProjects();
  return projects.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const project = await getProjectBySlug(slug);
  if (!project) return { title: "Project not found" };
  return {
    title: project.title,
    description: project.description,
    openGraph: {
      title: `${project.title} — Design Directory`,
      description: project.description,
    },
  };
}

export default async function ProjectDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const project = await getProjectBySlug(slug);
  if (!project) notFound();

  const related = await getRelatedProjects(project);

  return (
    <>
      {/* Hero — full bleed, no PageWrapper */}
      <ProjectHero project={project} />

      <PageWrapper>
        {/* Back link */}
        <div className="mb-10">
          <BackButton href="/projects" label="All projects" />
        </div>

        {/* Two-column layout */}
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-[1fr_300px]">
          {/* Body */}
          <div className="min-w-0">
            <div className="prose prose-neutral max-w-none">
              {project.body.split("\n\n").map((para, i) => (
                <p
                  key={i}
                  className="mb-5 text-base leading-relaxed text-foreground/80 last:mb-0"
                >
                  {para}
                </p>
              ))}
            </div>

            {/* Designer CTA */}
            <div className="mt-10 rounded-xl border border-border bg-muted/30 p-6">
              <p className="text-sm text-muted-foreground">Designed by</p>
              <p className="mt-1 text-lg font-semibold text-foreground">
                {project.designer.name}
              </p>
              <Link
                href={`/designers/${project.designer.slug}`}
                className="mt-4 inline-flex items-center gap-2 rounded-md bg-foreground px-5 py-2.5 text-sm font-semibold text-background transition-opacity hover:opacity-80"
              >
                View Designer Profile
              </Link>
            </div>
          </div>

          {/* Sidebar — credits */}
          <div>
            <CreditsBlock project={project} />
          </div>
        </div>

        {/* Related */}
        <RelatedProjects projects={related} category={project.category} />
      </PageWrapper>
    </>
  );
}
