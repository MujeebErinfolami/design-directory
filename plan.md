# Design Directory — Project Plan

## 1. Project Goals

Build a polished, modern design directory website that serves two audiences:

- **Visitors** discovering inspiring design projects, browsing by category or style, and finding credited designers and agencies.
- **Clients & collaborators** searching for designers by location, reviewing portfolio work, and reaching out via contact info.

Secondary goal: establish the platform itself as a credible design resource with an editorial landing page (Home, About, Services, Blog).

---

## 2. Tech Stack

| Layer | Choice | Reason |
|---|---|---|
| Framework | Next.js 15 (App Router) | SSR/SSG, file-based routing, API routes |
| Language | TypeScript | Type safety across components and data models |
| Styling | Tailwind CSS v4 | Utility-first, fast iteration, consistent tokens |
| Components | shadcn/ui | Accessible, unstyled-base components |
| Data (dev) | JSON flat files or SQLite via Prisma | Zero-config local data |
| Data (prod) | PostgreSQL via Prisma ORM | Relational: projects ↔ designers ↔ agencies |
| Search | Algolia (or Next.js route handlers + DB query) | Instant, typo-tolerant designer/project search |
| Image hosting | Cloudinary or Vercel Blob | Responsive images for project thumbnails |
| Deployment | Vercel | Native Next.js support, edge functions |

---

## 3. Site Map

```
/                          ← Landing page (Home, About, Services, Blog sections)
/projects                  ← Project discovery feed
/projects/[slug]           ← Single project detail page
/designers                 ← Designer search + directory listing
/designers/[slug]          ← Designer profile page
/blog                      ← Blog index
/blog/[slug]               ← Blog post
/about                     ← Standalone About page (optional deep-link)
/services                  ← Standalone Services page (optional deep-link)
```

---

## 4. Page-by-Page Breakdown

### 4.1 Landing Page (`/`)

A single long-form marketing page with four named sections, each anchor-linked from the nav.

**Sections:**

| Section | Content |
|---|---|
| `#home` (Hero) | Bold headline, tagline, CTA buttons ("Browse Projects", "Find a Designer"), background image or motion graphic |
| `#about` | Mission statement, what the directory is, who it's for, team/founder blurb |
| `#services` | Cards describing what the platform offers (project submissions, designer profiles, featured placements, partnerships) |
| `#blog` | Latest 3 blog post cards with title, excerpt, date, read-more link |

---

### 4.2 Projects Feed (`/projects`)

A browsable, filterable grid of design projects.

**Features:**
- Masonry or uniform-card grid layout
- Filter sidebar / top bar:
  - Category (Branding, Web, Motion, Print, Product, UX)
  - Industry / sector tag
  - Sort by: Newest, Most Viewed, Featured
- Each project card shows:
  - Thumbnail image
  - Project title
  - Designer name + avatar
  - Agency name (linked)
  - Category tags
  - Source link icon (external)
- Pagination or infinite scroll
- Featured/promoted project slots (pinned to top)

---

### 4.3 Project Detail (`/projects/[slug]`)

**Content:**
- Full-width hero image or image gallery carousel
- Project title and short description
- Credits block:
  - Designer name + link to profile
  - Agency name + external URL
  - Year, category, tools used
  - Source / live URL
- Long-form write-up / case study body (rich text)
- Related projects (3–4 cards, same category)
- CTA: "View Designer's Profile"

---

### 4.4 Designer Search (`/designers`)

The primary discovery tool for finding designers.

**Features:**
- Search bar (name, skill, keyword) with debounce
- Filter panel:
  - Location (City, Country — typeahead)
  - Specialty (UI/UX, Branding, Motion, Illustration, etc.)
  - Availability (Available, Open to freelance, Not available)
  - Experience level (Junior, Mid, Senior)
- Results grid of Designer Cards
- Map view toggle (optional, Phase 2)
- Sorting: A–Z, Location, Recently Active

---

### 4.5 Designer Profile (`/designers/[slug]`)

**Content:**
- Hero: avatar, name, title/role, location, availability badge
- Contact info: email (obfuscated/mailto), website, LinkedIn, Instagram, Behance, Dribbble links
- Short bio / about
- Portfolio gallery: grid of project thumbnails (links to `/projects/[slug]` if listed, or external)
- Skills / tools list (tag chips)
- Agency affiliation(s)
- Awards or recognition (optional)
- "Get in touch" CTA button

---

### 4.6 Blog Index (`/blog`)

- Grid of BlogCards: cover image, title, category, author, date, excerpt
- Category filter tabs
- Pagination

### 4.7 Blog Post (`/blog/[slug]`)

- Rich text body (MDX or CMS-driven)
- Author byline with avatar
- Related posts
- Social share buttons

---

## 5. Component Library

### Layout
- `<SiteHeader>` — logo, nav links (Home, Projects, Designers, Blog), CTA button ("Submit Project")
- `<SiteFooter>` — logo, nav links, social icons, copyright
- `<PageWrapper>` — max-width container with consistent padding

### Landing Page
- `<HeroSection>` — headline, subtext, dual CTA buttons, background media
- `<AboutSection>` — two-column text + image
- `<ServicesSection>` — icon cards grid
- `<BlogPreviewSection>` — horizontal scroll or 3-column grid of recent posts

### Projects
- `<ProjectCard>` — thumbnail, title, designer credit, agency, tags, external link icon
- `<ProjectGrid>` — responsive masonry/grid layout
- `<ProjectFilters>` — category pills + sort dropdown
- `<ProjectHero>` — full-width image/carousel for detail page
- `<CreditsBlock>` — structured display of designer, agency, year, tools
- `<RelatedProjects>` — horizontal card row

### Designers
- `<DesignerCard>` — avatar, name, location, specialty tags, availability badge
- `<DesignerGrid>` — responsive grid layout
- `<SearchBar>` — input with debounce + clear button
- `<FilterPanel>` — collapsible sidebar: location typeahead, specialty checkboxes, availability radio, experience select
- `<PortfolioGallery>` — responsive masonry grid of work thumbnails
- `<ContactBlock>` — email link, social icon row, website button
- `<SkillTags>` — chip list of tools/skills

### Blog
- `<BlogCard>` — cover image, meta, title, excerpt, read-more link
- `<BlogGrid>` — responsive grid
- `<BlogPost>` — MDX renderer with heading anchors, code blocks, callouts
- `<AuthorByline>` — avatar, name, date

### Shared / Utility
- `<Badge>` — category/tag chip (reused across cards)
- `<Avatar>` — rounded image with fallback initials
- `<ExternalLink>` — icon + accessible label wrapper
- `<Pagination>` — prev/next + page numbers
- `<EmptyState>` — illustration + message for zero search results
- `<LoadingSpinner>` / `<SkeletonCard>` — loading states

---

## 6. Data Models

### Project
```ts
{
  id: string
  slug: string
  title: string
  description: string          // short
  body: string                 // rich text / MDX
  thumbnail: string            // image URL
  images: string[]             // gallery
  category: Category
  tags: string[]
  year: number
  designerId: string           // FK → Designer
  agencyName: string
  agencyUrl: string
  sourceUrl: string
  featured: boolean
  createdAt: Date
}
```

### Designer
```ts
{
  id: string
  slug: string
  name: string
  title: string
  bio: string
  avatar: string
  location: {
    city: string
    country: string
    countryCode: string
  }
  specialties: string[]
  tools: string[]
  availability: 'available' | 'freelance' | 'unavailable'
  experienceLevel: 'junior' | 'mid' | 'senior'
  contact: {
    email: string
    website: string
    linkedin: string
    instagram: string
    behance: string
    dribbble: string
  }
  agencyAffiliations: string[]
  projectIds: string[]         // FK → Project[]
  createdAt: Date
}
```

### BlogPost
```ts
{
  id: string
  slug: string
  title: string
  excerpt: string
  body: string                 // MDX
  coverImage: string
  category: string
  author: string
  publishedAt: Date
}
```

---

## 7. Design Considerations

### Visual Language
- Clean, editorial aesthetic — lots of white space, strong typographic hierarchy
- Neutral base palette (white, near-black, warm gray) with a single accent color (e.g., coral, electric blue, or ink)
- System font stack or a single variable font (e.g., Inter or Geist) for performance
- Generous imagery: design work is the product, images must be prominent

### Responsive Design
- Mobile-first grid: 1 col → 2 col → 3–4 col
- Filter panel collapses to a bottom drawer on mobile
- Project cards maintain 16:9 or 4:3 aspect ratios regardless of screen width
- Touch-friendly tap targets (min 44px)

### Performance
- Next.js `<Image>` with lazy loading and srcset for all project/designer imagery
- Static generation (SSG) for project and designer detail pages
- Incremental Static Regeneration (ISR) for feed pages (revalidate every 60s)
- Debounced search input (300ms) to reduce API calls

### Accessibility
- Semantic HTML: `<main>`, `<nav>`, `<article>`, `<section>` with aria-labels
- Focus-visible ring on all interactive elements
- Color contrast AA minimum throughout
- All images have descriptive alt text
- Filter state announced to screen readers via aria-live

### SEO
- Dynamic `<title>` and `<meta description>` per page (Next.js Metadata API)
- Open Graph images for project and designer pages
- Sitemap.xml generated via `next-sitemap`
- Structured data (Schema.org `Person`, `CreativeWork`) on detail pages

---

## 8. Step-by-Step Build Order

### Phase 1 — Foundation
1. Scaffold Next.js 15 project with TypeScript and Tailwind CSS v4
2. Install and configure shadcn/ui
3. Set up folder structure: `/app`, `/components`, `/lib`, `/data`, `/public`
4. Create `<SiteHeader>` and `<SiteFooter>` with responsive nav
5. Create `<PageWrapper>` layout shell

### Phase 2 — Landing Page
6. Build `<HeroSection>` with CTA buttons
7. Build `<AboutSection>` with two-column layout
8. Build `<ServicesSection>` with icon cards
9. Build `<BlogPreviewSection>` with placeholder cards
10. Wire all sections into `/` with anchor nav links

### Phase 3 — Project Discovery
11. Define Project data model; add seed JSON data (10–20 sample projects)
12. Build `<ProjectCard>` component
13. Build `<ProjectGrid>` with responsive layout
14. Build `<ProjectFilters>` (category pills, sort)
15. Wire `/projects` page with filter state and project grid
16. Build `<CreditsBlock>`, `<ProjectHero>`, `<RelatedProjects>`
17. Wire `/projects/[slug]` detail page

### Phase 4 — Designer Search
18. Define Designer data model; add seed JSON data (15–25 sample designers)
19. Build `<DesignerCard>` component
20. Build `<SearchBar>` with debounce
21. Build `<FilterPanel>` (location typeahead, specialty, availability, experience)
22. Wire `/designers` page with search + filter state
23. Build `<PortfolioGallery>`, `<ContactBlock>`, `<SkillTags>`
24. Wire `/designers/[slug]` profile page

### Phase 5 — Blog
25. Set up MDX rendering (next-mdx-remote or @next/mdx)
26. Add sample blog posts as `.mdx` files in `/content/blog`
27. Build `<BlogCard>` and `<BlogGrid>`
28. Wire `/blog` index page
29. Build `<BlogPost>` MDX renderer and `<AuthorByline>`
30. Wire `/blog/[slug]` detail page

### Phase 6 — Polish & SEO
31. Add Next.js Metadata API to all pages (title, description, OG)
32. Generate `sitemap.xml` via next-sitemap
33. Add Schema.org structured data to project and designer detail pages
34. Audit accessibility (keyboard nav, contrast, aria)
35. Optimize all images with Next.js `<Image>` and blur placeholders
36. Add loading skeletons (`<SkeletonCard>`) for async data pages
37. Add `<EmptyState>` for zero search results

### Phase 7 — Data & Backend (if dynamic)
38. Set up Prisma with PostgreSQL (or SQLite for dev)
39. Migrate seed JSON data to DB
40. Replace static data fetches with Prisma queries in server components
41. Add Next.js route handlers for search API endpoint
42. (Optional) Integrate Algolia for full-text search

### Phase 8 — Deployment
43. Connect to Vercel; configure environment variables
44. Set up Vercel Blob or Cloudinary for image uploads
45. Configure ISR revalidation on feed pages
46. Final QA: cross-browser, mobile, Lighthouse audit

---

## 9. File / Folder Structure

```
design-directory/
├── app/
│   ├── layout.tsx              # Root layout (Header + Footer)
│   ├── page.tsx                # Landing page
│   ├── projects/
│   │   ├── page.tsx            # Project feed
│   │   └── [slug]/page.tsx     # Project detail
│   ├── designers/
│   │   ├── page.tsx            # Designer search
│   │   └── [slug]/page.tsx     # Designer profile
│   ├── blog/
│   │   ├── page.tsx            # Blog index
│   │   └── [slug]/page.tsx     # Blog post
│   └── api/
│       └── designers/route.ts  # Search API endpoint
├── components/
│   ├── layout/
│   │   ├── SiteHeader.tsx
│   │   ├── SiteFooter.tsx
│   │   └── PageWrapper.tsx
│   ├── landing/
│   │   ├── HeroSection.tsx
│   │   ├── AboutSection.tsx
│   │   ├── ServicesSection.tsx
│   │   └── BlogPreviewSection.tsx
│   ├── projects/
│   │   ├── ProjectCard.tsx
│   │   ├── ProjectGrid.tsx
│   │   ├── ProjectFilters.tsx
│   │   ├── ProjectHero.tsx
│   │   ├── CreditsBlock.tsx
│   │   └── RelatedProjects.tsx
│   ├── designers/
│   │   ├── DesignerCard.tsx
│   │   ├── DesignerGrid.tsx
│   │   ├── SearchBar.tsx
│   │   ├── FilterPanel.tsx
│   │   ├── PortfolioGallery.tsx
│   │   ├── ContactBlock.tsx
│   │   └── SkillTags.tsx
│   ├── blog/
│   │   ├── BlogCard.tsx
│   │   ├── BlogGrid.tsx
│   │   ├── BlogPost.tsx
│   │   └── AuthorByline.tsx
│   └── ui/
│       ├── Badge.tsx
│       ├── Avatar.tsx
│       ├── ExternalLink.tsx
│       ├── Pagination.tsx
│       ├── EmptyState.tsx
│       └── SkeletonCard.tsx
├── lib/
│   ├── data/
│   │   ├── projects.ts         # Data access layer
│   │   └── designers.ts
│   └── utils.ts
├── content/
│   └── blog/
│       └── *.mdx               # Blog post files
├── data/
│   ├── projects.json           # Seed data
│   └── designers.json
├── public/
│   └── images/
├── prisma/
│   └── schema.prisma
├── tailwind.config.ts
├── next.config.ts
└── plan.md
```

---

## 10. Success Metrics

- Lighthouse score ≥ 90 on Performance, Accessibility, SEO
- Designer search returns results in < 300ms
- Mobile layout passes visual QA on iOS Safari and Android Chrome
- All project cards link correctly to detail pages with full credits
- Designer profiles show working contact links and portfolio images
