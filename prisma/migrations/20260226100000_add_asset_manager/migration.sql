-- CreateTable
CREATE TABLE "Asset" (
    "id" TEXT NOT NULL,
    "domain_id" TEXT NOT NULL,
    "asset_type_id" TEXT NOT NULL,
    "reference" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "brand" TEXT,
    "model" TEXT,
    "serial_number" TEXT,
    "status_id" TEXT NOT NULL,
    "location_id" TEXT,
    "owner_user_id" TEXT,
    "purchase_date" DATE,
    "warranty_end_date" DATE,
    "supplier_id" TEXT,
    "purchase_price" DOUBLE PRECISION,
    "notes" TEXT,
    "created_by_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Asset_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AssetAttribute" (
    "id" TEXT NOT NULL,
    "asset_id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "value_text" TEXT,
    "value_number" DOUBLE PRECISION,
    "value_date" DATE,
    "value_bool" BOOLEAN,

    CONSTRAINT "AssetAttribute_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Ticket" (
    "id" TEXT NOT NULL,
    "domain_id" TEXT NOT NULL,
    "reference" TEXT NOT NULL,
    "type_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'new',
    "priority_id" TEXT NOT NULL,
    "category_id" TEXT NOT NULL,
    "subcategory" TEXT,
    "asset_id" TEXT,
    "requester_id" TEXT NOT NULL,
    "assignee_id" TEXT,
    "sla_due_at" TIMESTAMP(3),
    "opened_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "taken_at" TIMESTAMP(3),
    "resolved_at" TIMESTAMP(3),
    "closed_at" TIMESTAMP(3),
    "solution" TEXT,
    "satisfaction_score" INTEGER,
    "satisfaction_comment" TEXT,
    "parent_ticket_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Ticket_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Assignment" (
    "id" TEXT NOT NULL,
    "domain_id" TEXT NOT NULL,
    "reference" TEXT NOT NULL,
    "assignment_type" TEXT NOT NULL,
    "asset_id" TEXT NOT NULL,
    "assignee_id" TEXT NOT NULL,
    "technician_id" TEXT,
    "start_date" DATE NOT NULL,
    "expected_end_date" DATE,
    "actual_end_date" DATE,
    "status" TEXT NOT NULL DEFAULT 'active',
    "reason" TEXT,
    "condition_at_start" TEXT,
    "condition_at_return" TEXT,
    "accessories" TEXT,
    "contract_signed" BOOLEAN NOT NULL DEFAULT false,
    "contract_file_url" TEXT,
    "notes" TEXT,
    "ticket_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Assignment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Asset_reference_key" ON "Asset"("reference");

-- CreateIndex
CREATE INDEX "Asset_domain_id_idx" ON "Asset"("domain_id");

-- CreateIndex
CREATE UNIQUE INDEX "AssetAttribute_asset_id_key_key" ON "AssetAttribute"("asset_id", "key");

-- CreateIndex
CREATE INDEX "AssetAttribute_asset_id_idx" ON "AssetAttribute"("asset_id");

-- CreateIndex
CREATE UNIQUE INDEX "Ticket_reference_key" ON "Ticket"("reference");

-- CreateIndex
CREATE INDEX "Ticket_domain_id_idx" ON "Ticket"("domain_id");

-- CreateIndex
CREATE UNIQUE INDEX "Assignment_reference_key" ON "Assignment"("reference");

-- CreateIndex
CREATE INDEX "Assignment_domain_id_idx" ON "Assignment"("domain_id");

-- AddForeignKey
ALTER TABLE "Asset" ADD CONSTRAINT "Asset_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AssetAttribute" ADD CONSTRAINT "AssetAttribute_asset_id_fkey" FOREIGN KEY ("asset_id") REFERENCES "Asset"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Ticket" ADD CONSTRAINT "Ticket_asset_id_fkey" FOREIGN KEY ("asset_id") REFERENCES "Asset"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Ticket" ADD CONSTRAINT "Ticket_requester_id_fkey" FOREIGN KEY ("requester_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Ticket" ADD CONSTRAINT "Ticket_assignee_id_fkey" FOREIGN KEY ("assignee_id") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Ticket" ADD CONSTRAINT "Ticket_parent_ticket_id_fkey" FOREIGN KEY ("parent_ticket_id") REFERENCES "Ticket"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Assignment" ADD CONSTRAINT "Assignment_asset_id_fkey" FOREIGN KEY ("asset_id") REFERENCES "Asset"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Assignment" ADD CONSTRAINT "Assignment_assignee_id_fkey" FOREIGN KEY ("assignee_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Assignment" ADD CONSTRAINT "Assignment_ticket_id_fkey" FOREIGN KEY ("ticket_id") REFERENCES "Ticket"("id") ON DELETE SET NULL ON UPDATE CASCADE;
