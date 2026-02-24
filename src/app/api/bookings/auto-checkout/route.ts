import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { BookingStatus } from "@prisma/client";

/**
 * Auto-checkout API endpoint
 * Automatically checks out bookings that have passed their end date
 * This allows guests to leave reviews after their stay
 */
export async function POST() {
  try {
    const now = new Date();

    // Find all bookings that should be checked out
    // (end date has passed and status is CHECKED_IN or CONFIRMED)
    const bookingsToCheckout = await prisma.booking.findMany({
      where: {
        endDate: {
          lt: now, // End date is in the past
        },
        status: {
          in: [BookingStatus.CHECKED_IN, BookingStatus.CONFIRMED],
        },
        checkedOutAt: null, // Not already checked out
      },
      select: {
        id: true,
        code: true,
        endDate: true,
      },
    });

    if (bookingsToCheckout.length === 0) {
      return NextResponse.json({
        success: true,
        message: "No bookings to auto-checkout",
        count: 0,
      });
    }

    // Update all bookings to CHECKED_OUT status
    const updateResult = await prisma.booking.updateMany({
      where: {
        id: {
          in: bookingsToCheckout.map((b) => b.id),
        },
      },
      data: {
        status: BookingStatus.CHECKED_OUT,
        checkedOutAt: now,
        updatedAt: now,
      },
    });

    console.log(`[AUTO-CHECKOUT] Checked out ${updateResult.count} bookings`);

    return NextResponse.json({
      success: true,
      message: `Successfully checked out ${updateResult.count} bookings`,
      count: updateResult.count,
      bookings: bookingsToCheckout.map((b) => ({
        code: b.code,
        endDate: b.endDate,
      })),
    });
  } catch (error) {
    console.error("[AUTO-CHECKOUT] Error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to auto-checkout bookings",
      },
      { status: 500 }
    );
  }
}

// Also support GET for manual triggering
export async function GET() {
  return POST();
}
