-- CreateEnum
CREATE TYPE "PaymentType" AS ENUM ('FULL', 'PARTIAL');

-- AlterTable
ALTER TABLE "booking" ADD COLUMN     "depositAmount" DECIMAL(10,2),
ADD COLUMN     "isCustomPrice" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "paymentType" "PaymentType" NOT NULL DEFAULT 'FULL';
