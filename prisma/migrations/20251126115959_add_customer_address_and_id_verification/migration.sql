-- AlterTable
ALTER TABLE "booking" ADD COLUMN     "customerAddress1" TEXT,
ADD COLUMN     "customerAddress2" TEXT,
ADD COLUMN     "customerCity" TEXT,
ADD COLUMN     "customerCountry" TEXT DEFAULT 'Philippines',
ADD COLUMN     "customerPostalCode" TEXT,
ADD COLUMN     "customerState" TEXT,
ADD COLUMN     "idDocumentBackUrl" TEXT,
ADD COLUMN     "idDocumentFrontUrl" TEXT,
ADD COLUMN     "idDocumentType" TEXT,
ADD COLUMN     "idVerified" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "idVerifiedAt" TIMESTAMP(3),
ADD COLUMN     "idVerifiedById" TEXT;

-- AddForeignKey
ALTER TABLE "booking" ADD CONSTRAINT "booking_idVerifiedById_fkey" FOREIGN KEY ("idVerifiedById") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;
