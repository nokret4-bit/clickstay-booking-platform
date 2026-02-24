import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { BookingStatus } from "@prisma/client";

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const bookingId = params.id;

    // Find the booking
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        facility: {
          select: {
            name: true,
          },
        },
      },
    });

    if (!booking) {
      return NextResponse.json(
        { error: "Booking not found" },
        { status: 404 }
      );
    }

    // Check if booking is confirmed
    if (booking.status !== BookingStatus.CONFIRMED) {
      return NextResponse.json(
        { error: `Cannot check in. Booking status is ${booking.status}` },
        { status: 400 }
      );
    }

    // Check if already checked in
    if (booking.status === BookingStatus.CHECKED_IN) {
      return NextResponse.json(
        { error: "Already checked in" },
        { status: 400 }
      );
    }

    // Check if check-in date has arrived (allow check-in on the day or after)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const checkInDate = new Date(booking.startDate);
    checkInDate.setHours(0, 0, 0, 0);

    if (today < checkInDate) {
      return NextResponse.json(
        { 
          error: "Cannot check in yet. Check-in date has not arrived.",
          checkInDate: booking.startDate 
        },
        { status: 400 }
      );
    }

    // Update booking to CHECKED_IN
    const updatedBooking = await prisma.booking.update({
      where: { id: bookingId },
      data: {
        status: BookingStatus.CHECKED_IN,
        checkedInAt: new Date(),
        updatedAt: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      message: "Successfully checked in!",
      booking: {
        id: updatedBooking.id,
        code: updatedBooking.code,
        status: updatedBooking.status,
        checkedInAt: updatedBooking.checkedInAt,
      },
    });
  } catch (error) {
    console.error("Self check-in error:", error);
    return NextResponse.json(
      { error: "Failed to check in" },
      { status: 500 }
    );
  }
}
