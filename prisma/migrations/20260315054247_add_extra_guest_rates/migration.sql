-- AlterTable
ALTER TABLE "booking" ADD COLUMN     "extraAdults" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "extraChildren" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "facility" ADD COLUMN     "extraAdultRate" DECIMAL(10,2),
ADD COLUMN     "extraChildRate" DECIMAL(10,2);
