# Design Directory

A polished, editorial design showcase — browse credited design projects, discover talented designers by location and specialty, and read articles on design craft.

---

## What it does

**For visitors:**
- Browse a filterable grid of design projects across six categories (Branding, Web, Motion, Print, Product, UX)
- Read full project case studies with credits, tools, and agency info
- Find designers by name, specialty, availability, experience level, and location
- Read a blog covering branding, UX, typography, motion, and process

**For designers:**
- Dedicated profile pages with portfolio, bio, skills, contact links, and awards
- Projects link back to the designer who made them

---

## Tech stack

| Layer | Choice |
|---|---|
| Framework | Next.js 16.2.3 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS v4 |
| Components | shadcn/ui + Base UI |
| Font | Geist Sans / Geist Mono |
| Icons | Lucide React |
| Data (dev) | JSON flat files (`data/`) |
| ORM (prod) | Prisma — SQLite (dev) / PostgreSQL (prod) |
| Deployment | Vercel |

---

## Running locally

**Prerequisites:** Node.js 18+, npm

```bash
# Install dependencies
npm install

# Start the dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Other commands

```bash
npm run build        # Production build
npm run start        # Serve the production build
npm run lint         # ESLint
npm test             # Vitest unit tests (run once)
npm run test:watch   # Vitest in watch mode

# Database (only needed when switching to Prisma)
npm run db:migrate   # Run pending migrations
npm run db:seed      # Seed the database from data/ JSON files
npm run db:studio    # Open Prisma Studio
npm run db:reset     # Drop and re-seed (destructive)
```

---

## Page structure

| Route | Type | Description |
|---|---|---|
| `/` | Static | Landing page — hero, about, services, blog preview |
| `/projects` | Dynamic | Filterable project feed (category + sort via search params) |
| `/projects/[slug]` | SSG | Project detail — hero, body, credits block, related projects |
| `/designers` | Dynamic | Searchable designer directory with sidebar filters |
| `/designers/[slug]` | SSG | Designer profile — bio, portfolio gallery, skills, contact |
| `/blog` | Static | Blog index with featured post and article grid |
| `/blog/[slug]` | SSG | Blog post — article body, author byline, related posts |

**Static** — fully pre-rendered at build time.  
**SSG** — pre-rendered for every slug via `generateStaticParams`.  
**Dynamic** — server-rendered on demand (reads `searchParams` for filtering/search).

---

## Seed data

The `data/` directory contains JSON used in development. No database is required to run locally.

| File | Records |
|---|---|
| `data/projects.json` | 16 design projects |
| `data/designers.json` | 20 designer profiles |
| `data/posts.json` | 8 blog posts |

---

## Folder structure

```
design-directory/
├── app/                    # Next.js App Router pages
│   ├── layout.tsx          # Root layout (SiteHeader + SiteFooter)
│   ├── page.tsx            # Landing page (/)
│   ├── projects/           # /projects + /projects/[slug]
│   ├── designers/          # /designers + /designers/[slug]
│   └── blog/               # /blog + /blog/[slug]
├── components/
│   ├── layout/             # SiteHeader, SiteFooter, PageWrapper
│   ├── landing/            # HeroSection, AboutSection, ServicesSection, BlogPreviewSection
│   ├── projects/           # ProjectCard, ProjectGrid, ProjectFilters, CreditsBlock, etc.
│   ├── designers/          # DesignerCard, DesignerGrid, SearchBar, FilterPanel, etc.
│   ├── blog/               # BlogCard, BlogGrid, AuthorByline
│   └── ui/                 # shadcn/ui primitives
├── lib/
│   ├── data/               # Data access layer — projects.ts, designers.ts, posts.ts
│   │   └── __tests__/      # Vitest unit tests
│   ├── __tests__/          # Vitest unit tests for utils
│   ├── prisma.ts           # Prisma client singleton
│   └── utils.ts            # cn() class-merge utility
├── data/                   # JSON seed data
├── prisma/
│   └── schema.prisma       # Prisma schema (SQLite dev / PostgreSQL prod)
└── public/                 # Static assets
```
