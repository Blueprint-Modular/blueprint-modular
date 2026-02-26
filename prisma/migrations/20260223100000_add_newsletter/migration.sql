-- CreateTable
CREATE TABLE "NewsletterSettings" (
    "id" TEXT NOT NULL DEFAULT 'default',
    "header_image_url" TEXT,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "NewsletterSettings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NewsletterArticle" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "excerpt" TEXT,
    "published_at" TIMESTAMP(3),
    "archived" BOOLEAN NOT NULL DEFAULT false,
    "author_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "NewsletterArticle_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "NewsletterArticle" ADD CONSTRAINT "NewsletterArticle_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
