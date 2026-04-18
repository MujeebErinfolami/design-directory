@AGENTS.md

# Design Directory — Claude Code Context

## What this project is

A Next.js App Router website for discovering design projects and finding designers. It is editorial in aesthetic — lots of whitespace, Geist font, neutral palette. The site has three content pillars: Projects, Designers, Blog.

---

## Tech stack

| Layer | Detail |
|---|---|
| Framework | Next.js **16.2.3** (App Router) — read `node_modules/next/dist/docs/` before touching routing, params, or metadata APIs |
| Language | TypeScript (strict mode) |
| Styling | Tailwind CSS **v4** — config is in `postcss.config.js`, no `tailwind.config.ts` |
| Components | shadcn/ui (`components/ui/`) + Base UI (`@base-ui/react`) |
| Icons | Lucide React |
| Font | Geist Sans + Geist Mono via `next/font/google` |
| Data (current) | JSON flat files in `data/` — no database needed to run locally |
| ORM (wired, not active) | Prisma — `prisma/schema.prisma` exists, client in `lib/prisma.ts`, but pages still read from JSON |
| Path alias | `@/` maps to the project root (e.g. `@/components/...`, `@/lib/...`) |
| Tests | Vitest — run with `npm test`; config in `vitest.config.mts` |

---

## Critical Next.js 16 API notes

**`params` and `searchParams` are Promises.** In this version of Next.js, page props use async params:

```ts
// Correct
interface PageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ q?: string }>;
}
export default async function Page({ params, searchParams }: PageProps) {
  const { slug } = await params;
  const { q } = await searchParams;
}
```

**`generateStaticParams`** works the same as before — return an array of param objects.

**`generateMetadata`** receives the same async `params` — always `await params` before using.

---

## Project architecture

### Rendering strategy

| Route | Strategy | Reason |
|---|---|---|
| `/` | Static | No dynamic data |
| `/blog` | Static | No dynamic data |
| `/projects/[slug]` | SSG (`generateStaticParams`) | Pre-rendered per slug |
| `/designers/[slug]` | SSG (`generateStaticParams`) | Pre-rendered per slug |
| `/blog/[slug]` | SSG (`generateStaticParams`) | Pre-rendered per slug |
| `/projects` | Dynamic (server) | Reads `searchParams` for category + sort filters |
| `/designers` | Dynamic (server) | Reads `searchParams` for search query + filters |

### Data flow

```
data/*.json  →  lib/data/*.ts  →  app/**/page.tsx  →  components/
```

The data layer (`lib/data/`) exports async functions. They currently read from JSON but are shaped for a future Prisma drop-in — all return `Promise<T>`. Do not make these functions synchronous.

### Component boundaries

- All page files (`app/**/page.tsx`) are **Server Components** — no `"use client"`.
- `SiteHeader` is `"use client"` — it uses `usePathname` and `useState` for the mobile drawer.
- Filter/search components (`SearchBar`, `FilterPanel`, `ProjectFilters`) are `"use client"` — they use `useRouter`/`useSearchParams` to push URL state.
- Everything else is a Server Component unless it explicitly needs browser APIs.

---

## Folder layout

```
app/
  layout.tsx                 Root layout — SiteHeader, SiteFooter, Geist font vars
  page.tsx                   Landing page (/, static)
  projects/
    page.tsx                 /projects — dynamic, reads searchParams
    [slug]/page.tsx          /projects/[slug] — SSG
  designers/
    page.tsx                 /designers — dynamic, reads searchParams
    [slug]/page.tsx          /designers/[slug] — SSG
  blog/
    page.tsx                 /blog — static
    [slug]/page.tsx          /blog/[slug] — SSG

components/
  layout/
    SiteHeader.tsx           "use client" — sticky nav, mobile drawer
    SiteFooter.tsx           Static footer
    PageWrapper.tsx          <main> with max-w-7xl and standard padding
  landing/
    HeroSection.tsx
    AboutSection.tsx
    ServicesSection.tsx
    BlogPreviewSection.tsx
  projects/
    ProjectCard.tsx          Card with thumbnailColor placeholder, category badge
    ProjectGrid.tsx          Responsive grid
    ProjectFilters.tsx       "use client" — category pills + sort dropdown
    ProjectHero.tsx          Full-bleed color hero for detail page
    CreditsBlock.tsx         Sidebar: agency, year, tools, source link
    RelatedProjects.tsx      3-card row at bottom of detail page
  designers/
    DesignerCard.tsx         Avatar (initials + avatarColor), name, location, availability
    DesignerGrid.tsx         Responsive grid
    SearchBar.tsx            "use client" — debounced query + sort
    FilterPanel.tsx          "use client" — specialty, availability, experience checkboxes
    PortfolioGallery.tsx     Grid of project thumbnails on profile page
    ContactBlock.tsx         Email, website, LinkedIn, Instagram, Behance, Dribbble
    SkillTags.tsx            Specialty + tools chip list
  blog/
    BlogCard.tsx             Cover color, category badge, title, excerpt, author, date
    BlogGrid.tsx             Responsive grid
    AuthorByline.tsx         Author name/title + date + read time

lib/
  data/
    projects.ts              getAllProjects, getProjectBySlug, getFilteredProjects,
                             getRelatedProjects, getFeaturedProjects, getProjectsByDesignerSlug
    designers.ts             getAllDesigners, getDesignerBySlug, getFilteredDesigners,
                             getUniqueLocations
    posts.ts                 getAllPosts, getPostBySlug, getFeaturedPosts, getRelatedPosts,
                             formatPostDate, CATEGORY_STYLES
    __tests__/               Vitest tests for all three modules
  __tests__/                 Vitest tests for utils.ts
  prisma.ts                  Prisma client singleton (not used by pages yet)
  utils.ts                   cn() — clsx + tailwind-merge

data/
  projects.json              16 projects
  designers.json             20 designers
  posts.json                 8 blog posts

prisma/
  schema.prisma              Designer, Project, BlogPost models — SQLite for dev
```

---

## Data models

### Project (`data/projects.json`)

```ts
{
  id: string              // "p1", "p2", …
  slug: string            // URL slug, e.g. "helvetica-identity-system"
  title: string
  description: string     // 1-2 sentence summary
  body: string            // Long-form copy; paragraphs separated by \n\n
  thumbnailColor: string  // CSS hex — used as placeholder background
  category: "Branding" | "Web" | "Motion" | "Print" | "Product" | "UX"
  tags: string[]
  year: number
  designer: { id, name, slug, initials }
  agencyName: string
  agencyUrl: string
  sourceUrl: string
  featured: boolean
  createdAt: string       // ISO date "YYYY-MM-DD"
}
```

### Designer (`data/designers.json`)

```ts
{
  id: string
  slug: string
  name: string
  title: string           // Role, e.g. "Brand & Type Designer"
  bio: string             // Multi-paragraph; split on \n\n if needed
  avatarColor: string     // CSS hex for avatar background
  initials: string        // 2-letter fallback for avatar image
  location: { city, country, countryCode }
  specialties: Specialty[]   // See ALL_SPECIALTIES in lib/data/designers.ts
  tools: string[]
  availability: "available" | "freelance" | "unavailable"
  experienceLevel: "junior" | "mid" | "senior"
  contact: { email, website, linkedin, instagram, behance, dribbble }
  agencyAffiliations: string[]
  projectSlugs: string[]  // References into projects.json
  awards: string[]
  createdAt: string
}
```

### Post (`data/posts.json`)

```ts
{
  slug: string
  title: string
  excerpt: string
  category: string        // Keys match CATEGORY_STYLES in lib/data/posts.ts
  author: { name, title }
  date: string            // ISO "YYYY-MM-DD"
  readTime: string        // e.g. "6 min read"
  featured: boolean
  body: string            // Paragraphs separated by \n\n
}
```

---

## Prisma schema (not active)

`prisma/schema.prisma` defines the same three models. SQLite arrays (specialties, tools, etc.) are stored as JSON strings because SQLite has no native array type. The seed script (`prisma/seed.ts`) should parse these back to arrays when reading.

The env var `DATABASE_URL` must be set to activate Prisma. Until then, all pages read from JSON.

---

## Styling conventions

- Tailwind v4 — utility classes only, no `@apply` unless unavoidable.
- Color tokens: `bg-background`, `text-foreground`, `text-muted-foreground`, `border-border` — these are CSS variables defined in `app/globals.css`.
- `cn()` from `lib/utils.ts` for conditional/merged class names.
- `PageWrapper` wraps all `<main>` content: `max-w-7xl`, responsive horizontal padding, `py-12 md:py-16`.
- Availability badge colors: emerald = available, amber = freelance, zinc = unavailable.

---

## Testing

Unit tests live alongside the source in `__tests__/` subdirectories:

```
lib/data/__tests__/projects.test.ts    16 tests
lib/data/__tests__/designers.test.ts   17 tests
lib/data/__tests__/posts.test.ts       13 tests
lib/__tests__/utils.test.ts             5 tests
```

Run with `npm test` (single pass) or `npm run test:watch`. Config: `vitest.config.mts`.

---

## Important notes for future sessions

1. **Read the Next.js docs before writing routing code.** The docs are in `node_modules/next/dist/docs/`. This version has breaking API changes — params are async Promises, not plain objects.

2. **The data layer is async by design.** All `lib/data/` functions return `Promise<T>` even though they currently read synchronous JSON. This makes the Prisma migration a drop-in replacement.

3. **No images yet.** Projects and designers use `thumbnailColor`/`avatarColor` (CSS hex) as placeholders. When adding real images, use `next/image` with `fill` and `sizes` props. The `public/images/` directory is the intended target.

4. **Body text is plain paragraphs, not MDX.** Both project and blog post bodies are stored as plain strings with `\n\n` paragraph breaks. Pages split on `\n\n` and render `<p>` tags. There is no MDX renderer — don't add one unless explicitly requested.

5. **`/designers` search is URL-driven.** Search query, sort, and all filters are stored in the URL as search params (`?q=...&specialty=...`). The `SearchBar` and `FilterPanel` components use `useRouter` to push URL changes; the server page reads them from `searchParams`. This pattern keeps the URL shareable and back-button-friendly.

6. **Prisma is schema-ready but not wired.** The migration path is: set `DATABASE_URL`, run `npm run db:migrate`, run `npm run db:seed`, then replace the JSON reads in `lib/data/` with Prisma queries. The function signatures are identical.

7. **`SiteHeader` "Submit Project" button** currently links to `/designers`. It is a placeholder — no submission form exists yet.
