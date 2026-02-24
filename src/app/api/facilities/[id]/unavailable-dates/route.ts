import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { BookingStatus } from "@prisma/client";
import { eachDayOfInterval, format } from "date-fns";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    // Get date range from query params (default to next 90 days)
    const url = new URL(request.url);
    const startDateParam = url.searchParams.get("startDate");
    const endDateParam = url.searchParams.get("endDate");
    
    const startDate = startDateParam ? new Date(startDateParam) : new Date();
    const endDate = endDateParam 
      ? new Date(endDateParam) 
      : new Date(Date.now() + 90 * 24 * 60 * 60 * 1000); // 90 days from now

    // Get all confirmed and pending bookings for this facility
    const bookings = await prisma.booking.findMany({
      where: {
        facilityId: id,
        status: {
          in: [BookingStatus.CONFIRMED, BookingStatus.PENDING],
        },
        OR: [
          {
            startDate: {
              lte: endDate,
            },
            endDate: {
              gte: startDate,
            },
          },
        ],
      },
      select: {
        startDate: true,
        endDate: true,
      },
    });

    // Generate list of unavailable dates
    const unavailableDates = new Set<string>();
    
    bookings.forEach((booking) => {
      const dates = eachDayOfInterval({
        start: booking.startDate,
        end: new Date(booking.endDate.getTime() - 1), // Exclude checkout day
      });
      
      dates.forEach((date) => {
        unavailableDates.add(format(date, "yyyy-MM-dd"));
      });
    });

    return NextResponse.json({
      unavailableDates: Array.from(unavailableDates).sort(),
    });
  } catch (error) {
    console.error("Unavailable dates API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch unavailable dates" },
      { status: 500 }
    );
  }
}
