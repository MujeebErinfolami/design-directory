# Design Directory — Web App Expansion Plan

**Prepared:** 2026-04-18  
**Scope:** Full-stack expansion from static showcase to authenticated multi-user platform

---

## Table of Contents

1. [Feature Breakdown](#1-feature-breakdown)
2. [Tech Stack](#2-tech-stack)
3. [Authentication](#3-authentication)
4. [Database Schema](#4-database-schema)
5. [API Structure](#5-api-structure)
6. [User Flows](#6-user-flows)
7. [Admin Flow](#7-admin-flow)
8. [Phased Build Order](#8-phased-build-order)
9. [Next.js 16 Breaking Changes to Know](#9-nextjs-16-breaking-changes-to-know)

---

## 1. Feature Breakdown

### 1.1 Authentication
- Google OAuth (only provider at launch)
- On first login: account type selection (Designer or Agency)
- Onboarding form to complete profile before accessing the platform
- Session stores `userId`, `accountType`, `isAdmin`
- Protected routes enforced in `proxy.ts` (Next.js 16 replacement for `middleware.ts`)

### 1.2 Designer Accounts
- Profile: display name, bio, title, location, specialty tags, tools, availability, experience level
- Avatar: direct image upload
- Portfolio: linked to submitted and approved projects on the platform
- Contact links: email, website, LinkedIn, Instagram, Behance, Dribbble
- Awards field (platform-awarded or self-declared)
- Agency membership: can join one or more agencies (shown on profile)
- Verification badge: admin-granted
- Featured flag: admin-granted, used in promoted spots (monetisation hook)

### 1.3 Agency Accounts
- Profile: studio name, bio, logo, location, team size, specialties, past clients
- Contact links: same set as designer
- Member roster: designers who have joined the agency appear on the agency page
- Project submissions under the agency name
- Verification badge and featured flag — same as designer

### 1.4 Project Submissions
- Both account types can submit
- Required fields: title, description, body, category, year, thumbnail image
- Optional fields: gallery images (up to 8), tags, agency name/URL, source URL
- Designer credits: zero or more (by platform username or free-text name)
- All submissions enter a **pending review queue** — nothing goes live without admin approval
- Submitter can edit a project while it is still pending; cannot edit after approval
- Rejected projects include an optional admin reason; submitter can resubmit after editing

### 1.5 Image Uploads
- Stored in Vercel Blob
- Client uploads directly to Blob via a server-issued token (avoids routing large files through Next.js)
- Tracked in an `Image` table for cleanup and attribution
- Accepted contexts: designer avatar, agency logo, project thumbnail, project gallery

### 1.6 Admin Controls
- Admin flag (`isAdmin: true`) on any User record — max two admins at launch
- Admin dashboard at `/admin`
  - **Review queue**: list of pending projects, preview, approve or reject with optional reason
  - **Badge assignment**: grant one or more platform-defined badges to approved projects
  - **Featured toggle**: mark a project, designer, or agency as featured
  - **Verification toggle**: grant verified status to a designer or agency profile
- Badges are a fixed enum — no free-form labels:
  - `featured` — manually curated pick
  - `editors_pick` — editorial recommendation
  - `best_of_year` — annual award

### 1.7 Live Search
- Replaces static JSON reads with Prisma queries against Neon (Postgres)
- Covers: **projects** and **designers** only (blog remains static)
- Filtering for projects: category, featured, badge type
- Filtering for designers: specialty, availability, experience level, location, verification status
- Text search: `ILIKE` across relevant string fields (name, title, bio, tags)
- Response debounced on the client (300ms) before hitting the server
- Algolia can be layered on later without changing the API contract

### 1.8 Monetisation Stubs (schema-ready, not active at launch)
- `Subscription` table: tier (`free` | `pro` | `agency`), Stripe fields, period dates
- `PromotedListing` table: entity type + id, start/end dates, placement slot
- `subscriptionTier` field on `User`
- `isFeatured` and `isVerified` flags on profiles — admin-controlled now, could be self-serve tier perks later
- No payment integration at launch; stubs exist to avoid schema migrations when monetisation is enabled

---

## 2. Tech Stack

### 2.1 Unchanged from current project
| Layer | Choice |
|---|---|
| Framework | Next.js 16.2.3 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS v4 |
| Components | shadcn/ui + Base UI |
| Icons | Lucide React |
| ORM | Prisma |

### 2.2 Added or swapped
| Layer | Choice | Reason |
|---|---|---|
| Auth | NextAuth.js v5 (Auth.js) | Recommended by Next.js 16 docs; App Router–native; Google provider built-in |
| Database | Neon (Postgres) | Replaces SQLite; Vercel-native, free tier, real Postgres feature set (arrays, enums) |
| File storage | Vercel Blob | Stays in the Vercel ecosystem; presigned direct uploads; 500 MB free tier |
| Email | Resend | Admin notification on submission; approval/rejection email to submitter; free tier 3,000 emails/month |
| Validation | Zod | Schema validation on Server Actions and route handlers; pairs well with Prisma types |

### 2.3 Why NextAuth.js v5 over alternatives
Auth.js v5 is the only library in the Next.js 16 recommended list that is fully open-source, requires zero external dashboard, and handles OAuth sessions entirely within your own database via Prisma adapter. Clerk and WorkOS are excellent but add a paid dependency. Auth0 is heavy for a two-provider launch. Auth.js v5 is the right weight for this project.

### 2.4 Why Neon over Supabase
Both are valid. Neon was chosen because it pairs cleanly with Prisma (no Supabase client needed), stays serverless-native on Vercel, and the existing Prisma schema only needs the provider swapped from `sqlite` to `postgresql`. Supabase would add a parallel client SDK and auth layer that would conflict with Auth.js.

---

## 3. Authentication

### 3.1 Library and config
```
auth.ts              NextAuth.js v5 config (Google provider + Prisma adapter)
app/api/auth/[...nextauth]/route.ts   Auth.js route handler
proxy.ts             Route protection (Next.js 16 — was middleware.ts)
```

### 3.2 Session shape
```ts
// Extended session stored in JWT + DB
interface Session {
  user: {
    id: string
    email: string
    name: string
    image: string
    accountType: "designer" | "agency" | null  // null until onboarding complete
    isAdmin: boolean
    subscriptionTier: "free" | "pro" | "agency"
  }
}
```

### 3.3 First-login onboarding gate
Auth.js v5 provides a `signIn` callback. After a successful Google sign-in:

1. Auth.js `signIn` callback upserts the `User` row (handled by Prisma adapter).
2. The session `accountType` is set to `null` if no `DesignerProfile` or `AgencyProfile` exists.
3. `proxy.ts` intercepts all non-auth, non-public routes and redirects to `/onboarding` if `accountType === null`.
4. `/onboarding` is a two-step form: (a) choose Designer or Agency, (b) fill profile details.
5. On submit, a Server Action creates the profile record and updates the session.

### 3.4 Route protection matrix

| Route pattern | Public | Designer | Agency | Admin |
|---|---|---|---|---|
| `/`, `/projects/*`, `/designers/*`, `/blog/*` | ✓ | ✓ | ✓ | ✓ |
| `/onboarding` | — | first login only | first login only | — |
| `/dashboard` | — | ✓ | ✓ | ✓ |
| `/submit` | — | ✓ | ✓ | ✓ |
| `/settings/profile` | — | ✓ | ✓ | ✓ |
| `/admin/*` | — | — | — | ✓ |

`proxy.ts` enforces this matrix before any page renders.

### 3.5 proxy.ts pattern (Next.js 16)
In Next.js 16, `middleware.ts` is deprecated and renamed to `proxy.ts`. The exported function must be named `proxy` (not `middleware`). Matchers work identically.

```ts
// proxy.ts
import { auth } from "@/auth"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export async function proxy(request: NextRequest) {
  const session = await auth()

  // Not logged in — redirect to sign-in for protected routes
  if (!session && request.nextUrl.pathname.startsWith("/dashboard")) {
    return NextResponse.redirect(new URL("/api/auth/signin", request.url))
  }

  // Logged in but no account type — gate to onboarding
  if (session?.user.accountType === null &&
      !request.nextUrl.pathname.startsWith("/onboarding") &&
      !request.nextUrl.pathname.startsWith("/api/auth")) {
    return NextResponse.redirect(new URL("/onboarding", request.url))
  }

  // Admin-only routes
  if (request.nextUrl.pathname.startsWith("/admin") && !session?.user.isAdmin) {
    return NextResponse.redirect(new URL("/", request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.png$).*)"],
}
```

---

## 4. Database Schema

### 4.1 Overview
Full Postgres on Neon. Replaces the existing SQLite schema. All array fields use native Postgres `String[]` (Prisma maps these to `text[]`). Enums use Prisma `enum`. JSON is used only where the structure is genuinely flexible.

### 4.2 Complete Prisma schema

```prisma
// prisma/schema.prisma
// Provider: postgresql (Neon)

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// ─────────────────────────────────────────────
// ENUMS
// ─────────────────────────────────────────────

enum AccountType {
  designer
  agency
}

enum SubscriptionTier {
  free
  pro
  agency
}

enum Availability {
  available
  freelance
  unavailable
}

enum ExperienceLevel {
  junior
  mid
  senior
}

enum ProjectCategory {
  Branding
  Web
  Motion
  Print
  Product
  UX
}

enum ProjectStatus {
  pending
  approved
  rejected
}

enum BadgeType {
  featured
  editors_pick
  best_of_year
}

enum ImageContext {
  designer_avatar
  agency_logo
  project_thumbnail
  project_gallery
}

enum SubscriptionStatus {
  active
  cancelled
  past_due
}

enum PromotedSlot {
  homepage_hero
  projects_top
  designers_top
}

// ─────────────────────────────────────────────
// AUTH — managed by Auth.js Prisma adapter
// ─────────────────────────────────────────────

model Account {
  id                String  @id @default(cuid())
  userId            String
  type              String
  provider          String
  providerAccountId String
  refresh_token     String? @db.Text
  access_token      String? @db.Text
  expires_at        Int?
  token_type        String?
  scope             String?
  id_token          String? @db.Text
  session_state     String?
  user              User    @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([provider, providerAccountId])
}

model Session {
  id           String   @id @default(cuid())
  sessionToken String   @unique
  userId       String
  expires      DateTime
  user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)
}

model VerificationToken {
  identifier String
  token      String   @unique
  expires    DateTime

  @@unique([identifier, token])
}

// ─────────────────────────────────────────────
// USER
// ─────────────────────────────────────────────

model User {
  id               String            @id @default(cuid())
  name             String?
  email            String?           @unique
  emailVerified    DateTime?
  image            String?
  // Platform-specific fields
  accountType      AccountType?      // null until onboarding complete
  isAdmin          Boolean           @default(false)
  subscriptionTier SubscriptionTier  @default(free)
  createdAt        DateTime          @default(now())
  updatedAt        DateTime          @updatedAt

  // Auth.js relations
  accounts         Account[]
  sessions         Session[]

  // Platform relations
  designerProfile  DesignerProfile?
  agencyProfile    AgencyProfile?
  submittedProjects Project[]         @relation("SubmittedBy")
  grantedBadges    ProjectBadge[]    @relation("GrantedBy")
  uploadedImages   Image[]
  subscription     Subscription?
}

// ─────────────────────────────────────────────
// DESIGNER PROFILE
// ─────────────────────────────────────────────

model DesignerProfile {
  id               String        @id @default(cuid())
  userId           String        @unique
  slug             String        @unique
  displayName      String
  title            String        @default("")
  bio              String        @db.Text
  avatarUrl        String?       // Vercel Blob URL
  locationCity     String        @default("")
  locationCountry  String        @default("")
  locationCountryCode String     @default("")
  specialties      String[]      // e.g. ["Branding", "Typography"]
  tools            String[]      // e.g. ["Figma", "Glyphs"]
  availability     Availability  @default(unavailable)
  experienceLevel  ExperienceLevel @default(mid)
  // Contact
  contactEmail     String        @default("")
  contactWebsite   String        @default("")
  contactLinkedin  String        @default("")
  contactInstagram String        @default("")
  contactBehance   String        @default("")
  contactDribbble  String        @default("")
  // Platform flags
  isVerified       Boolean       @default(false)
  isFeatured       Boolean       @default(false)
  // Monetisation stub — controls premium placement visibility
  acceptsPromotion Boolean       @default(false)
  createdAt        DateTime      @default(now())
  updatedAt        DateTime      @updatedAt

  user             User          @relation(fields: [userId], references: [id], onDelete: Cascade)
  agencyMemberships DesignerAgencyMembership[]
  projectCredits   ProjectCredit[]
}

// ─────────────────────────────────────────────
// AGENCY PROFILE
// ─────────────────────────────────────────────

model AgencyProfile {
  id               String    @id @default(cuid())
  userId           String    @unique
  slug             String    @unique
  displayName      String
  bio              String    @db.Text
  logoUrl          String?   // Vercel Blob URL
  locationCity     String    @default("")
  locationCountry  String    @default("")
  locationCountryCode String  @default("")
  teamSize         String    @default("")  // "1-5", "6-15", "16-50", "51-100", "100+"
  specialties      String[]
  pastClients      String[]
  // Contact
  contactEmail     String    @default("")
  contactWebsite   String    @default("")
  contactLinkedin  String    @default("")
  contactInstagram String    @default("")
  contactBehance   String    @default("")
  contactDribbble  String    @default("")
  // Platform flags
  isVerified       Boolean   @default(false)
  isFeatured       Boolean   @default(false)
  acceptsPromotion Boolean   @default(false)
  createdAt        DateTime  @default(now())
  updatedAt        DateTime  @updatedAt

  user             User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  members          DesignerAgencyMembership[]
}

// ─────────────────────────────────────────────
// DESIGNER ↔ AGENCY MEMBERSHIP
// ─────────────────────────────────────────────

model DesignerAgencyMembership {
  id              String          @id @default(cuid())
  designerProfileId String
  agencyProfileId   String
  role              String?       // e.g. "Creative Director" — optional
  createdAt         DateTime      @default(now())

  designer        DesignerProfile @relation(fields: [designerProfileId], references: [id], onDelete: Cascade)
  agency          AgencyProfile   @relation(fields: [agencyProfileId], references: [id], onDelete: Cascade)

  @@unique([designerProfileId, agencyProfileId])
}

// ─────────────────────────────────────────────
// PROJECT
// ─────────────────────────────────────────────

model Project {
  id              String          @id @default(cuid())
  slug            String          @unique
  title           String
  description     String
  body            String          @db.Text
  thumbnailUrl    String          // Vercel Blob URL — required
  galleryUrls     String[]        // Vercel Blob URLs — up to 8
  category        ProjectCategory
  tags            String[]
  year            Int
  agencyName      String          @default("")
  agencyUrl       String          @default("")
  sourceUrl       String          @default("")
  // Submission state
  status          ProjectStatus   @default(pending)
  submittedById   String
  submittedAt     DateTime        @default(now())
  reviewedAt      DateTime?
  reviewedById    String?         // admin user who approved/rejected
  rejectionReason String?         @db.Text
  // Platform flags
  isFeatured      Boolean         @default(false)
  createdAt       DateTime        @default(now())
  updatedAt       DateTime        @updatedAt

  submittedBy     User            @relation("SubmittedBy", fields: [submittedById], references: [id])
  credits         ProjectCredit[]
  badges          ProjectBadge[]
  images          Image[]         @relation("ProjectImages")
}

// ─────────────────────────────────────────────
// PROJECT CREDITS
// Individual designer credits on a project.
// Can reference a registered DesignerProfile, or
// be a free-text credit for unregistered designers.
// ─────────────────────────────────────────────

model ProjectCredit {
  id                String           @id @default(cuid())
  projectId         String
  designerProfileId String?          // null if designer is not registered
  creditName        String           // display name — always required
  role              String?          // e.g. "Art Direction", "Motion"
  createdAt         DateTime         @default(now())

  project           Project          @relation(fields: [projectId], references: [id], onDelete: Cascade)
  designerProfile   DesignerProfile? @relation(fields: [designerProfileId], references: [id], onDelete: SetNull)
}

// ─────────────────────────────────────────────
// PROJECT BADGES
// ─────────────────────────────────────────────

model ProjectBadge {
  id            String    @id @default(cuid())
  projectId     String
  badge         BadgeType
  grantedById   String    // admin user
  grantedAt     DateTime  @default(now())

  project       Project   @relation(fields: [projectId], references: [id], onDelete: Cascade)
  grantedBy     User      @relation("GrantedBy", fields: [grantedById], references: [id])

  @@unique([projectId, badge])  // one of each badge type per project
}

// ─────────────────────────────────────────────
// IMAGE UPLOADS
// Tracks every Vercel Blob upload for cleanup and attribution.
// ─────────────────────────────────────────────

model Image {
  id            String       @id @default(cuid())
  url           String       @unique  // Vercel Blob public URL
  blobKey       String       @unique  // Vercel Blob key for deletion
  context       ImageContext
  uploadedById  String
  // Soft foreign keys — entity may be any type
  projectId     String?
  createdAt     DateTime     @default(now())

  uploadedBy    User         @relation(fields: [uploadedById], references: [id])
  project       Project?     @relation("ProjectImages", fields: [projectId], references: [id], onDelete: SetNull)
}

// ─────────────────────────────────────────────
// MONETISATION STUBS
// Tables exist but are not wired to any payment logic at launch.
// ─────────────────────────────────────────────

model Subscription {
  id                     String             @id @default(cuid())
  userId                 String             @unique
  tier                   SubscriptionTier
  status                 SubscriptionStatus @default(active)
  stripeCustomerId       String?
  stripeSubscriptionId   String?
  currentPeriodStart     DateTime?
  currentPeriodEnd       DateTime?
  createdAt              DateTime           @default(now())
  updatedAt              DateTime           @updatedAt

  user                   User               @relation(fields: [userId], references: [id], onDelete: Cascade)
}

model PromotedListing {
  id          String       @id @default(cuid())
  entityType  String       // "project" | "designer" | "agency"
  entityId    String
  slot        PromotedSlot
  startDate   DateTime
  endDate     DateTime
  createdAt   DateTime     @default(now())

  @@index([entityType, entityId])
}
```

### 4.3 Key schema decisions explained

**No `authorId` on BlogPost** — blog remains static JSON for now. When a blog CMS is needed, add it as a separate phase.

**`ProjectCredit` vs embedding designer in Project** — separating credits into a join table means a designer can be credited on many projects and that connection is queryable (e.g. "all projects Mara Lindt has been credited on, even if she didn't submit them").

**`Image` table** — Vercel Blob has no native tagging. Tracking uploads in Postgres lets you audit orphaned blobs, associate images with entities, and soft-delete without hitting the Blob API on every delete.

**`@@unique([projectId, badge])`** — prevents duplicate badges (e.g. two `editors_pick` badges on the same project).

**`acceptsPromotion`** on profiles — a consent field for future promoted placement. An agency won't appear in promoted slots until they've opted in (even if admin marks them `isFeatured`). Separates editorial featuring from paid promotion.

---

## 5. API Structure

All API routes live under `app/api/`. Route handlers use the Next.js 16 `GET`/`POST`/`PATCH`/`DELETE` named exports.

### 5.1 Auth
```
app/api/auth/[...nextauth]/route.ts     NextAuth.js handler (GET + POST)
```

### 5.2 Onboarding
```
app/api/onboarding/route.ts
  POST    Create DesignerProfile or AgencyProfile
          Body: { accountType, ...profileFields }
          Auth: required, accountType must be null
          Returns: { slug }
```

### 5.3 Designers
```
app/api/designers/route.ts
  GET     List/search designers
          Query: q, specialty, availability, experience, location, sort, page, limit
          Auth: public

app/api/designers/[slug]/route.ts
  GET     Get designer profile + their approved projects
          Auth: public
  PATCH   Update own profile
          Auth: must be profile owner
          Body: partial DesignerProfile fields
```

### 5.4 Agencies
```
app/api/agencies/route.ts
  GET     List/search agencies
          Query: q, specialty, location, sort, page, limit
          Auth: public

app/api/agencies/[slug]/route.ts
  GET     Get agency profile + member roster + submitted projects
          Auth: public
  PATCH   Update own profile
          Auth: must be profile owner

app/api/agencies/[slug]/members/route.ts
  POST    Designer requests to join agency  (or agency invites — TBD in Phase 3)
          Auth: must be a designer
  DELETE  Remove self from agency
          Auth: must be a member
```

### 5.5 Projects
```
app/api/projects/route.ts
  GET     List approved projects
          Query: category, featured, badge, sort, page, limit
          Auth: public
  POST    Submit a project
          Auth: required (designer or agency)
          Body: { title, description, body, category, year, thumbnailUrl,
                  galleryUrls, tags, agencyName, agencyUrl, sourceUrl, credits }

app/api/projects/[slug]/route.ts
  GET     Get approved project (or pending project to its owner)
          Auth: public (approved), owner (pending)
  PATCH   Update a pending project
          Auth: must be submitter, project must be pending
  DELETE  Withdraw a pending project
          Auth: must be submitter, project must be pending
```

### 5.6 Image Uploads
```
app/api/upload/route.ts
  POST    Issue a Vercel Blob upload token and return upload URL
          Auth: required
          Body: { filename, contentType, context }
          Returns: { uploadUrl, blobKey, publicUrl }
          -- Client uploads directly to Vercel Blob using uploadUrl
          -- Client then records the image in the next step

app/api/upload/confirm/route.ts
  POST    Record a completed upload in the Image table
          Auth: required
          Body: { blobKey, url, context, projectId? }
```

### 5.7 Search
```
app/api/search/route.ts
  GET     Search designers and projects
          Query: q, type ("designer" | "project" | "all"), page, limit
          Auth: public
          Returns: { designers: [...], projects: [...] }
```

### 5.8 Admin
```
app/api/admin/queue/route.ts
  GET     List pending projects (newest first)
          Auth: admin only
          Query: page, limit

app/api/admin/projects/[id]/route.ts
  PATCH   Approve or reject a project
          Auth: admin only
          Body: { action: "approve" | "reject", rejectionReason? }

app/api/admin/projects/[id]/badges/route.ts
  POST    Grant a badge
          Auth: admin only
          Body: { badge: "featured" | "editors_pick" | "best_of_year" }
  DELETE  Remove a badge
          Auth: admin only
          Body: { badge }

app/api/admin/projects/[id]/featured/route.ts
  PATCH   Toggle isFeatured on a project
          Auth: admin only

app/api/admin/designers/[id]/route.ts
  PATCH   Toggle isVerified or isFeatured on a designer profile
          Auth: admin only
          Body: { isVerified?, isFeatured? }

app/api/admin/agencies/[id]/route.ts
  PATCH   Toggle isVerified or isFeatured on an agency profile
          Auth: admin only
          Body: { isVerified?, isFeatured? }
```

### 5.9 Dashboard (authenticated user)
```
app/api/dashboard/submissions/route.ts
  GET     My submitted projects (all statuses)
          Auth: required

app/api/dashboard/profile/route.ts
  GET     My own profile (designer or agency)
          Auth: required
```

---

## 6. User Flows

### 6.1 New user — first login

```
Landing page → "Sign In" button
  → /api/auth/signin
  → Google OAuth consent screen
  → Callback: Auth.js upserts User row
  → proxy.ts detects accountType === null
  → Redirect → /onboarding

/onboarding — Step 1: Choose account type
  [ Designer ]   [ Agency ]

/onboarding — Step 2: Fill profile
  Designer: name, title, bio, location, specialties, tools, availability
  Agency:   name, bio, location, teamSize, specialties, pastClients

  Submit → Server Action → create DesignerProfile / AgencyProfile
         → set accountType on User
         → redirect → /dashboard
```

### 6.2 Designer — submitting a project

```
/dashboard → "Submit a Project" CTA
  → /submit

/submit — multi-step form
  Step 1 — Project info
    Title, description, category, year, tags
    Body (long-form, textarea)
    Agency name + URL (optional — if work was done for/at an agency)
    Source URL (optional)

  Step 2 — Images
    Thumbnail upload (required)
      → POST /api/upload → get token
      → Upload directly to Vercel Blob
      → POST /api/upload/confirm
    Gallery images (up to 8, optional)
      → same upload flow per image

  Step 3 — Credits
    Add designer credits:
      Search by username (hits /api/designers?q=...)
      OR enter free-text name + role
    Can add self automatically as first credit

  Step 4 — Review & submit
    Preview card
    Submit → POST /api/projects → status: "pending"

Confirmation page:
  "Your project has been submitted for review.
   You'll be notified by email once it's approved."
```

### 6.3 Agency — submitting a project

Identical to 6.2. The difference is that `submittedById` resolves to the agency's User record, and the project appears on the agency profile page once approved (in addition to any credited designers' profiles).

### 6.4 Designer — managing their profile

```
/dashboard
  → "Edit Profile" → /settings/profile
    Form: all profile fields
    Avatar: upload new image
    Save → PATCH /api/designers/[slug]

  → "My Projects" → list of submitted projects with status badges
    pending  → can edit or withdraw
    approved → view live
    rejected → view rejection reason, option to edit and resubmit

  → "Agency Membership" → join or leave agencies
    Search agencies → POST /api/agencies/[slug]/members
    Leave           → DELETE /api/agencies/[slug]/members
```

### 6.5 Agency — managing their profile

```
/dashboard
  → "Edit Profile" → /settings/profile (agency variant)
  → "Our Projects" → same status view as designer
  → "Team" → list of current members (read-only at launch)
```

### 6.6 Returning user — standard sign-in

```
"Sign In" → Google OAuth → Auth.js finds existing User
  → proxy.ts: accountType is set, no redirect
  → /dashboard
```

---

## 7. Admin Flow

### 7.1 Accessing the admin area

Admin flag is set manually in the database (`UPDATE "User" SET "isAdmin" = true WHERE email = '...'`). No self-serve admin promotion. `proxy.ts` blocks `/admin/*` for non-admins.

### 7.2 Project review queue

```
/admin
  → Summary cards: pending count, approved this week, rejected this week

/admin/queue
  → Table: pending projects, newest first
    Columns: title, submitter, account type, submitted at
    Row actions: Preview, Approve, Reject

  Clicking "Preview":
    → Side panel or modal showing full project preview
      (same layout as the live project page, but with "PENDING" watermark)

  Clicking "Approve":
    → Confirm dialog
    → PATCH /api/admin/projects/[id] { action: "approve" }
    → Project status → "approved", goes live on /projects
    → Email sent to submitter: "Your project [title] has been approved!"

  Clicking "Reject":
    → Dialog with optional rejection reason textarea
    → PATCH /api/admin/projects/[id] { action: "reject", rejectionReason }
    → Project status → "rejected"
    → Email sent to submitter with reason (if provided)
```

### 7.3 Badge assignment

```
/admin/projects/[id]
  → Approved project detail view
  → "Badges" section — checklist:
      [ ] Featured
      [ ] Editor's Pick
      [ ] Best of Year
  → Toggle on → POST /api/admin/projects/[id]/badges { badge }
  → Toggle off → DELETE /api/admin/projects/[id]/badges { badge }
  → Badge appears immediately on the live project page
```

### 7.4 Featured and verified toggles

```
/admin/designers   → table of all designers
  Columns: name, location, specialty, verified, featured
  Inline toggles for isVerified and isFeatured
  → PATCH /api/admin/designers/[id]

/admin/agencies    → same pattern for agencies

/admin/projects    → approved projects table
  Inline toggle for isFeatured
  → PATCH /api/admin/projects/[id]/featured
```

### 7.5 Admin email notifications (Resend)

Two triggers:

| Event | Recipient | Template |
|---|---|---|
| New project submitted | Admin(s) | "New submission: [title] by [user]" |
| Project approved | Submitter | "Your project [title] is live" |
| Project rejected | Submitter | "Update on your submission [title]" + reason |

Keep templates plain text at launch. Add HTML templates when the design is more settled.

---

## 8. Phased Build Order

Each phase is independently shippable. Phases 1–3 can run in parallel with the existing static site since the new routes are additive.

---

### Phase 1 — Database migration (1–2 days)

**Goal:** Replace JSON + SQLite with Neon Postgres. Existing public pages keep working.

1. Create Neon project, get `DATABASE_URL`
2. Update `prisma/schema.prisma` — swap provider to `postgresql`, update schema to match Section 4.2
3. Run `npx prisma migrate dev --name init`
4. Write `prisma/seed.ts` to import existing `data/*.json` into the new tables
   - Projects go in as `status: "approved"`, `submittedById` pointing to a seed admin user
   - Designers and agencies get stub User records
5. Run `npm run db:seed`
6. Update `lib/data/projects.ts`, `lib/data/designers.ts`, `lib/data/posts.ts` to query Prisma instead of JSON
7. Verify all existing pages (`/projects`, `/designers`, `/blog`) still render correctly
8. Deploy — no user-facing change

---

### Phase 2 — Authentication (2–3 days)

**Goal:** Google sign-in working. Onboarding flow complete. Protected routes enforced.

1. `npm install next-auth@beta @auth/prisma-adapter`
2. Create `auth.ts` with Google provider + Prisma adapter
3. Add Auth.js required tables to Prisma schema (`Account`, `Session`, `VerificationToken`) — already included in Section 4.2
4. Run `npx prisma migrate dev --name add-auth-tables`
5. Create `app/api/auth/[...nextauth]/route.ts`
6. Set `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `AUTH_SECRET` in Vercel environment variables
7. Build `/onboarding` page + Server Action (creates profile, sets `accountType`)
8. Write `proxy.ts` (Section 3.5)
9. Add "Sign In / Sign Out" to `SiteHeader` — show user avatar when signed in
10. Test full login → onboarding → dashboard loop

---

### Phase 3 — Profile management (3–4 days)

**Goal:** Designers and agencies can create, view, and edit profiles. Agency membership works.

1. Build `/dashboard` page — overview of profile + submitted projects
2. Build `/settings/profile` — edit form for designer or agency profile
3. Build `PATCH /api/designers/[slug]` and `PATCH /api/agencies/[slug]`
4. Build `POST /api/agencies/[slug]/members` and `DELETE` variant
5. Update public `/designers/[slug]` page to read from DB, show agency memberships
6. Update public `/designers` page to read from DB with Prisma filters (replaces JSON)
7. Add verification badge and featured indicator to `DesignerCard`

---

### Phase 4 — Image uploads (1–2 days)

**Goal:** Designers and agencies can upload avatars, logos. No projects yet.

1. `npm install @vercel/blob`
2. Configure Vercel Blob store in Vercel dashboard
3. Build `POST /api/upload` — issues a client upload token
4. Build `POST /api/upload/confirm` — records completed upload in `Image` table
5. Build a reusable `<ImageUpload>` client component (drag-drop + preview)
6. Wire avatar upload into `/settings/profile` for designers
7. Wire logo upload into `/settings/profile` for agencies
8. Update profile pages to use uploaded image URLs (fall back to initials/color if none)

---

### Phase 5 — Project submission (3–4 days)

**Goal:** Authenticated users can submit projects with images. Submissions enter review queue.

1. Build `/submit` multi-step form (Section 6.2)
   - Step 1: project info fields
   - Step 2: image uploads (thumbnail + gallery) using `<ImageUpload>`
   - Step 3: credits search + free-text
   - Step 4: review and submit
2. Build `POST /api/projects` — validates with Zod, creates `Project` with `status: "pending"`
3. Build `PATCH /api/projects/[slug]` and `DELETE` (pending only)
4. Update `/dashboard` to show submitter's projects with status badges
5. Wire Resend: notify admin(s) when a new submission arrives

---

### Phase 6 — Admin dashboard (2–3 days)

**Goal:** Admins can review, approve, reject, badge, and feature content.

1. Build `/admin` layout with nav (Queue, Projects, Designers, Agencies)
2. Build `/admin/queue` — pending project table with preview panel
3. Build `PATCH /api/admin/projects/[id]` — approve/reject
4. Wire Resend: notify submitter on approval or rejection
5. Build `/admin/projects` — approved projects table with badge controls
6. Build badge toggle UI → `POST/DELETE /api/admin/projects/[id]/badges`
7. Build `/admin/designers` and `/admin/agencies` — verification and featured toggles
8. Build featured toggle for projects → `PATCH /api/admin/projects/[id]/featured`

---

### Phase 7 — Live search (1–2 days)

**Goal:** Replace all remaining static JSON reads with Prisma. Fast debounced search on `/projects` and `/designers`.

1. Build `GET /api/search` — queries both `Project` and `DesignerProfile` via Prisma ILIKE
2. Update `SearchBar` component to hit `/api/search` with 300ms debounce
3. Update `/projects` to query Prisma with category, badge, and sort filters
4. Update `/designers` to query Prisma with all filter params
5. Confirm all SSG pages (`/projects/[slug]`, `/designers/[slug]`) are still using `generateStaticParams`
   — these should switch to ISR (`revalidate = 60`) since data now changes without a redeploy

---

### Phase 8 — Polish and hardening (2–3 days)

**Goal:** Production-ready. Accessible, performant, secure.

1. Add `<Image>` (next/image) to all project thumbnails and avatars — replace color placeholders
2. Add ISR (`export const revalidate = 60`) to dynamic listing pages
3. Add `<EmptyState>` for zero search results and empty admin queue
4. Add loading skeletons to search results and dashboard
5. Accessibility audit: keyboard nav, focus rings, aria-labels on filter controls
6. Add Zod validation to all remaining API routes
7. Rate-limit `/api/upload` and `/api/projects` (POST) — use Vercel's built-in edge rate limiting or `@upstash/ratelimit` + Upstash Redis
8. Write at least one Vitest test per new `lib/data/` function
9. Update `CLAUDE.md` to reflect new schema, auth patterns, and API routes

---

## 9. Next.js 16 Breaking Changes to Know

These are confirmed from `node_modules/next/dist/docs/` and affect every phase of this build.

### `middleware.ts` → `proxy.ts`
The `middleware` file convention is **deprecated in Next.js 16** and renamed to `proxy`. The exported function must be named `proxy` (not `middleware`). A codemod exists:
```bash
npx @next/codemod@canary middleware-to-proxy .
```

### `params` and `searchParams` are Promises
```ts
// All page props — always await before using
interface PageProps {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ q?: string }>
}
export default async function Page({ params, searchParams }: PageProps) {
  const { slug } = await params
  const { q } = await searchParams
}
```

### Async Server Components and testing
Vitest does not support async Server Components directly. Test the data layer (lib/data/) and Server Actions with Vitest. Use Playwright for page-level tests.

### `generateStaticParams` is unchanged
Works the same as Next.js 14/15. Return an array of param objects. No changes needed.

### ISR syntax is unchanged
```ts
export const revalidate = 60  // seconds
```

---

## Appendix A — Environment variables

```bash
# .env.local (never commit)

# Database
DATABASE_URL="postgresql://..."       # Neon connection string

# Auth.js
AUTH_SECRET="..."                     # Random 32-byte string: openssl rand -hex 32
GOOGLE_CLIENT_ID="..."
GOOGLE_CLIENT_SECRET="..."

# Vercel Blob
BLOB_READ_WRITE_TOKEN="..."           # From Vercel dashboard → Storage → Blob

# Resend (email)
RESEND_API_KEY="..."
RESEND_FROM_EMAIL="hello@yourdomain.com"
ADMIN_EMAIL="your@email.com"          # Where submission notifications go
```

## Appendix B — Slug generation

Slugs are derived from display names at profile/project creation and must be unique. Suggested utility:

```ts
// lib/slugify.ts
import { prisma } from "@/lib/prisma"

export function toSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
}

export async function uniqueSlug(
  base: string,
  table: "designerProfile" | "agencyProfile" | "project"
): Promise<string> {
  const slug = toSlug(base)
  const exists = await (prisma[table] as any).findUnique({ where: { slug } })
  if (!exists) return slug
  // Append random 4-char suffix on collision
  return `${slug}-${Math.random().toString(36).slice(2, 6)}`
}
```

## Appendix C — Recommended file additions (new files only)

```
auth.ts                              NextAuth.js v5 config
proxy.ts                             Route protection (replaces middleware.ts)
app/
  onboarding/
    page.tsx                         Account type selector + profile form
  dashboard/
    page.tsx                         User dashboard overview
    submissions/page.tsx             User's submitted projects
  submit/
    page.tsx                         Multi-step project submission
  settings/
    profile/page.tsx                 Edit profile
  admin/
    layout.tsx                       Admin nav wrapper (isAdmin check)
    page.tsx                         Admin overview stats
    queue/page.tsx                   Pending project review
    projects/page.tsx                All approved projects + badge controls
    designers/page.tsx               Designer management
    agencies/page.tsx                Agency management
app/api/
  auth/[...nextauth]/route.ts
  onboarding/route.ts
  designers/[slug]/route.ts          (add PATCH)
  agencies/
    route.ts
    [slug]/route.ts
    [slug]/members/route.ts
  projects/
    route.ts                         (add POST)
    [slug]/route.ts                  (add PATCH, DELETE)
  upload/
    route.ts
    confirm/route.ts
  search/route.ts
  admin/
    queue/route.ts
    projects/[id]/route.ts
    projects/[id]/badges/route.ts
    projects/[id]/featured/route.ts
    designers/[id]/route.ts
    agencies/[id]/route.ts
  dashboard/
    submissions/route.ts
    profile/route.ts
lib/
  auth.ts                            Session helpers for server components
  slugify.ts                         Slug generation utility
  email.ts                           Resend send wrappers
  upload.ts                          Vercel Blob helpers
```