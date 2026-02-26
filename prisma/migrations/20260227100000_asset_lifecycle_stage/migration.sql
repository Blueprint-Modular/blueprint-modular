-- AlterTable: ajout du cycle de vie sur Asset (compléments ITSM)
ALTER TABLE "Asset" ADD COLUMN IF NOT EXISTS "lifecycle_stage" TEXT;
