import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { FacilityQuerySchema } from "@/schemas/admin";
import { getAvailabilityCalendar } from "@/lib/availability";
import { parseISO } from "date-fns";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    
    // Get all type parameters (supports multiple types)
    const types = searchParams.getAll("type");
    const queryParams = {
      type: types.length > 0 ? types[0] : undefined,
      from: searchParams.get("from") || undefined,
      to: searchParams.get("to") || undefined,
      capacity: searchParams.get("capacity") || undefined,
    };

    console.log("Query params received:", queryParams);
    console.log("All types:", types);
    const validated = FacilityQuerySchema.parse(queryParams);
    console.log("Validated params:", validated);

    const where: {
      isActive: boolean;
      kind?: any;
      capacity?: { gte: number };
    } = {
      isActive: true,
    };

    // Handle multiple facility types
    if (types.length > 1) {
      where.kind = { in: types };
    } else if (types.length === 1) {
      where.kind = types[0];
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

        availability[facility.id] = availCalendar.map((item) => ({
          date: item.date.toISOString(),
          available: item.available,
          price: Number(facility.price),
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
