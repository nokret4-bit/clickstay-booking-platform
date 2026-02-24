/*
  Warnings:

  - You are about to drop the column `customerCity` on the `booking` table. All the data in the column will be lost.
  - You are about to drop the column `customerCountry` on the `booking` table. All the data in the column will be lost.
  - You are about to drop the column `customerPostalCode` on the `booking` table. All the data in the column will be lost.
  - You are about to drop the column `customerState` on the `booking` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "booking" DROP COLUMN "customerCity",
DROP COLUMN "customerCountry",
DROP COLUMN "customerPostalCode",
DROP COLUMN "customerState";
