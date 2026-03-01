-- DropIndex
DROP INDEX "Asset_domain_id_idx";

-- DropIndex
DROP INDEX "Contract_workspace_status_idx";

-- DropIndex
DROP INDEX "Ticket_domain_id_idx";

-- AlterTable
ALTER TABLE "Assignment" ALTER COLUMN "status" DROP DEFAULT;

-- AlterTable
ALTER TABLE "Ticket" ALTER COLUMN "status" DROP DEFAULT;

-- AlterTable
ALTER TABLE "WikiRevision" ADD COLUMN     "title" TEXT NOT NULL DEFAULT '';

-- CreateIndex
CREATE INDEX "Assignment_asset_id_idx" ON "Assignment"("asset_id");

-- AddForeignKey
ALTER TABLE "Assignment" ADD CONSTRAINT "Assignment_technician_id_fkey" FOREIGN KEY ("technician_id") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
