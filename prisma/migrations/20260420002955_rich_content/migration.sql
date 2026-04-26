-- AlterTable
ALTER TABLE "BlogPost" ADD COLUMN     "contentBlocks" JSONB NOT NULL DEFAULT '[]',
ADD COLUMN     "coverImageUrl" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'published',
ADD COLUMN     "submittedById" TEXT,
ADD COLUMN     "subtitle" TEXT NOT NULL DEFAULT '',
ALTER COLUMN "readTime" SET DEFAULT '';

-- AlterTable
ALTER TABLE "Project" ADD COLUMN     "contentBlocks" JSONB NOT NULL DEFAULT '[]',
ADD COLUMN     "layoutType" TEXT NOT NULL DEFAULT 'case_study',
ADD COLUMN     "tagline" TEXT NOT NULL DEFAULT '';

-- AddForeignKey
ALTER TABLE "BlogPost" ADD CONSTRAINT "BlogPost_submittedById_fkey" FOREIGN KEY ("submittedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
