-- Phase 0 multitenant: Organization, Workspace, OrgMember, GeneratedApp + colonnes org/workspace

-- CreateTable
CREATE TABLE "Organization" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "plan" TEXT NOT NULL DEFAULT 'free',
    "settings" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Organization_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OrgMember" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'member',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "OrgMember_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Workspace" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "settings" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Workspace_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GeneratedApp" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "code" TEXT NOT NULL,
    "schema" JSONB,
    "organization_id" TEXT NOT NULL,
    "preview_url" TEXT,
    "expires_at" TIMESTAMP(3),
    "exported" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GeneratedApp_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Organization_slug_key" ON "Organization"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "OrgMember_user_id_organization_id_key" ON "OrgMember"("user_id", "organization_id");
CREATE INDEX "OrgMember_organization_id_idx" ON "OrgMember"("organization_id");

-- CreateIndex
CREATE UNIQUE INDEX "Workspace_organization_id_slug_key" ON "Workspace"("organization_id", "slug");
CREATE INDEX "Workspace_organization_id_idx" ON "Workspace"("organization_id");

-- CreateIndex
CREATE INDEX "GeneratedApp_organization_id_idx" ON "GeneratedApp"("organization_id");

-- Add organization_id / workspace_id columns (nullable pour rétrocompat)
ALTER TABLE "WikiArticle" ADD COLUMN IF NOT EXISTS "organization_id" TEXT;
ALTER TABLE "Document" ADD COLUMN IF NOT EXISTS "organization_id" TEXT;
ALTER TABLE "Contract" ADD COLUMN IF NOT EXISTS "organization_id" TEXT;
ALTER TABLE "AiConversation" ADD COLUMN IF NOT EXISTS "organization_id" TEXT;

ALTER TABLE "Asset" ADD COLUMN IF NOT EXISTS "workspace_id" TEXT;
ALTER TABLE "Ticket" ADD COLUMN IF NOT EXISTS "workspace_id" TEXT;
ALTER TABLE "Assignment" ADD COLUMN IF NOT EXISTS "workspace_id" TEXT;
ALTER TABLE "AssetContract" ADD COLUMN IF NOT EXISTS "workspace_id" TEXT;
ALTER TABLE "KnowledgeArticle" ADD COLUMN IF NOT EXISTS "workspace_id" TEXT;
ALTER TABLE "ChangeRequest" ADD COLUMN IF NOT EXISTS "workspace_id" TEXT;

-- AddForeignKey
ALTER TABLE "OrgMember" ADD CONSTRAINT "OrgMember_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "OrgMember" ADD CONSTRAINT "OrgMember_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "Workspace" ADD CONSTRAINT "Workspace_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "GeneratedApp" ADD CONSTRAINT "GeneratedApp_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- FKs optionnelles (ON DELETE SET NULL)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'WikiArticle_organization_id_fkey') THEN
    ALTER TABLE "WikiArticle" ADD CONSTRAINT "WikiArticle_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "Organization"("id") ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'Document_organization_id_fkey') THEN
    ALTER TABLE "Document" ADD CONSTRAINT "Document_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "Organization"("id") ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'Contract_organization_id_fkey') THEN
    ALTER TABLE "Contract" ADD CONSTRAINT "Contract_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "Organization"("id") ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'AiConversation_organization_id_fkey') THEN
    ALTER TABLE "AiConversation" ADD CONSTRAINT "AiConversation_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "Organization"("id") ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'Asset_workspace_id_fkey') THEN
    ALTER TABLE "Asset" ADD CONSTRAINT "Asset_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "Workspace"("id") ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'Ticket_workspace_id_fkey') THEN
    ALTER TABLE "Ticket" ADD CONSTRAINT "Ticket_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "Workspace"("id") ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'Assignment_workspace_id_fkey') THEN
    ALTER TABLE "Assignment" ADD CONSTRAINT "Assignment_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "Workspace"("id") ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'AssetContract_workspace_id_fkey') THEN
    ALTER TABLE "AssetContract" ADD CONSTRAINT "AssetContract_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "Workspace"("id") ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'KnowledgeArticle_workspace_id_fkey') THEN
    ALTER TABLE "KnowledgeArticle" ADD CONSTRAINT "KnowledgeArticle_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "Workspace"("id") ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'ChangeRequest_workspace_id_fkey') THEN
    ALTER TABLE "ChangeRequest" ADD CONSTRAINT "ChangeRequest_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "Workspace"("id") ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END $$;
