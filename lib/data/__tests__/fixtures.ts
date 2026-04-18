/**
 * DB-shaped test fixtures for Prisma mock data.
 * Dates are real Date objects; arrays are native (no JSON strings).
 * Used by projects.test.ts, designers.test.ts, and posts.test.ts.
 */

import type {
  Project,
  DesignerProfile,
  ProjectCredit,
  DesignerAgencyMembership,
  AgencyProfile,
  BlogPost,
  ProjectCategory,
  Availability,
  ExperienceLevel,
  ProjectStatus,
  ImageContext,
  AccountType,
  SubscriptionTier,
} from "@prisma/client";

// ── Designer profiles ─────────────────────────────────────────────────────────

export const dbDesigners: (DesignerProfile & {
  agencyMemberships: (DesignerAgencyMembership & { agency: { displayName: string } })[];
})[] = [
  {
    id: "dp1", userId: "u1", slug: "mara-lindt",
    displayName: "Mara Lindt", title: "Brand & Type Designer",
    bio: "Berlin-based brand designer.",
    avatarUrl: null, avatarColor: "#e7e5e4", initials: "ML",
    locationCity: "Berlin", locationCountry: "Germany", locationCountryCode: "DE",
    specialties: ["Branding", "Typography"], tools: ["Figma", "Glyphs"],
    availability: "available" as Availability, experienceLevel: "senior" as ExperienceLevel,
    contactEmail: "mara@studionord.com", contactWebsite: "https://maralindt.com",
    contactLinkedin: "https://linkedin.com/in/maralindt", contactInstagram: "",
    contactBehance: "", contactDribbble: "https://dribbble.com/maralindt",
    awards: ["D&AD Yellow Pencil 2025"], isVerified: false, isFeatured: false,
    acceptsPromotion: false,
    createdAt: new Date("2024-01-10"), updatedAt: new Date("2024-01-10"),
    agencyMemberships: [{ id: "m1", designerProfileId: "dp1", agencyProfileId: "ag1", role: null,
      createdAt: new Date("2024-01-10"), agency: { displayName: "Studio Nord" } }],
  },
  {
    id: "dp2", userId: "u2", slug: "felix-kwan",
    displayName: "Felix Kwan", title: "Visual Designer",
    bio: "Hong Kong-based visual designer.",
    avatarUrl: null, avatarColor: "#e4e4e7", initials: "FK",
    locationCity: "Hong Kong", locationCountry: "Hong Kong", locationCountryCode: "HK",
    specialties: ["Branding", "Web"], tools: ["Figma", "Framer"],
    availability: "freelance" as Availability, experienceLevel: "mid" as ExperienceLevel,
    contactEmail: "felix@pentagram.com", contactWebsite: "https://felixkwan.com",
    contactLinkedin: "", contactInstagram: "", contactBehance: "", contactDribbble: "",
    awards: [], isVerified: false, isFeatured: false, acceptsPromotion: false,
    createdAt: new Date("2024-02-05"), updatedAt: new Date("2024-02-05"),
    agencyMemberships: [],
  },
  {
    id: "dp3", userId: "u3", slug: "priya-sharma",
    displayName: "Priya Sharma", title: "UX Designer",
    bio: "London-based UX designer.",
    avatarUrl: null, avatarColor: "#fce7f3", initials: "PS",
    locationCity: "London", locationCountry: "United Kingdom", locationCountryCode: "GB",
    specialties: ["UX/UI", "Product"], tools: ["Figma", "Principle"],
    availability: "unavailable" as Availability, experienceLevel: "junior" as ExperienceLevel,
    contactEmail: "priya@example.com", contactWebsite: "", contactLinkedin: "",
    contactInstagram: "", contactBehance: "", contactDribbble: "",
    awards: [], isVerified: false, isFeatured: false, acceptsPromotion: false,
    createdAt: new Date("2024-03-01"), updatedAt: new Date("2024-03-01"),
    agencyMemberships: [],
  },
];

// ── Projects ──────────────────────────────────────────────────────────────────

type DBProject = Project & {
  credits: (ProjectCredit & { designerProfile: DesignerProfile | null })[];
};

export const dbProjects: DBProject[] = [
  {
    id: "proj1", slug: "helvetica-identity-system",
    title: "Helvetica Identity System",
    description: "A stripped-back rebrand.",
    body: "Long form body text.",
    thumbnailUrl: "", thumbnailColor: "#f5f5f4", galleryUrls: [],
    category: "Branding" as ProjectCategory, tags: ["Typography", "Brand Identity"],
    year: 2025, agencyName: "Studio Nord", agencyUrl: "https://studionord.com",
    sourceUrl: "https://behance.net", isFeatured: true,
    status: "approved" as ProjectStatus,
    submittedById: "u1", submittedAt: new Date("2025-11-01"),
    reviewedAt: new Date("2025-11-02"), reviewedById: "u1", rejectionReason: null,
    createdAt: new Date("2025-11-01"), updatedAt: new Date("2025-11-01"),
    credits: [{
      id: "c1", projectId: "proj1", designerProfileId: "dp1",
      creditName: "Mara Lindt", role: null, createdAt: new Date("2025-11-01"),
      designerProfile: dbDesigners[0] as DesignerProfile,
    }],
  },
  {
    id: "proj2", slug: "atlas-studio-rebrand",
    title: "Atlas Studio Rebrand",
    description: "Full identity overhaul.",
    body: "Long form body text.",
    thumbnailUrl: "", thumbnailColor: "#e4e4e7", galleryUrls: [],
    category: "Branding" as ProjectCategory, tags: ["Architecture", "Brand Identity"],
    year: 2025, agencyName: "Pentagram", agencyUrl: "", sourceUrl: "",
    isFeatured: false,
    status: "approved" as ProjectStatus,
    submittedById: "u2", submittedAt: new Date("2025-10-01"),
    reviewedAt: new Date("2025-10-02"), reviewedById: "u2", rejectionReason: null,
    createdAt: new Date("2025-10-01"), updatedAt: new Date("2025-10-01"),
    credits: [{
      id: "c2", projectId: "proj2", designerProfileId: "dp2",
      creditName: "Felix Kwan", role: null, createdAt: new Date("2025-10-01"),
      designerProfile: dbDesigners[1] as DesignerProfile,
    }],
  },
  {
    id: "proj3", slug: "mindful-app-redesign",
    title: "Mindful App Redesign",
    description: "A full UX overhaul.",
    body: "Long form body text.",
    thumbnailUrl: "", thumbnailColor: "#fce7f3", galleryUrls: [],
    category: "UX" as ProjectCategory, tags: ["App", "UX"],
    year: 2024, agencyName: "", agencyUrl: "", sourceUrl: "",
    isFeatured: false,
    status: "approved" as ProjectStatus,
    submittedById: "u3", submittedAt: new Date("2025-09-01"),
    reviewedAt: new Date("2025-09-02"), reviewedById: "u3", rejectionReason: null,
    createdAt: new Date("2025-09-01"), updatedAt: new Date("2025-09-01"),
    credits: [{
      id: "c3", projectId: "proj3", designerProfileId: "dp3",
      creditName: "Priya Sharma", role: null, createdAt: new Date("2025-09-01"),
      designerProfile: dbDesigners[2] as DesignerProfile,
    }],
  },
];

// ── Blog posts ────────────────────────────────────────────────────────────────

export const dbPosts: BlogPost[] = [
  {
    id: "post1", slug: "rise-of-editorial-branding",
    title: "The Rise of Editorial Branding in 2026",
    excerpt: "Brand identities are borrowing the visual language of print journalism.",
    category: "Branding", authorName: "Mara Lindt", authorTitle: "Brand Strategist",
    readTime: "6 min read", featured: true,
    body: "There's a quiet revolution happening in brand identity.",
    publishedAt: new Date("2026-01-14"), createdAt: new Date("2026-01-14"),
  },
  {
    id: "post2", slug: "ux-case-study-wins-clients",
    title: "How to Structure a Case Study That Wins Clients",
    excerpt: "Most UX case studies bury the most important parts.",
    category: "UX", authorName: "Priya Sharma", authorTitle: "UX Lead",
    readTime: "5 min read", featured: false,
    body: "A clear narrative arc does more than any polished mockup.",
    publishedAt: new Date("2026-01-07"), createdAt: new Date("2026-01-07"),
  },
  {
    id: "post3", slug: "typography-systems-product-design",
    title: "Typography Systems in Product Design",
    excerpt: "A well-chosen type scale is the backbone of a consistent UI.",
    category: "Typography", authorName: "Felix Kwan", authorTitle: "Visual Designer",
    readTime: "7 min read", featured: true,
    body: "Typography is the foundation of good design.",
    publishedAt: new Date("2025-12-20"), createdAt: new Date("2025-12-20"),
  },
];
