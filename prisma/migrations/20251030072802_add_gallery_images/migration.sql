-- CreateTable
CREATE TABLE "galleryImage" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "category" TEXT NOT NULL,
    "imageUrl" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "galleryImage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "galleryImage_isActive_order_idx" ON "galleryImage"("isActive", "order");

-- CreateIndex
CREATE INDEX "galleryImage_category_idx" ON "galleryImage"("category");
