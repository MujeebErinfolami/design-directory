-- CreateTable
CREATE TABLE "Designer" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "bio" TEXT NOT NULL,
    "avatarColor" TEXT NOT NULL,
    "initials" TEXT NOT NULL,
    "locationCity" TEXT NOT NULL,
    "locationCountry" TEXT NOT NULL,
    "locationCountryCode" TEXT NOT NULL,
    "availability" TEXT NOT NULL,
    "experienceLevel" TEXT NOT NULL,
    "contactEmail" TEXT NOT NULL DEFAULT '',
    "contactWebsite" TEXT NOT NULL DEFAULT '',
    "contactLinkedin" TEXT NOT NULL DEFAULT '',
    "contactInstagram" TEXT NOT NULL DEFAULT '',
    "contactBehance" TEXT NOT NULL DEFAULT '',
    "contactDribbble" TEXT NOT NULL DEFAULT '',
    "specialties" TEXT NOT NULL,
    "tools" TEXT NOT NULL,
    "agencyAffiliations" TEXT NOT NULL,
    "awards" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "Project" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "thumbnailColor" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "tags" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "agencyName" TEXT NOT NULL DEFAULT '',
    "agencyUrl" TEXT NOT NULL DEFAULT '',
    "sourceUrl" TEXT NOT NULL DEFAULT '',
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "designerId" TEXT NOT NULL,
    CONSTRAINT "Project_designerId_fkey" FOREIGN KEY ("designerId") REFERENCES "Designer" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "BlogPost" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "excerpt" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "authorName" TEXT NOT NULL,
    "authorTitle" TEXT NOT NULL,
    "readTime" TEXT NOT NULL,
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "publishedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateIndex
CREATE UNIQUE INDEX "Designer_slug_key" ON "Designer"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Project_slug_key" ON "Project"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "BlogPost_slug_key" ON "BlogPost"("slug");
