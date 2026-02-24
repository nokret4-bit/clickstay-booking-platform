-- AlterTable
ALTER TABLE "facility" ADD COLUMN     "freeAmenities" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "rules" TEXT[] DEFAULT ARRAY[]::TEXT[];
