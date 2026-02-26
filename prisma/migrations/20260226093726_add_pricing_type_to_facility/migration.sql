-- CreateEnum
CREATE TYPE "PricingType" AS ENUM ('PER_NIGHT', 'PER_HEAD');

-- AlterTable
ALTER TABLE "facility" ADD COLUMN     "pricingType" "PricingType" NOT NULL DEFAULT 'PER_NIGHT';
