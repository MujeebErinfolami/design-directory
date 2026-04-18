/**
 * Seed script — migrates data/designers.json, data/projects.json, and
 * data/posts.json into the new PostgreSQL schema.
 *
 * Each designer gets a stub User record so DesignerProfile.userId is satisfied.
 * Projects are seeded as status:"approved" with a ProjectCredit row for the
 * credited designer.  Blog posts go straight into BlogPost.
 *
 * Run: npm run db:seed
 */

import { PrismaClient, Availability, ExperienceLevel, ProjectCategory } from "@prisma/client";
import designersData from "../data/designers.json";
import projectsData from "../data/projects.json";
import postsData from "../data/posts.json";

const prisma = new PrismaClient();

// ── Type helpers ─────────────────────────────────────────────────────────────

type JsonDesigner = (typeof designersData)[number];
type JsonProject  = (typeof projectsData)[number];
type JsonPost     = (typeof postsData)[number];

// ── Utilities ─────────────────────────────────────────────────────────────────

function toAvailability(v: string): Availability {
  if (v === "available" || v === "freelance" || v === "unavailable") return v;
  return "unavailable";
}

function toExperience(v: string): ExperienceLevel {
  if (v === "junior" || v === "mid" || v === "senior") return v;
  return "mid";
}

function toCategory(v: string): ProjectCategory {
  const valid: ProjectCategory[] = ["Branding", "Web", "Motion", "Print", "Product", "UX"];
  return valid.includes(v as ProjectCategory) ? (v as ProjectCategory) : "Branding";
}

// ── Main ──────────────────────────────────────────────────────────────────────

async function main() {
  console.log("🌱  Seeding database…\n");

  // ── 1. Designers ───────────────────────────────────────────────────────────
  // Each designer needs a stub User + DesignerProfile.
  // We use the designer's contact email as the User email (falling back to a
  // generated placeholder so the unique constraint is always satisfied).

  console.log(`  → Seeding ${designersData.length} designers`);

  const designerProfileById: Record<string, string> = {}; // json id → DesignerProfile.id

  for (const d of designersData as JsonDesigner[]) {
    const email = d.contact.email?.trim() || `seed-${d.slug}@placeholder.local`;

    // Upsert User
    const user = await prisma.user.upsert({
      where:  { email },
      update: {},
      create: {
        email,
        name:        d.name,
        accountType: "designer",
        createdAt:   new Date(d.createdAt),
        updatedAt:   new Date(d.createdAt),
      },
    });

    // Upsert DesignerProfile
    const profile = await prisma.designerProfile.upsert({
      where:  { slug: d.slug },
      update: {},
      create: {
        userId:             user.id,
        slug:               d.slug,
        displayName:        d.name,
        title:              d.title,
        bio:                d.bio,
        avatarColor:        d.avatarColor,
        initials:           d.initials,
        locationCity:       d.location.city,
        locationCountry:    d.location.country,
        locationCountryCode: d.location.countryCode,
        specialties:        d.specialties,
        tools:              d.tools,
        availability:       toAvailability(d.availability),
        experienceLevel:    toExperience(d.experienceLevel),
        contactEmail:       d.contact.email        ?? "",
        contactWebsite:     d.contact.website      ?? "",
        contactLinkedin:    d.contact.linkedin     ?? "",
        contactInstagram:   d.contact.instagram    ?? "",
        contactBehance:     d.contact.behance      ?? "",
        contactDribbble:    d.contact.dribbble     ?? "",
        awards:             d.awards,
        createdAt:          new Date(d.createdAt),
        updatedAt:          new Date(d.createdAt),
      },
    });

    designerProfileById[d.id] = profile.id;
  }

  // ── 2. Projects ────────────────────────────────────────────────────────────
  // Projects need submittedById (User.id).  We look up the User via the
  // designer's profile, then create the Project + a ProjectCredit row.

  console.log(`  → Seeding ${projectsData.length} projects`);

  for (const p of projectsData as JsonProject[]) {
    // Find the designer's profile to get their user id
    const designerProfile = await prisma.designerProfile.findUnique({
      where:   { slug: p.designer.slug },
      include: { user: true },
    });

    if (!designerProfile) {
      console.warn(`    ⚠  DesignerProfile not found for slug "${p.designer.slug}" — skipping "${p.slug}"`);
      continue;
    }

    const project = await prisma.project.upsert({
      where:  { slug: p.slug },
      update: {},
      create: {
        slug:           p.slug,
        title:          p.title,
        description:    p.description,
        body:           p.body,
        thumbnailColor: p.thumbnailColor,
        thumbnailUrl:   "",          // no images yet; colour is the fallback
        galleryUrls:    [],
        category:       toCategory(p.category),
        tags:           p.tags,
        year:           p.year,
        agencyName:     p.agencyName  ?? "",
        agencyUrl:      p.agencyUrl   ?? "",
        sourceUrl:      p.sourceUrl   ?? "",
        isFeatured:     p.featured,
        status:         "approved",  // seed data is already curated
        submittedById:  designerProfile.user.id,
        submittedAt:    new Date(p.createdAt),
        reviewedAt:     new Date(p.createdAt),
        reviewedById:   designerProfile.user.id,
        createdAt:      new Date(p.createdAt),
        updatedAt:      new Date(p.createdAt),
      },
    });

    // ProjectCredit — link the credited designer to the project
    const existingCredit = await prisma.projectCredit.findFirst({
      where: { projectId: project.id, designerProfileId: designerProfile.id },
    });
    if (!existingCredit) {
      await prisma.projectCredit.create({
        data: {
          projectId:         project.id,
          designerProfileId: designerProfile.id,
          creditName:        p.designer.name,
        },
      });
    }
  }

  // ── 3. Blog posts ──────────────────────────────────────────────────────────

  console.log(`  → Seeding ${postsData.length} blog posts`);

  for (const post of postsData as JsonPost[]) {
    await prisma.blogPost.upsert({
      where:  { slug: post.slug },
      update: {},
      create: {
        slug:        post.slug,
        title:       post.title,
        excerpt:     post.excerpt,
        body:        post.body,
        category:    post.category,
        authorName:  post.author.name,
        authorTitle: post.author.title,
        readTime:    post.readTime,
        featured:    post.featured,
        publishedAt: new Date(post.date),
        createdAt:   new Date(post.date),
      },
    });
  }

  console.log("\n✅  Seed complete");
  console.log(`    ${designersData.length} designers  |  ${projectsData.length} projects  |  ${postsData.length} posts`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
