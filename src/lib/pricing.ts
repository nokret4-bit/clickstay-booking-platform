import { prisma } from "@/lib/prisma";
import { differenceInDays } from "date-fns";

export interface PriceBreakdown {
  subtotal: number;
  extraAdultCharge: number;
  extraChildCharge: number;
  taxAmount: number;
  feeAmount: number;
  totalAmount: number;
  currency: string;
  nights?: number;
  extraAdultRate?: number;
  extraChildRate?: number;
}

const TAX_RATE = 0.12; // 12% VAT
const SERVICE_FEE_RATE = 0.05; // 5% service fee

export async function calculatePrice(
  facilityId: string,
  startDate: Date,
  endDate: Date,
  guests?: number,
  extraAdults: number = 0,
  extraChildren: number = 0
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
  
  // Calculate subtotal based on pricing type
  let subtotal: number;
  if (facility.pricingType === 'PER_HEAD') {
    // For function halls: price per head (guests required)
    const guestCount = guests || facility.capacity;
    subtotal = basePrice * guestCount;
  } else {
    // For rooms/cottages: price per night
    subtotal = basePrice * actualNights;
  }

  // Calculate additional guest charges
  const adultRate = facility.extraAdultRate ? Number(facility.extraAdultRate) : 0;
  const childRate = facility.extraChildRate ? Number(facility.extraChildRate) : 0;
  const extraAdultCharge = extraAdults * adultRate * actualNights;
  const extraChildCharge = extraChildren * childRate * actualNights;

  const subtotalWithExtras = subtotal + extraAdultCharge + extraChildCharge;
  const taxAmount = subtotalWithExtras * TAX_RATE;
  const feeAmount = subtotalWithExtras * SERVICE_FEE_RATE;
  const totalAmount = subtotalWithExtras + taxAmount + feeAmount;

  return {
    subtotal: Math.round(subtotal * 100) / 100,
    extraAdultCharge: Math.round(extraAdultCharge * 100) / 100,
    extraChildCharge: Math.round(extraChildCharge * 100) / 100,
    taxAmount: Math.round(taxAmount * 100) / 100,
    feeAmount: Math.round(feeAmount * 100) / 100,
    totalAmount: Math.round(totalAmount * 100) / 100,
    currency: "PHP",
    nights: actualNights,
    extraAdultRate: adultRate,
    extraChildRate: childRate,
  };
}
