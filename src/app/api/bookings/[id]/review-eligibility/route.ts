import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const bookingId = params.id;

    // Fetch booking with facility and review info
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        facility: {
          select: {
            id: true,
            name: true,
          },
        },
        reviews: {
          select: {
            id: true,
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

    // Check if already reviewed
    const alreadyReviewed = booking.reviews.length > 0;

    // Check if checked out
    if (!booking.checkedOutAt) {
      return NextResponse.json({
        id: booking.id,
        code: booking.code,
        facilityId: booking.facilityId,
        facilityName: booking.facility.name,
        customerName: booking.customerName,
        startDate: booking.startDate,
        endDate: booking.endDate,
        checkedOutAt: null,
        canReview: false,
        alreadyReviewed,
        hoursUntilReview: 0,
        message: "You must check out before submitting a review",
      });
    }

    // Calculate hours since checkout
    const checkoutTime = new Date(booking.checkedOutAt).getTime();
    const currentTime = new Date().getTime();
    const hoursSinceCheckout = (currentTime - checkoutTime) / (1000 * 60 * 60);
    
    // Allow review immediately after checkout, but expire after 24 hours
    const canReview = hoursSinceCheckout >= 0 && hoursSinceCheckout <= 24;
    const hoursRemaining = canReview ? Math.max(0, 24 - hoursSinceCheckout) : 0;
    const isExpired = hoursSinceCheckout > 24;

    return NextResponse.json({
      id: booking.id,
      code: booking.code,
      facilityId: booking.facilityId,
      facilityName: booking.facility.name,
      customerName: booking.customerName,
      startDate: booking.startDate,
      endDate: booking.endDate,
      checkedOutAt: booking.checkedOutAt,
      canReview,
      alreadyReviewed,
      hoursRemaining,
      isExpired,
    });
  } catch (error) {
    console.error("Review eligibility check error:", error);
    return NextResponse.json(
      { error: "Failed to check review eligibility" },
      { status: 500 }
    );
  }
}
