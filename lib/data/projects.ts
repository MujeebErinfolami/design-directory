import { prisma } from "@/lib/prisma";

// ── Public types ─────────────────────────────────────────────────────────────

export type Category = "Branding" | "Web" | "Motion" | "Print" | "Product" | "UX";
export type SortOption = "newest" | "oldest" | "featured";

export interface ProjectDesigner {
  id: string;
  name: string;
  slug: string;
  initials: string;
}

export interface Project {
  id: string;
  slug: string;
  title: string;
  description: string;
  body: string;
  thumbnailColor: string;
  category: Category;
  tags: string[];
  year: number;
  designer: ProjectDesigner;
  agencyName: string;
  agencyUrl: string;
  sourceUrl: string;
  featured: boolean;
  createdAt: string;
}

export const ALL_CATEGORIES: Category[] = [
  "Branding", "Web", "Motion", "Print", "Product", "UX",
];

// ── Prisma include shape ──────────────────────────────────────────────────────

const include = {
  submittedBy: {
    include: {
      designerProfile: { select: { id: true, slug: true, displayName: true, initials: true } },
      agencyProfile:  { select: { id: true, slug: true, displayName: true } },
    },
  },
} as const;

type ProjectWithSubmitter = Awaited<
  ReturnType<typeof prisma.project.findFirst>
> & {
  submittedBy: {
    designerProfile: { id: string; slug: string; displayName: string; initials: string } | null;
    agencyProfile:  { id: string; slug: string; displayName: string } | null;
  };
};

// ── Mapper ────────────────────────────────────────────────────────────────────

function mapProject(p: ProjectWithSubmitter): Project {
  const dp = p.submittedBy.designerProfile;
  const ap = p.submittedBy.agencyProfile;
  const designer: ProjectDesigner = dp
    ? { id: dp.id, name: dp.displayName, slug: dp.slug, initials: dp.initials }
    : ap
    ? { id: ap.id, name: ap.displayName, slug: ap.slug, initials: ap.displayName.slice(0, 2).toUpperCase() }
    : { id: p.submittedById, name: "Unknown", slug: "", initials: "?" };

  return {
    id: p.id,
    slug: p.slug,
    title: p.title,
    description: p.description,
    body: p.body,
    thumbnailColor: p.thumbnailColor,
    category: p.category as Category,
    tags: p.tags,
    year: p.year,
    designer,
    agencyName: p.agencyName,
    agencyUrl: p.agencyUrl,
    sourceUrl: p.sourceUrl,
    featured: p.isFeatured,
    createdAt: p.createdAt.toISOString().slice(0, 10),
  };
}

// ── Query functions ───────────────────────────────────────────────────────────

export async function getAllProjects(): Promise<Project[]> {
  const projects = await prisma.project.findMany({
    where: { status: "approved" },
    orderBy: { createdAt: "desc" },
    include,
  });
  return projects.map((p) => mapProject(p as ProjectWithSubmitter));
}

export async function getProjectBySlug(slug: string): Promise<Project | undefined> {
  const p = await prisma.project.findUnique({ where: { slug }, include });
  return p ? mapProject(p as ProjectWithSubmitter) : undefined;
}

export async function getFilteredProjects(
  category?: Category | null,
  sort: SortOption = "newest"
): Promise<Project[]> {
  const projects = await prisma.project.findMany({
    where: {
      status: "approved",
      ...(category ? { category: category as any } : {}),
    },
    orderBy:
      sort === "oldest"
        ? { createdAt: "asc" }
        : sort === "featured"
        ? [{ isFeatured: "desc" }, { createdAt: "desc" }]
        : { createdAt: "desc" },
    include,
  });
  return projects.map((p) => mapProject(p as ProjectWithSubmitter));
}

export async function getRelatedProjects(current: Project, limit = 3): Promise<Project[]> {
  const projects = await prisma.project.findMany({
    where: {
      status: "approved",
      category: current.category as any,
      NOT: { id: current.id },
    },
    take: limit,
    orderBy: { createdAt: "desc" },
    include,
  });
  return projects.map((p) => mapProject(p as ProjectWithSubmitter));
}

export async function getFeaturedProjects(limit = 4): Promise<Project[]> {
  const projects = await prisma.project.findMany({
    where: { status: "approved", isFeatured: true },
    take: limit,
    orderBy: { createdAt: "desc" },
    include,
  });
  return projects.map((p) => mapProject(p as ProjectWithSubmitter));
}

export async function getProjectsByDesignerSlug(designerSlug: string): Promise<Project[]> {
  const projects = await prisma.project.findMany({
    where: {
      status: "approved",
      submittedBy: { designerProfile: { slug: designerSlug } },
    },
    orderBy: { createdAt: "desc" },
    include,
  });
  return projects.map((p) => mapProject(p as ProjectWithSubmitter));
}
