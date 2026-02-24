import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { BookingStatus } from "@prisma/client";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession();

    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { bookingCode, bookingId } = body;

    if (!bookingCode && !bookingId) {
      return NextResponse.json(
        { error: "Booking code or ID is required" },
        { status: 400 }
      );
    }

    // Find the booking
    const booking = await prisma.booking.findFirst({
      where: bookingCode 
        ? { code: bookingCode }
        : { id: bookingId },
      include: {
        facility: {
          select: {
            name: true,
            kind: true,
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

    // Check if already checked in
    if (booking.status === BookingStatus.CHECKED_IN) {
      return NextResponse.json(
        { error: "Guest is already checked in" },
        { status: 400 }
      );
    }

    // Check if already checked out
    if (booking.status === BookingStatus.CHECKED_OUT || booking.status === BookingStatus.COMPLETED) {
      return NextResponse.json(
        { error: "Cannot check in. Guest has already checked out" },
        { status: 400 }
      );
    }

    // Check if booking is confirmed
    if (booking.status !== BookingStatus.CONFIRMED) {
      return NextResponse.json(
        { error: `Cannot check in. Booking status is ${booking.status}` },
        { status: 400 }
      );
    }

    // Update booking status to CHECKED_IN
    const updatedBooking = await prisma.booking.update({
      where: { id: booking.id },
      data: {
        status: BookingStatus.CHECKED_IN,
        checkedInAt: new Date(),
        updatedAt: new Date(),
      },
      include: {
        facility: {
          select: {
            name: true,
            kind: true,
          },
        },
      },
    });

    // Log the check-in activity
    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: "BOOKING_CHECKIN",
        entity: "Booking",
        entityId: updatedBooking.id,
        data: {
          bookingId: updatedBooking.id,
          bookingCode: updatedBooking.code,
          customerName: updatedBooking.customerName,
          facilityName: updatedBooking.facility.name,
          checkedInAt: updatedBooking.checkedInAt,
        },
      },
    });

    return NextResponse.json({
      success: true,
      message: "Guest checked in successfully",
      booking: {
        id: updatedBooking.id,
        code: updatedBooking.code,
        customerName: updatedBooking.customerName,
        customerEmail: updatedBooking.customerEmail,
        customerPhone: updatedBooking.customerPhone,
        facilityUnit: updatedBooking.facility.name,
        facilityType: updatedBooking.facility.kind,
        startDate: updatedBooking.startDate,
        endDate: updatedBooking.endDate,
        status: updatedBooking.status,
        checkedInAt: updatedBooking.checkedInAt,
      },
    });
  } catch (error) {
    console.error("Check-in error:", error);
    return NextResponse.json(
      { error: "Failed to check in guest" },
      { status: 500 }
    );
  }
}
