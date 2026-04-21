-- AlterTable
ALTER TABLE "facility" ADD COLUMN     "inactiveUntil" TIMESTAMP(3);

-- CreateIndex
CREATE INDEX "facility_inactiveUntil_idx" ON "facility"("inactiveUntil");
