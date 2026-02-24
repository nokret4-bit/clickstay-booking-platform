-- CreateEnum
CREATE TYPE "Role" AS ENUM ('GUEST', 'CASHIER', 'STAFF', 'ADMIN');

-- AlterTable
ALTER TABLE "user" ADD COLUMN     "role" "Role" NOT NULL DEFAULT 'GUEST';

-- CreateIndex
CREATE INDEX "user_role_idx" ON "user"("role");
