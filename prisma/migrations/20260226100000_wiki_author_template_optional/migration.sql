-- AlterTable WikiArticle: add author_name and template (additive only)
ALTER TABLE "WikiArticle" ADD COLUMN IF NOT EXISTS "author_name" TEXT;
ALTER TABLE "WikiArticle" ADD COLUMN IF NOT EXISTS "template" TEXT;

-- AlterTable WikiRevision: make author_id optional
ALTER TABLE "WikiRevision" ALTER COLUMN "author_id" DROP NOT NULL;

-- AlterTable WikiComment: make author_id optional
ALTER TABLE "WikiComment" ALTER COLUMN "author_id" DROP NOT NULL;
