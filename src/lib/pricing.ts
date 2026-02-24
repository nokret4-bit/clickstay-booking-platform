import { prisma } from "@/lib/prisma";
import { differenceInDays } from "date-fns";

export interface PriceBreakdown {
  subtotal: number;
  taxAmount: number;
  feeAmount: number;
  totalAmount: number;
  currency: string;
  nights?: number;
}

const TAX_RATE = 0.12; // 12% VAT
const SERVICE_FEE_RATE = 0.05; // 5% service fee

export async function calculatePrice(
  facilityId: string,
  startDate: Date,
  endDate: Date
): Promise<PriceBreakdown> {
  // Find the facility
  const facility = await prisma.facility.findUnique({
    where: { id: facilityId },
  });

  if (!facility) {
    throw new Error("Facility not found");
  }

  // Use the facility's base price
  const basePrice = Number(facility.price);
  const nights = differenceInDays(endDate, startDate);
  const actualNights = nights < 1 ? 1 : nights;
  
  const subtotal = basePrice * actualNights;
  const taxAmount = subtotal * TAX_RATE;
  const feeAmount = subtotal * SERVICE_FEE_RATE;
  const totalAmount = subtotal + taxAmount + feeAmount;

  return {
    subtotal: Math.round(subtotal * 100) / 100,
    taxAmount: Math.round(taxAmount * 100) / 100,
    feeAmount: Math.round(feeAmount * 100) / 100,
    totalAmount: Math.round(totalAmount * 100) / 100,
    currency: "PHP",
    nights: actualNights,
  };
}
