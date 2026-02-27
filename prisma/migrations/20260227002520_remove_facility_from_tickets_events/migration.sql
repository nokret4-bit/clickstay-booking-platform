/*
  Warnings:

  - You are about to drop the column `facilityId` on the `event` table. All the data in the column will be lost.
  - You are about to drop the column `facilityId` on the `ticket` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "event" DROP CONSTRAINT "event_facilityId_fkey";

-- DropForeignKey
ALTER TABLE "ticket" DROP CONSTRAINT "ticket_facilityId_fkey";

-- DropIndex
DROP INDEX "event_facilityId_idx";

-- DropIndex
DROP INDEX "ticket_facilityId_idx";

-- AlterTable
ALTER TABLE "event" DROP COLUMN "facilityId";

-- AlterTable
ALTER TABLE "ticket" DROP COLUMN "facilityId";
