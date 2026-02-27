-- CreateEnum
CREATE TYPE "TicketStatus" AS ENUM ('PENDING', 'CONFIRMED', 'USED', 'CANCELLED', 'EXPIRED');

-- AlterEnum
ALTER TYPE "PricingType" ADD VALUE 'PER_USE';

-- CreateTable
CREATE TABLE "ticket" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "weekdayPrice" DECIMAL(10,2) NOT NULL,
    "weekendPrice" DECIMAL(10,2) NOT NULL,
    "facilityId" TEXT NOT NULL,
    "eventId" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ticket_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "event" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "date" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3),
    "facilityId" TEXT NOT NULL,
    "maxCapacity" INTEGER,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "event_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ticketPurchase" (
    "id" TEXT NOT NULL,
    "ticketId" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "unitPrice" DECIMAL(10,2) NOT NULL,
    "totalAmount" DECIMAL(10,2) NOT NULL,
    "customerName" TEXT NOT NULL,
    "customerEmail" TEXT NOT NULL,
    "customerPhone" TEXT,
    "purchaseDate" TIMESTAMP(3) NOT NULL,
    "status" "TicketStatus" NOT NULL DEFAULT 'PENDING',
    "paymentMethod" TEXT,
    "transactionId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ticketPurchase_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ticket_facilityId_idx" ON "ticket"("facilityId");

-- CreateIndex
CREATE INDEX "ticket_eventId_idx" ON "ticket"("eventId");

-- CreateIndex
CREATE INDEX "ticket_isActive_idx" ON "ticket"("isActive");

-- CreateIndex
CREATE INDEX "event_facilityId_idx" ON "event"("facilityId");

-- CreateIndex
CREATE INDEX "event_date_idx" ON "event"("date");

-- CreateIndex
CREATE INDEX "event_isActive_idx" ON "event"("isActive");

-- CreateIndex
CREATE INDEX "ticketPurchase_ticketId_idx" ON "ticketPurchase"("ticketId");

-- CreateIndex
CREATE INDEX "ticketPurchase_customerEmail_idx" ON "ticketPurchase"("customerEmail");

-- CreateIndex
CREATE INDEX "ticketPurchase_purchaseDate_idx" ON "ticketPurchase"("purchaseDate");

-- CreateIndex
CREATE INDEX "ticketPurchase_status_idx" ON "ticketPurchase"("status");

-- AddForeignKey
ALTER TABLE "ticket" ADD CONSTRAINT "ticket_facilityId_fkey" FOREIGN KEY ("facilityId") REFERENCES "facility"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ticket" ADD CONSTRAINT "ticket_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "event"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "event" ADD CONSTRAINT "event_facilityId_fkey" FOREIGN KEY ("facilityId") REFERENCES "facility"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ticketPurchase" ADD CONSTRAINT "ticketPurchase_ticketId_fkey" FOREIGN KEY ("ticketId") REFERENCES "ticket"("id") ON DELETE CASCADE ON UPDATE CASCADE;
