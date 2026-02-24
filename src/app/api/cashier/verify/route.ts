import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { BookingStatus } from "@prisma/client";

export async function GET(request: NextRequest) {
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

    // Get booking code from query params
    const { searchParams } = new URL(request.url);
    const bookingCode = searchParams.get("code");

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
        payment: true,
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
        { 
          message: "Guest is already checked in",
          booking: {
            code: booking.code,
            customerName: booking.customerName,
            facilityName: booking.facility.name,
            checkInDate: booking.startDate,
            checkOutDate: booking.endDate,
            status: booking.status,
          }
        },
        { status: 200 }
      );
    }

    // Check if already checked out or completed
    if (booking.status === BookingStatus.CHECKED_OUT || booking.status === BookingStatus.COMPLETED) {
      return NextResponse.json(
        { 
          error: `Cannot check in. Guest has already checked out`,
          booking: {
            code: booking.code,
            status: booking.status,
            customerName: booking.customerName,
          }
        },
        { status: 400 }
      );
    }

    // Determine if booking can be checked in
    const canCheckIn = booking.status === BookingStatus.CONFIRMED;
    
    // Check payment status (payment is a single object, not array)
    const isPaid = booking.payment && booking.payment.status === "PAID";
    
    // Calculate payment info
    const totalPaid = booking.payment && booking.payment.status === "PAID" 
      ? Number(booking.payment.amount) 
      : 0;
    const totalAmount = Number(booking.totalAmount);
    const hasIncompletePayment = totalPaid < totalAmount;
    
    // Determine payment type from booking's paymentType field
    const paymentType = booking.paymentType || "FULL";

    // Return booking information for verification (DO NOT auto check-in)
    return NextResponse.json({
      success: true,
      message: "Booking verified",
      booking: {
        id: booking.id,
        code: booking.code,
        customerName: booking.customerName,
        customerEmail: booking.customerEmail,
        customerPhone: booking.customerPhone,
        facilityUnit: booking.facility.name,
        facilityType: booking.facility.kind,
        startDate: booking.startDate,
        endDate: booking.endDate,
        status: booking.status,
        checkedInAt: booking.checkedInAt,
        totalAmount: totalAmount,
        totalPaid: totalPaid,
        currency: "PHP",
        canCheckIn: canCheckIn,
        isPaid: isPaid,
        hasIncompletePayment: hasIncompletePayment,
        paymentType: paymentType,
      },
    });
  } catch (error) {
    console.error("Error verifying booking:", error);
    return NextResponse.json(
      { error: "Failed to verify booking" },
      { status: 500 }
    );
  }
}
