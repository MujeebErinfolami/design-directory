import designersData from "@/data/designers.json";

// ── Public types ─────────────────────────────────────────────────────────────

export type Specialty =
  | "Branding"
  | "UX/UI"
  | "Motion"
  | "Web"
  | "Print"
  | "Product"
  | "Illustration"
  | "Typography";

export type Availability = "available" | "freelance" | "unavailable";
export type ExperienceLevel = "junior" | "mid" | "senior";
export type DesignerSort = "az" | "za" | "newest";

export interface DesignerContact {
  email: string;
  website: string;
  linkedin: string;
  instagram: string;
  behance: string;
  dribbble: string;
}

export interface DesignerLocation {
  city: string;
  country: string;
  countryCode: string;
}

export interface Designer {
  id: string;
  slug: string;
  name: string;
  title: string;
  bio: string;
  avatarColor: string;
  initials: string;
  location: DesignerLocation;
  specialties: Specialty[];
  tools: string[];
  availability: Availability;
  experienceLevel: ExperienceLevel;
  contact: DesignerContact;
  agencyAffiliations: string[];
  projectSlugs: string[];
  awards: string[];
  createdAt: string;
}

export interface DesignerFilters {
  query?: string | null;
  specialty?: Specialty | null;
  availability?: Availability | null;
  experience?: ExperienceLevel | null;
  location?: string | null;
  sort?: DesignerSort;
}

// ── Constants ─────────────────────────────────────────────────────────────────

export const ALL_SPECIALTIES: Specialty[] = [
  "Branding",
  "UX/UI",
  "Motion",
  "Web",
  "Print",
  "Product",
  "Illustration",
  "Typography",
];

export const AVAILABILITY_LABELS: Record<Availability, string> = {
  available: "Available",
  freelance: "Open to freelance",
  unavailable: "Not available",
};

export const EXPERIENCE_LABELS: Record<ExperienceLevel, string> = {
  junior: "Junior",
  mid: "Mid-level",
  senior: "Senior",
};

// ── Data ──────────────────────────────────────────────────────────────────────

const designers = designersData as Designer[];

// ── Query functions (async to match the Prisma interface) ─────────────────────

export async function getAllDesigners(): Promise<Designer[]> {
  return [...designers].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

export async function getDesignerBySlug(slug: string): Promise<Designer | undefined> {
  return designers.find((d) => d.slug === slug);
}

export async function getFilteredDesigners(
  filters: DesignerFilters
): Promise<Designer[]> {
  const { query, specialty, availability, experience, location, sort = "newest" } = filters;

  let result = [...designers];

  if (query?.trim()) {
    const q = query.toLowerCase();
    result = result.filter(
      (d) =>
        d.name.toLowerCase().includes(q) ||
        d.title.toLowerCase().includes(q) ||
        d.specialties.some((s) => s.toLowerCase().includes(q)) ||
        d.location.city.toLowerCase().includes(q) ||
        d.location.country.toLowerCase().includes(q) ||
        d.tools.some((t) => t.toLowerCase().includes(q)) ||
        d.agencyAffiliations.some((a) => a.toLowerCase().includes(q))
    );
  }

  if (specialty) result = result.filter((d) => d.specialties.includes(specialty));
  if (availability) result = result.filter((d) => d.availability === availability);
  if (experience) result = result.filter((d) => d.experienceLevel === experience);
  if (location?.trim()) {
    const loc = location.toLowerCase();
    result = result.filter(
      (d) =>
        d.location.city.toLowerCase().includes(loc) ||
        d.location.country.toLowerCase().includes(loc)
    );
  }

  switch (sort) {
    case "az": result.sort((a, b) => a.name.localeCompare(b.name)); break;
    case "za": result.sort((a, b) => b.name.localeCompare(a.name)); break;
    default:
      result.sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
  }

  return result;
}

export async function getUniqueLocations(): Promise<string[]> {
  const cities = designers.map((d) => d.location.city);
  return [...new Set(cities)].sort();
}
