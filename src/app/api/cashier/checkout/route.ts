import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { BookingStatus } from "@prisma/client";
import { sendCheckOutEmail } from "@/lib/email/mailer";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession();

    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Check authentication
    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { bookingCode } = body;

    if (!bookingCode) {
      return NextResponse.json(
        { error: "Booking code is required" },
        { status: 400 }
      );
    }

    // Find the booking
    const booking = await prisma.booking.findUnique({
      where: { code: bookingCode },
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

    // Check if guest is checked in
    if (booking.status !== BookingStatus.CHECKED_IN) {
      return NextResponse.json(
        { 
          error: `Cannot check out. Guest must be checked in first. Current status: ${booking.status}`,
          booking: {
            code: booking.code,
            status: booking.status,
            customerName: booking.customerName,
          }
        },
        { status: 400 }
      );
    }

    // Update booking status to CHECKED_OUT
    const updatedBooking = await prisma.booking.update({
      where: { id: booking.id },
      data: {
        status: BookingStatus.CHECKED_OUT,
        checkedOutAt: new Date(),
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

    // Log the check-out activity
    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: "BOOKING_CHECKOUT",
        entity: "Booking",
        entityId: updatedBooking.id,
        data: {
          bookingId: updatedBooking.id,
          bookingCode: updatedBooking.code,
          customerName: updatedBooking.customerName,
          facilityName: updatedBooking.facility.name,
          checkedOutAt: updatedBooking.checkedOutAt,
        },
      },
    });

    // Send check-out email notification
    try {
      await sendCheckOutEmail({
        customerName: updatedBooking.customerName,
        customerEmail: updatedBooking.customerEmail,
        bookingCode: updatedBooking.code,
        facilityName: updatedBooking.facility.name,
        checkInDate: updatedBooking.startDate.toISOString().split("T")[0] || "",
        checkOutDate: updatedBooking.endDate.toISOString().split("T")[0] || "",
        totalAmount: Number(updatedBooking.totalAmount),
      });
    } catch (emailError) {
      console.error("Failed to send check-out email:", emailError);
      // Don't fail the checkout if email fails
    }

    return NextResponse.json({
      success: true,
      message: "Guest checked out successfully",
      booking: {
        id: updatedBooking.id,
        code: updatedBooking.code,
        customerName: updatedBooking.customerName,
        customerEmail: updatedBooking.customerEmail,
        customerPhone: updatedBooking.customerPhone,
        facilityName: updatedBooking.facility.name,
        facilityKind: updatedBooking.facility.kind,
        checkInDate: updatedBooking.startDate,
        checkOutDate: updatedBooking.endDate,
        checkedInAt: updatedBooking.checkedInAt,
        checkedOutAt: updatedBooking.checkedOutAt,
        guests: updatedBooking.guests,
        totalAmount: updatedBooking.totalAmount,
        status: updatedBooking.status,
      },
    });
  } catch (error) {
    console.error("Error checking out guest:", error);
    return NextResponse.json(
      { error: "Failed to check out guest" },
      { status: 500 }
    );
  }
}
