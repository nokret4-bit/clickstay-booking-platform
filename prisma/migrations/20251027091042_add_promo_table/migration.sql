-- CreateTable
CREATE TABLE "promo" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "imageUrl" TEXT,
    "bgColor" TEXT NOT NULL DEFAULT 'from-amber-100 to-yellow-50',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "promo_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "promo_isActive_order_idx" ON "promo"("isActive", "order");
