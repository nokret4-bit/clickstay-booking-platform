/*
  Warnings:

  - You are about to drop the column `imageUrl` on the `promo` table. All the data in the column will be lost.
  - Added the required column `mediaUrl` to the `promo` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "MediaType" AS ENUM ('IMAGE', 'VIDEO');

-- AlterTable
ALTER TABLE "promo" DROP COLUMN "imageUrl",
ADD COLUMN     "mediaType" "MediaType" NOT NULL DEFAULT 'IMAGE',
ADD COLUMN     "mediaUrl" TEXT NOT NULL;
