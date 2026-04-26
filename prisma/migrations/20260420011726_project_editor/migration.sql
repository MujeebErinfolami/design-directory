-- AlterEnum
ALTER TYPE "ProjectStatus" ADD VALUE 'draft';

-- AlterTable
ALTER TABLE "Project" ADD COLUMN     "attachments" JSONB NOT NULL DEFAULT '[]',
ADD COLUMN     "externalLink" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "externalLinkLabel" TEXT NOT NULL DEFAULT 'View Project',
ADD COLUMN     "theme" TEXT NOT NULL DEFAULT 'light';
