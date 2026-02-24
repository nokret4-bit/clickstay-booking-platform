/*
  Warnings:

  - Made the column `imageUrl` on table `promo` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "promo" ALTER COLUMN "title" DROP NOT NULL,
ALTER COLUMN "description" DROP NOT NULL,
ALTER COLUMN "imageUrl" SET NOT NULL;
