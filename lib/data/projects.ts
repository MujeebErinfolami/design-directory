import projectsData from "@/data/projects.json";

// ── Public types ─────────────────────────────────────────────────────────────

export type Category =
  | "Branding"
  | "Web"
  | "Motion"
  | "Print"
  | "Product"
  | "UX";

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
  "Branding",
  "Web",
  "Motion",
  "Print",
  "Product",
  "UX",
];

// ── Data ──────────────────────────────────────────────────────────────────────

const projects = projectsData as Project[];

// ── Query functions (async to match the Prisma interface) ─────────────────────

export async function getAllProjects(): Promise<Project[]> {
  return [...projects].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

export async function getProjectBySlug(slug: string): Promise<Project | undefined> {
  return projects.find((p) => p.slug === slug);
}

export async function getFilteredProjects(
  category?: Category | null,
  sort: SortOption = "newest"
): Promise<Project[]> {
  let result = category
    ? projects.filter((p) => p.category === category)
    : [...projects];

  switch (sort) {
    case "oldest":
      result.sort(
        (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      );
      break;
    case "featured":
      result.sort((a, b) => Number(b.featured) - Number(a.featured));
      break;
    default:
      result.sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
  }

  return result;
}

export async function getRelatedProjects(
  current: Project,
  limit = 3
): Promise<Project[]> {
  return projects
    .filter((p) => p.category === current.category && p.id !== current.id)
    .slice(0, limit);
}

export async function getFeaturedProjects(limit = 4): Promise<Project[]> {
  return projects.filter((p) => p.featured).slice(0, limit);
}

export async function getProjectsByDesignerSlug(
  designerSlug: string
): Promise<Project[]> {
  return projects.filter((p) => p.designer.slug === designerSlug);
}
