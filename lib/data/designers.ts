import { prisma } from "@/lib/prisma";

// ── Role / filter types ───────────────────────────────────────────────────────

export const PRIMARY_ROLES = [
  "Brand Designer",
  "UI/UX Designer",
  "Motion Designer",
  "Illustrator",
  "Photographer",
  "Videographer",
  "Art Director",
  "Creative Director",
  "3D Artist",
  "Copywriter & Creative",
  "Content Creator",
  "Web Designer",
  "Product Designer",
  "Creatiologist",
] as const;

export type PrimaryRole = (typeof PRIMARY_ROLES)[number];

/** Alias kept so FilterPanel / page imports don't break */
export type Specialty = PrimaryRole;
export const ALL_SPECIALTIES: readonly PrimaryRole[] = PRIMARY_ROLES;

export type Availability = "available" | "freelance" | "unavailable";
export type ExperienceLevel = "junior" | "mid" | "senior";
export type DesignerSort = "az" | "za" | "newest";

// ── Public interfaces ─────────────────────────────────────────────────────────

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
  avatarUrl?: string | null;
  avatarColor: string;
  initials: string;
  location: DesignerLocation;
  primaryRoles: string[];
  /** @deprecated use primaryRoles — kept for SkillTags / FilterPanel compat */
  specialties: string[];
  tools: string[];
  availability: Availability;
  experienceLevel: ExperienceLevel;
  contact: DesignerContact;
  agencyAffiliations: string[];
  projectSlugs: string[];
  awards: string[];
  isVerified: boolean;
  isFeatured: boolean;
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

// ── Mapper ────────────────────────────────────────────────────────────────────

type ProfileWithAgencies = Awaited<
  ReturnType<typeof prisma.designerProfile.findFirst>
> & {
  agencyMemberships: { agency: { displayName: string } }[];
};

function mapProfile(p: ProfileWithAgencies): Designer {
  return {
    id: p.id,
    slug: p.slug,
    name: p.displayName,
    title: p.title,
    bio: p.bio,
    avatarUrl: p.avatarUrl ?? null,
    avatarColor: p.avatarColor,
    initials: p.initials || p.displayName.slice(0, 2).toUpperCase(),
    location: {
      city: p.locationCity,
      country: p.locationCountry,
      countryCode: p.locationCountryCode,
    },
    primaryRoles: p.primaryRoles ?? [],
    specialties: (p.primaryRoles ?? []).length > 0 ? (p.primaryRoles ?? []) : (p.specialties ?? []),
    tools: p.tools,
    availability: p.availability as Availability,
    experienceLevel: p.experienceLevel as ExperienceLevel,
    contact: {
      email: p.contactEmail,
      website: p.contactWebsite,
      linkedin: p.contactLinkedin,
      instagram: p.contactInstagram,
      behance: p.contactBehance,
      dribbble: p.contactDribbble,
    },
    agencyAffiliations: p.agencyMemberships.map((m) => m.agency.displayName),
    projectSlugs: [],
    awards: p.awards,
    isVerified: p.isVerified,
    isFeatured: p.isFeatured,
    createdAt: p.createdAt.toISOString().slice(0, 10),
  };
}

const include = {
  agencyMemberships: { include: { agency: { select: { displayName: true } } } },
} as const;

// ── Query functions ───────────────────────────────────────────────────────────

export async function getAllDesigners(): Promise<Designer[]> {
  const profiles = await prisma.designerProfile.findMany({
    orderBy: { createdAt: "desc" },
    include,
  });
  return profiles.map((p) => mapProfile(p as ProfileWithAgencies));
}

export async function getDesignerBySlug(slug: string): Promise<Designer | undefined> {
  const p = await prisma.designerProfile.findUnique({ where: { slug }, include });
  return p ? mapProfile(p as ProfileWithAgencies) : undefined;
}

export async function getFilteredDesigners(filters: DesignerFilters): Promise<Designer[]> {
  const { query, specialty, availability, experience, location, sort = "newest" } = filters;

  const q = query?.trim().toLowerCase();

  const profiles = await prisma.designerProfile.findMany({
    where: {
      ...(specialty ? { primaryRoles: { has: specialty } } : {}),
      ...(availability ? { availability: availability as any } : {}),
      ...(experience ? { experienceLevel: experience as any } : {}),
      ...(location?.trim()
        ? {
            OR: [
              { locationCity: { contains: location, mode: "insensitive" } },
              { locationCountry: { contains: location, mode: "insensitive" } },
            ],
          }
        : {}),
      ...(q
        ? {
            OR: [
              { displayName: { contains: q, mode: "insensitive" } },
              { title: { contains: q, mode: "insensitive" } },
              { bio: { contains: q, mode: "insensitive" } },
              { locationCity: { contains: q, mode: "insensitive" } },
              { locationCountry: { contains: q, mode: "insensitive" } },
            ],
          }
        : {}),
    },
    orderBy:
      sort === "az"
        ? { displayName: "asc" }
        : sort === "za"
        ? { displayName: "desc" }
        : { createdAt: "desc" },
    include,
  });

  return profiles.map((p) => mapProfile(p as ProfileWithAgencies));
}

export async function getUniqueLocations(): Promise<string[]> {
  const profiles = await prisma.designerProfile.findMany({
    select: { locationCity: true },
    where: { locationCity: { not: "" } },
  });
  const cities = profiles.map((p) => p.locationCity);
  return [...new Set(cities)].sort();
}
