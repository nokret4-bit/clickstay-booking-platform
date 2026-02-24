-- CreateTable
CREATE TABLE "promoActivity" (
    "id" TEXT NOT NULL,
    "promoId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "userId" TEXT,
    "userName" TEXT,
    "details" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "promoActivity_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "promoActivity_promoId_idx" ON "promoActivity"("promoId");

-- CreateIndex
CREATE INDEX "promoActivity_action_idx" ON "promoActivity"("action");

-- CreateIndex
CREATE INDEX "promoActivity_createdAt_idx" ON "promoActivity"("createdAt");

-- AddForeignKey
ALTER TABLE "promoActivity" ADD CONSTRAINT "promoActivity_promoId_fkey" FOREIGN KEY ("promoId") REFERENCES "promo"("id") ON DELETE CASCADE ON UPDATE CASCADE;
