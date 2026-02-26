-- Phase 2 & 3 asset-manager : contrats, mouvements, KB, changements, CMDB, audit, permissions

-- CreateTable
CREATE TABLE "AssetContract" (
    "id" TEXT NOT NULL,
    "domain_id" TEXT NOT NULL,
    "reference" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "supplier" TEXT,
    "start_date" DATE NOT NULL,
    "end_date" DATE NOT NULL,
    "amount" DOUBLE PRECISION,
    "auto_renewal" BOOLEAN NOT NULL DEFAULT false,
    "notice_days" INTEGER NOT NULL,
    "asset_ids" TEXT,
    "notes" TEXT,
    "document_url" TEXT,
    "alert_days_before" INTEGER NOT NULL DEFAULT 30,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AssetContract_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AssetMovement" (
    "id" TEXT NOT NULL,
    "asset_id" TEXT NOT NULL,
    "movement_type" TEXT NOT NULL,
    "from_location_id" TEXT,
    "to_location_id" TEXT,
    "from_user_id" TEXT,
    "to_user_id" TEXT,
    "performed_by_id" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "reason" TEXT,
    "ticket_id" TEXT,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AssetMovement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "KnowledgeArticle" (
    "id" TEXT NOT NULL,
    "domain_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "category_id" TEXT NOT NULL,
    "asset_type_id" TEXT,
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "visibility" TEXT NOT NULL DEFAULT 'technicians_only',
    "source_ticket_id" TEXT,
    "views_count" INTEGER NOT NULL DEFAULT 0,
    "helpful_count" INTEGER NOT NULL DEFAULT 0,
    "not_helpful_count" INTEGER NOT NULL DEFAULT 0,
    "created_by_id" TEXT NOT NULL,
    "validated_by_id" TEXT,
    "published_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "KnowledgeArticle_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ChangeRequest" (
    "id" TEXT NOT NULL,
    "domain_id" TEXT NOT NULL,
    "reference" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "impact" TEXT NOT NULL,
    "risk_level" TEXT NOT NULL,
    "rollback_plan" TEXT NOT NULL,
    "assets_impacted" TEXT,
    "tickets_linked" TEXT,
    "requester_id" TEXT NOT NULL,
    "implementer_id" TEXT,
    "cab_reviewer_ids" TEXT,
    "status" TEXT NOT NULL,
    "planned_start" TIMESTAMP(3),
    "planned_end" TIMESTAMP(3),
    "actual_start" TIMESTAMP(3),
    "actual_end" TIMESTAMP(3),
    "implementation_notes" TEXT,
    "success" BOOLEAN,
    "post_implementation_review" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ChangeRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CIRelation" (
    "id" TEXT NOT NULL,
    "domain_id" TEXT NOT NULL,
    "source_asset_id" TEXT NOT NULL,
    "target_asset_id" TEXT NOT NULL,
    "relation_type" TEXT NOT NULL,
    "description" TEXT,
    "created_by_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CIRelation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL,
    "domain_id" TEXT,
    "user_id" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "resource_type" TEXT NOT NULL,
    "resource_id" TEXT,
    "before_state" TEXT,
    "after_state" TEXT,
    "changed_fields" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "ip_address" TEXT,
    "user_agent" TEXT,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Permission" (
    "id" TEXT NOT NULL,
    "role_id" TEXT NOT NULL,
    "domain_id" TEXT NOT NULL,
    "resource" TEXT NOT NULL,
    "actions" TEXT[] DEFAULT ARRAY[]::TEXT[],

    CONSTRAINT "Permission_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "AssetContract_domain_id_idx" ON "AssetContract"("domain_id");
CREATE INDEX "AssetContract_end_date_idx" ON "AssetContract"("end_date");

-- CreateIndex
CREATE INDEX "AssetMovement_asset_id_idx" ON "AssetMovement"("asset_id");
CREATE INDEX "AssetMovement_date_idx" ON "AssetMovement"("date");

-- CreateIndex
CREATE UNIQUE INDEX "KnowledgeArticle_domain_id_slug_key" ON "KnowledgeArticle"("domain_id", "slug");
CREATE INDEX "KnowledgeArticle_domain_id_idx" ON "KnowledgeArticle"("domain_id");
CREATE INDEX "KnowledgeArticle_category_id_idx" ON "KnowledgeArticle"("category_id");

-- CreateIndex
CREATE UNIQUE INDEX "ChangeRequest_reference_key" ON "ChangeRequest"("reference");
CREATE INDEX "ChangeRequest_domain_id_idx" ON "ChangeRequest"("domain_id");
CREATE INDEX "ChangeRequest_status_idx" ON "ChangeRequest"("status");
CREATE INDEX "ChangeRequest_planned_start_idx" ON "ChangeRequest"("planned_start");

-- CreateIndex
CREATE INDEX "CIRelation_domain_id_idx" ON "CIRelation"("domain_id");
CREATE INDEX "CIRelation_source_asset_id_idx" ON "CIRelation"("source_asset_id");
CREATE INDEX "CIRelation_target_asset_id_idx" ON "CIRelation"("target_asset_id");

-- CreateIndex
CREATE INDEX "AuditLog_domain_id_idx" ON "AuditLog"("domain_id");
CREATE INDEX "AuditLog_user_id_idx" ON "AuditLog"("user_id");
CREATE INDEX "AuditLog_resource_type_idx" ON "AuditLog"("resource_type");
CREATE INDEX "AuditLog_timestamp_idx" ON "AuditLog"("timestamp");

-- CreateIndex
CREATE UNIQUE INDEX "Permission_role_id_domain_id_resource_key" ON "Permission"("role_id", "domain_id", "resource");
CREATE INDEX "Permission_role_id_idx" ON "Permission"("role_id");

-- AddForeignKey
ALTER TABLE "AssetMovement" ADD CONSTRAINT "AssetMovement_asset_id_fkey" FOREIGN KEY ("asset_id") REFERENCES "Asset"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CIRelation" ADD CONSTRAINT "CIRelation_source_asset_id_fkey" FOREIGN KEY ("source_asset_id") REFERENCES "Asset"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CIRelation" ADD CONSTRAINT "CIRelation_target_asset_id_fkey" FOREIGN KEY ("target_asset_id") REFERENCES "Asset"("id") ON DELETE CASCADE ON UPDATE CASCADE;
