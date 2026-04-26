import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { ExternalLink, Download } from "lucide-react";
import { PageWrapper } from "@/components/layout/PageWrapper";
import { BackButton } from "@/components/layout/BackButton";
import { ProjectHero } from "@/components/projects/ProjectHero";
import { CreditsBlock } from "@/components/projects/CreditsBlock";
import { RelatedProjects } from "@/components/projects/RelatedProjects";
import {
  getProjectBySlug,
  getRelatedProjects,
  getAllProjects,
  type ContentBlock,
  type Project,
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
      title: `${project.title} — Rightstar Collective`,
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
      <ProjectHero project={project} />

      <PageWrapper>
        <div className="mb-10">
          <BackButton href="/projects" label="All projects" />
        </div>

        {project.layoutType === "gallery" ? (
          <GalleryLayout project={project} />
        ) : project.layoutType === "editor" ? (
          <EditorLayout project={project} />
        ) : (
          <CaseStudyLayout project={project} />
        )}

        <RelatedProjects projects={related} category={project.category} />
      </PageWrapper>
    </>
  );
}

// ─── Gallery layout ───────────────────────────────────────────────────────────

function GalleryLayout({ project }: { project: Project }) {
  return (
    <div className="space-y-10">
      <div className="max-w-2xl">
        <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
          {project.title}
        </h1>
        {project.tagline && (
          <p className="mt-3 text-lg text-muted-foreground">{project.tagline}</p>
        )}
        <p className="mt-4 text-base leading-relaxed text-foreground/80">
          {project.description}
        </p>
      </div>

      {project.galleryUrls.length > 0 && (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {project.galleryUrls.map((url, i) => (
            <div key={i} className="overflow-hidden rounded-xl border border-border">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={url}
                alt={`${project.title} — image ${i + 1}`}
                className="h-full w-full object-cover"
              />
            </div>
          ))}
        </div>
      )}

      <div className="max-w-sm">
        <CreditsBlock project={project} />
      </div>
    </div>
  );
}

// ─── Case study layout (seeded projects) ─────────────────────────────────────

function CaseStudyLayout({ project }: { project: Project }) {
  return (
    <div className="grid grid-cols-1 gap-12 lg:grid-cols-[1fr_300px]">
      <div className="min-w-0 space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            {project.title}
          </h1>
          {project.tagline && (
            <p className="mt-3 text-lg text-muted-foreground">{project.tagline}</p>
          )}
        </div>

        {project.contentBlocks.length > 0 ? (
          <div className="space-y-8">
            {project.contentBlocks.map((block, i) => (
              <LegacyBlockRenderer key={i} block={block} />
            ))}
          </div>
        ) : (
          <div className="space-y-5">
            {project.description.split("\n\n").map((para, i) => (
              <p key={i} className="text-base leading-relaxed text-foreground/80">
                {para}
              </p>
            ))}
          </div>
        )}

        <DesignerCTA project={project} />
      </div>

      <div>
        <CreditsBlock project={project} />
      </div>
    </div>
  );
}

// ─── Editor layout (Behance-style submissions) ────────────────────────────────

function EditorLayout({ project }: { project: Project }) {
  return (
    <div className="grid grid-cols-1 gap-12 lg:grid-cols-[1fr_300px]">
      {/* Canvas */}
      <div className="min-w-0 space-y-8">
        {/* Title area */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            {project.title}
          </h1>
          {project.tagline && (
            <p className="mt-3 text-lg text-muted-foreground">{project.tagline}</p>
          )}
          {project.description && (
            <p className="mt-4 text-base leading-relaxed text-foreground/80">
              {project.description}
            </p>
          )}
        </div>

        {/* Content blocks */}
        {project.contentBlocks.length > 0 && (
          <div className="space-y-8">
            {project.contentBlocks.map((block, i) => (
              <EditorBlockRenderer key={i} block={block} />
            ))}
          </div>
        )}

        {/* External link */}
        {project.externalLink && (
          <a
            href={project.externalLink}
            target="_blank"
            rel="noreferrer noopener"
            className="inline-flex items-center gap-2 rounded-md border border-border px-5 py-2.5 text-sm font-medium text-foreground hover:bg-muted"
          >
            <ExternalLink className="h-4 w-4" />
            {project.externalLinkLabel || "View Project"}
          </a>
        )}

        {/* Downloadable attachments */}
        {project.attachments.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              Downloads
            </p>
            {project.attachments.map((a, i) => (
              <a
                key={i}
                href={a.url}
                download={a.name}
                className="flex items-center gap-2.5 rounded-lg border border-border px-4 py-2.5 text-sm text-foreground hover:bg-muted"
              >
                <Download className="h-4 w-4 shrink-0 text-muted-foreground" />
                {a.name}
                <span className="ml-auto text-xs text-muted-foreground">
                  {(a.size / (1024 * 1024)).toFixed(1)} MB
                </span>
              </a>
            ))}
          </div>
        )}

        <DesignerCTA project={project} />
      </div>

      {/* Sidebar */}
      <div>
        <CreditsBlock project={project} />
      </div>
    </div>
  );
}

// ─── Block renderers ──────────────────────────────────────────────────────────

function LegacyBlockRenderer({ block }: { block: ContentBlock }) {
  if (block.type === "text" && "content" in block) {
    return (
      <p className="text-base leading-relaxed text-foreground/80">{block.content}</p>
    );
  }
  if (block.type === "image" && "url" in block) {
    return (
      <figure className="overflow-hidden rounded-xl border border-border">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={block.url} alt={block.caption || "Project image"} className="w-full object-cover" />
        {block.caption && (
          <figcaption className="border-t border-border px-4 py-2.5 text-xs text-muted-foreground">
            {block.caption}
          </figcaption>
        )}
      </figure>
    );
  }
  return null;
}

function EditorBlockRenderer({ block }: { block: ContentBlock }) {
  if (block.type === "text" && "html" in block) {
    return (
      <div
        className="prose prose-neutral dark:prose-invert max-w-none text-base leading-relaxed"
        dangerouslySetInnerHTML={{ __html: block.html }}
      />
    );
  }
  if (block.type === "text" && "content" in block) {
    return <p className="text-base leading-relaxed text-foreground/80">{block.content}</p>;
  }
  if (block.type === "image" && "url" in block) {
    return (
      <figure className="overflow-hidden rounded-xl border border-border">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={block.url} alt={block.caption || ""} className="w-full object-cover" />
        {block.caption && (
          <figcaption className="border-t border-border px-4 py-2.5 text-xs text-muted-foreground">
            {block.caption}
          </figcaption>
        )}
      </figure>
    );
  }
  if (block.type === "photo_grid") {
    const cols = block.urls.length <= 2 ? "grid-cols-2" : "grid-cols-2";
    return (
      <figure className="overflow-hidden rounded-xl border border-border">
        <div className={`grid ${cols} gap-0.5`}>
          {block.urls.map((url, i) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img key={i} src={url} alt="" className="aspect-square w-full object-cover" />
          ))}
        </div>
        {block.caption && (
          <figcaption className="border-t border-border px-4 py-2.5 text-xs text-muted-foreground">
            {block.caption}
          </figcaption>
        )}
      </figure>
    );
  }
  if (block.type === "video") {
    const src = getVideoEmbedSrc(block.embedUrl);
    if (!src) return null;
    return (
      <figure className="overflow-hidden rounded-xl border border-border">
        <div className="aspect-video">
          <iframe
            src={src}
            allow="autoplay; fullscreen"
            className="h-full w-full border-0"
            title={block.caption || "video"}
          />
        </div>
        {block.caption && (
          <figcaption className="border-t border-border px-4 py-2.5 text-xs text-muted-foreground">
            {block.caption}
          </figcaption>
        )}
      </figure>
    );
  }
  if (block.type === "embed") {
    return (
      <figure className="overflow-hidden rounded-xl border border-border">
        <div
          className="p-4"
          dangerouslySetInnerHTML={{ __html: block.code }}
        />
        {block.caption && (
          <figcaption className="border-t border-border px-4 py-2.5 text-xs text-muted-foreground">
            {block.caption}
          </figcaption>
        )}
      </figure>
    );
  }
  return null;
}

// ─── Designer CTA ─────────────────────────────────────────────────────────────

function DesignerCTA({ project }: { project: Project }) {
  return (
    <div className="mt-10 rounded-xl border border-border bg-muted/30 p-6">
      <p className="text-sm text-muted-foreground">Created by</p>
      <p className="mt-1 text-lg font-semibold text-foreground">{project.designer.name}</p>
      {project.designer.slug && (
        <Link
          href={`/designers/${project.designer.slug}`}
          className="mt-4 inline-flex items-center gap-2 rounded-md bg-foreground px-5 py-2.5 text-sm font-semibold text-background transition-opacity hover:opacity-80"
        >
          View Creative Profile
        </Link>
      )}
    </div>
  );
}

// ─── Video embed helper ───────────────────────────────────────────────────────

function getVideoEmbedSrc(url: string): string | null {
  if (!url) return null;
  try {
    const u = new URL(url);
    if (u.hostname.includes("youtube.com") || u.hostname.includes("youtu.be")) {
      const id = u.hostname.includes("youtu.be")
        ? u.pathname.slice(1)
        : u.searchParams.get("v");
      if (id) return `https://www.youtube-nocookie.com/embed/${id}`;
    }
    if (u.hostname.includes("vimeo.com")) {
      const id = u.pathname.split("/").filter(Boolean).pop();
      if (id) return `https://player.vimeo.com/video/${id}`;
    }
    if (u.hostname.includes("soundcloud.com")) {
      return `https://w.soundcloud.com/player/?url=${encodeURIComponent(url)}&auto_play=false&visual=true`;
    }
  } catch {
    // ignore
  }
  return null;
}
