import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { FacilityQuerySchema } from "@/schemas/admin";
import { getAvailabilityCalendar } from "@/lib/availability";
import { calculatePrice } from "@/lib/pricing";
import { parseISO, addDays } from "date-fns";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const queryParams = {
      type: searchParams.get("type") || undefined,
      from: searchParams.get("from") || undefined,
      to: searchParams.get("to") || undefined,
      capacity: searchParams.get("capacity") || undefined,
    };

    console.log("Query params received:", queryParams);
    const validated = FacilityQuerySchema.parse(queryParams);
    console.log("Validated params:", validated);

    const where: {
      isActive: boolean;
      kind?: typeof validated.type;
      capacity?: { gte: number };
    } = {
      isActive: true,
    };

    if (validated.type) {
      where.kind = validated.type;
    }

    if (validated.capacity) {
      where.capacity = { gte: validated.capacity };
    }

    const facilities = await prisma.facility.findMany({
      where: { ...where, isActive: true },
      orderBy: { name: "asc" },
    });

    // If date range provided, calculate availability and pricing
    const availability: Record<
      string,
      Array<{ date: string; available: boolean; price: number }>
    > = {};

    if (validated.from && validated.to) {
      const startDate = parseISO(validated.from);
      const endDate = parseISO(validated.to);

      for (const facility of facilities) {
        const availCalendar = await getAvailabilityCalendar(facility.id, startDate, endDate);
        const priceInfo = await calculatePrice(facility.id, startDate, endDate);

        availability[facility.id] = availCalendar.map((item) => ({
          date: item.date.toISOString(),
          available: item.available,
          price: priceInfo.totalAmount,
        }));
      }
    }

    return NextResponse.json({
      items: facilities,
      availability,
    });
  } catch (error) {
    console.error("Facilities API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch facilities" },
      { status: 500 }
    );
  }
}
