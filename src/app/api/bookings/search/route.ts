import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const code = searchParams.get("code");
    const email = searchParams.get("email");

    if (!code && !email) {
      return NextResponse.json(
        { error: "Please provide booking code or email" },
        { status: 400 }
      );
    }

    let booking;

    if (code) {
      booking = await prisma.booking.findUnique({
        where: { code },
        include: {
          facility: {
            select: {
              name: true,
              kind: true,
            },
          },
          reviews: {
            select: {
              id: true,
              rating: true,
              comment: true,
              status: true,
              createdAt: true,
            },
          },
        },
      });
    } else if (email) {
      // Find the most recent booking for this email
      booking = await prisma.booking.findFirst({
        where: { customerEmail: email },
        orderBy: { createdAt: "desc" },
        include: {
          facility: {
            select: {
              name: true,
              kind: true,
            },
          },
          reviews: {
            select: {
              id: true,
              rating: true,
              comment: true,
              status: true,
              createdAt: true,
            },
          },
        },
      });
    }

    if (!booking) {
      return NextResponse.json(
        { error: "Booking not found" },
        { status: 404 }
      );
    }

    // Add hasReview flag and review data
    const bookingWithReviewData = {
      ...booking,
      hasReview: booking.reviews && booking.reviews.length > 0,
      review: booking.reviews && booking.reviews.length > 0 ? booking.reviews[0] : null,
    };

    return NextResponse.json(bookingWithReviewData);
  } catch (error) {
    console.error("Error searching booking:", error);
    return NextResponse.json(
      { error: "Failed to search booking" },
      { status: 500 }
    );
  }
}
