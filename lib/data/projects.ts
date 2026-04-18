import { prisma } from "@/lib/prisma";
import type { Project as PrismaProject, ProjectCategory, ProjectBadge, ProjectCredit, DesignerProfile } from "@prisma/client";

// ── Public types ──────────────────────────────────────────────────────────────

export type { ProjectCategory };
export type SortOption = "newest" | "oldest" | "featured";

// Shape returned to the rest of the app — a flat, UI-ready object.
// Keeps the same interface as the old JSON layer so pages need no changes.
export interface ProjectDesigner {
  id:       string;
  name:     string;
  slug:     string;
  initials: string;
}

export interface Project {
  id:             string;
  slug:           string;
  title:          string;
  description:    string;
  body:           string;
  thumbnailColor: string;
  thumbnailUrl:   string;
  galleryUrls:    string[];
  category:       ProjectCategory;
  tags:           string[];
  year:           number;
  designer:       ProjectDesigner;
  agencyName:     string;
  agencyUrl:      string;
  sourceUrl:      string;
  featured:       boolean;
  createdAt:      string;
}

export const ALL_CATEGORIES: ProjectCategory[] = [
  "Branding", "Web", "Motion", "Print", "Product", "UX",
];

// ── Internal DB type ──────────────────────────────────────────────────────────

type DBProject = PrismaProject & {
  credits: (ProjectCredit & { designerProfile: DesignerProfile | null })[];
};

// ── Mapper ────────────────────────────────────────────────────────────────────

function toProject(p: DBProject): Project {
  // Use the first linked credit as the primary designer, fall back to a stub.
  const primaryCredit = p.credits[0];
  const designer: ProjectDesigner = primaryCredit?.designerProfile
    ? {
        id:       primaryCredit.designerProfile.id,
        name:     primaryCredit.designerProfile.displayName,
        slug:     primaryCredit.designerProfile.slug,
        initials: primaryCredit.designerProfile.initials,
      }
    : {
        id:       "",
        name:     primaryCredit?.creditName ?? "Unknown",
        slug:     "",
        initials: (primaryCredit?.creditName ?? "?").slice(0, 2).toUpperCase(),
      };

  return {
    id:             p.id,
    slug:           p.slug,
    title:          p.title,
    description:    p.description,
    body:           p.body,
    thumbnailColor: p.thumbnailColor,
    thumbnailUrl:   p.thumbnailUrl,
    galleryUrls:    p.galleryUrls,
    category:       p.category,
    tags:           p.tags,
    year:           p.year,
    designer,
    agencyName:     p.agencyName,
    agencyUrl:      p.agencyUrl,
    sourceUrl:      p.sourceUrl,
    featured:       p.isFeatured,
    createdAt:      p.createdAt.toISOString().slice(0, 10),
  };
}

// Shared include — always pull credits + designer profile for the mapper.
const withCredits = {
  credits: { include: { designerProfile: true }, take: 1, orderBy: { createdAt: "asc" as const } },
} as const;

// ── Query functions ───────────────────────────────────────────────────────────

export async function getAllProjects(): Promise<Project[]> {
  const rows = await prisma.project.findMany({
    where:   { status: "approved" },
    include: withCredits,
    orderBy: { createdAt: "desc" },
  });
  return rows.map(toProject);
}

export async function getProjectBySlug(slug: string): Promise<Project | undefined> {
  const row = await prisma.project.findUnique({
    where:   { slug, status: "approved" },
    include: { credits: { include: { designerProfile: true } } },
  });
  return row ? toProject({ ...row, credits: row.credits }) : undefined;
}

export async function getFilteredProjects(
  category?: ProjectCategory | null,
  sort: SortOption = "newest"
): Promise<Project[]> {
  const orderBy =
    sort === "oldest"
      ? { createdAt: "asc" as const }
      : { createdAt: "desc" as const };

  const rows = await prisma.project.findMany({
    where: {
      status:   "approved",
      ...(category ? { category } : {}),
      ...(sort === "featured" ? { isFeatured: true } : {}),
    },
    include: withCredits,
    orderBy,
  });

  // "featured" sort: featured first, then rest by newest
  if (sort === "featured") {
    const featured    = rows.filter((r) => r.isFeatured);
    const nonFeatured = rows.filter((r) => !r.isFeatured)
                            .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    return [...featured, ...nonFeatured].map(toProject);
  }

  return rows.map(toProject);
}

export async function getRelatedProjects(
  current: Project,
  limit = 3
): Promise<Project[]> {
  const rows = await prisma.project.findMany({
    where:   { status: "approved", category: current.category, NOT: { id: current.id } },
    include: withCredits,
    take:    limit,
    orderBy: { createdAt: "desc" },
  });
  return rows.map(toProject);
}

export async function getFeaturedProjects(limit = 4): Promise<Project[]> {
  const rows = await prisma.project.findMany({
    where:   { status: "approved", isFeatured: true },
    include: withCredits,
    take:    limit,
    orderBy: { createdAt: "desc" },
  });
  return rows.map(toProject);
}

export async function getProjectsByDesignerSlug(
  designerSlug: string
): Promise<Project[]> {
  const rows = await prisma.project.findMany({
    where: {
      status:  "approved",
      credits: { some: { designerProfile: { slug: designerSlug } } },
    },
    include: withCredits,
    orderBy: { createdAt: "desc" },
  });
  return rows.map(toProject);
}
