import { PrismaClient } from "@prisma/client";
import designersData from "../data/designers.json";
import projectsData from "../data/projects.json";
import postsData from "../data/posts.json";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱  Seeding database…");

  // ── Designers ──────────────────────────────────────────────
  console.log(`  → Seeding ${designersData.length} designers`);
  for (const d of designersData) {
    await prisma.designer.upsert({
      where: { slug: d.slug },
      update: {},
      create: {
        slug:                d.slug,
        name:                d.name,
        title:               d.title,
        bio:                 d.bio,
        avatarColor:         d.avatarColor,
        initials:            d.initials,
        locationCity:        d.location.city,
        locationCountry:     d.location.country,
        locationCountryCode: d.location.countryCode,
        availability:        d.availability,
        experienceLevel:     d.experienceLevel,
        contactEmail:        d.contact.email        ?? "",
        contactWebsite:      d.contact.website      ?? "",
        contactLinkedin:     d.contact.linkedin     ?? "",
        contactInstagram:    d.contact.instagram    ?? "",
        contactBehance:      d.contact.behance      ?? "",
        contactDribbble:     d.contact.dribbble     ?? "",
        specialties:         JSON.stringify(d.specialties),
        tools:               JSON.stringify(d.tools),
        agencyAffiliations:  JSON.stringify(d.agencyAffiliations),
        awards:              JSON.stringify(d.awards),
        createdAt:           new Date(d.createdAt),
      },
    });
  }

  // ── Projects ───────────────────────────────────────────────
  console.log(`  → Seeding ${projectsData.length} projects`);
  for (const p of projectsData) {
    const designer = await prisma.designer.findUnique({
      where: { slug: p.designer.slug },
    });
    if (!designer) {
      console.warn(`    ⚠  Designer not found for project "${p.slug}" — skipping`);
      continue;
    }

    await prisma.project.upsert({
      where: { slug: p.slug },
      update: {},
      create: {
        slug:           p.slug,
        title:          p.title,
        description:    p.description,
        body:           p.body,
        thumbnailColor: p.thumbnailColor,
        category:       p.category,
        tags:           JSON.stringify(p.tags),
        year:           p.year,
        agencyName:     p.agencyName   ?? "",
        agencyUrl:      p.agencyUrl    ?? "",
        sourceUrl:      p.sourceUrl    ?? "",
        featured:       p.featured,
        createdAt:      new Date(p.createdAt),
        designerId:     designer.id,
      },
    });
  }

  // ── Blog posts ─────────────────────────────────────────────
  console.log(`  → Seeding ${postsData.length} blog posts`);
  for (const post of postsData) {
    await prisma.blogPost.upsert({
      where: { slug: post.slug },
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

  console.log("✅  Seed complete");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
