import { prisma } from "@/lib/prisma";
import type { DesignerProfile as PrismaProfile, Availability, ExperienceLevel } from "@prisma/client";

// ── Public types ──────────────────────────────────────────────────────────────

export type { Availability, ExperienceLevel };
export type Specialty = string; // open string in DB; constants below for UI
export type DesignerSort = "az" | "za" | "newest";

export interface DesignerContact {
  email:     string;
  website:   string;
  linkedin:  string;
  instagram: string;
  behance:   string;
  dribbble:  string;
}

export interface DesignerLocation {
  city:        string;
  country:     string;
  countryCode: string;
}

export interface Designer {
  id:                 string;
  slug:               string;
  name:               string;
  title:              string;
  bio:                string;
  avatarColor:        string;
  avatarUrl:          string | null;
  initials:           string;
  location:           DesignerLocation;
  specialties:        string[];
  tools:              string[];
  availability:       Availability;
  experienceLevel:    ExperienceLevel;
  contact:            DesignerContact;
  agencyAffiliations: string[];
  projectSlugs:       string[];
  awards:             string[];
  isVerified:         boolean;
  isFeatured:         boolean;
  createdAt:          string;
}

export interface DesignerFilters {
  query?:        string | null;
  specialty?:    string | null;
  availability?: Availability | null;
  experience?:   ExperienceLevel | null;
  location?:     string | null;
  sort?:         DesignerSort;
}

// ── Constants ─────────────────────────────────────────────────────────────────

export const ALL_SPECIALTIES: Specialty[] = [
  "Branding", "UX/UI", "Motion", "Web",
  "Print", "Product", "Illustration", "Typography",
];

export const AVAILABILITY_LABELS: Record<Availability, string> = {
  available:   "Available",
  freelance:   "Open to freelance",
  unavailable: "Not available",
};

export const EXPERIENCE_LABELS: Record<ExperienceLevel, string> = {
  junior: "Junior",
  mid:    "Mid-level",
  senior: "Senior",
};

// ── Mapper ────────────────────────────────────────────────────────────────────

type DBProfile = PrismaProfile & {
  agencyMemberships: { agency: { displayName: string } }[];
};

function toDesigner(d: DBProfile, projectSlugs: string[] = []): Designer {
  return {
    id:          d.id,
    slug:        d.slug,
    name:        d.displayName,
    title:       d.title,
    bio:         d.bio,
    avatarColor: d.avatarColor,
    avatarUrl:   d.avatarUrl,
    initials:    d.initials,
    location: {
      city:        d.locationCity,
      country:     d.locationCountry,
      countryCode: d.locationCountryCode,
    },
    specialties:        d.specialties,
    tools:              d.tools,
    availability:       d.availability,
    experienceLevel:    d.experienceLevel,
    contact: {
      email:     d.contactEmail,
      website:   d.contactWebsite,
      linkedin:  d.contactLinkedin,
      instagram: d.contactInstagram,
      behance:   d.contactBehance,
      dribbble:  d.contactDribbble,
    },
    agencyAffiliations: d.agencyMemberships.map((m) => m.agency.displayName),
    projectSlugs,
    awards:      d.awards,
    isVerified:  d.isVerified,
    isFeatured:  d.isFeatured,
    createdAt:   d.createdAt.toISOString().slice(0, 10),
  };
}

// Shared include for all queries
const withAgencies = {
  agencyMemberships: { include: { agency: { select: { displayName: true } } } },
} as const;

// ── Query functions ───────────────────────────────────────────────────────────

export async function getAllDesigners(): Promise<Designer[]> {
  const rows = await prisma.designerProfile.findMany({
    include: withAgencies,
    orderBy: { createdAt: "desc" },
  });
  return rows.map((r) => toDesigner(r));
}

export async function getDesignerBySlug(slug: string): Promise<Designer | undefined> {
  const row = await prisma.designerProfile.findUnique({
    where:   { slug },
    include: {
      ...withAgencies,
      projectCredits: {
        where:   { project: { status: "approved" } },
        include: { project: { select: { slug: true } } },
      },
    },
  });
  if (!row) return undefined;
  const projectSlugs = row.projectCredits.map((c) => c.project.slug);
  return toDesigner(row, projectSlugs);
}

export async function getFilteredDesigners(
  filters: DesignerFilters
): Promise<Designer[]> {
  const {
    query,
    specialty,
    availability,
    experience,
    location,
    sort = "newest",
  } = filters;

  const rows = await prisma.designerProfile.findMany({
    where: {
      ...(availability ? { availability } : {}),
      ...(experience   ? { experienceLevel: experience } : {}),
      ...(specialty    ? { specialties: { has: specialty } } : {}),
      ...(location?.trim()
        ? {
            OR: [
              { locationCity:    { contains: location, mode: "insensitive" } },
              { locationCountry: { contains: location, mode: "insensitive" } },
            ],
          }
        : {}),
      ...(query?.trim()
        ? {
            OR: [
              { displayName: { contains: query, mode: "insensitive" } },
              { title:       { contains: query, mode: "insensitive" } },
              { bio:         { contains: query, mode: "insensitive" } },
              { locationCity:    { contains: query, mode: "insensitive" } },
              { locationCountry: { contains: query, mode: "insensitive" } },
            ],
          }
        : {}),
    },
    include: withAgencies,
    orderBy:
      sort === "az" ? { displayName: "asc" }
      : sort === "za" ? { displayName: "desc" }
      : { createdAt: "desc" },
  });

  // Specialty + tool text-search can't easily use `has` for the query path,
  // so filter in JS for the query string only when a text query is present.
  if (query?.trim()) {
    const q = query.toLowerCase();
    return rows
      .filter(
        (d) =>
          d.displayName.toLowerCase().includes(q) ||
          d.title.toLowerCase().includes(q) ||
          d.bio.toLowerCase().includes(q) ||
          d.locationCity.toLowerCase().includes(q) ||
          d.locationCountry.toLowerCase().includes(q) ||
          d.specialties.some((s) => s.toLowerCase().includes(q)) ||
          d.tools.some((t) => t.toLowerCase().includes(q)) ||
          d.agencyMemberships.some((m) =>
            m.agency.displayName.toLowerCase().includes(q)
          )
      )
      .map((r) => toDesigner(r));
  }

  return rows.map((r) => toDesigner(r));
}

export async function getUniqueLocations(): Promise<string[]> {
  const rows = await prisma.designerProfile.findMany({
    select:  { locationCity: true },
    distinct: ["locationCity"],
    orderBy: { locationCity: "asc" },
    where:   { locationCity: { not: "" } },
  });
  return rows.map((r) => r.locationCity);
}
