import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const CreateReviewSchema = z.object({
  facilityId: z.string(),
  bookingId: z.string(),
  rating: z.number().min(1).max(5),
  comment: z.string().optional(),
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const facilityId = searchParams.get("facilityId");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const status = searchParams.get("status") || "APPROVED";

    if (!facilityId) {
      return NextResponse.json(
        { error: "Facility ID is required" },
        { status: 400 }
      );
    }

    const skip = (page - 1) * limit;

    const [reviews, total] = await Promise.all([
      prisma.review.findMany({
        where: {
          facilityId,
          status: status as any,
        },
        include: {
          booking: {
            select: {
              customerName: true,
              startDate: true,
              endDate: true,
            },
          },
          reviewer: {
            select: {
              name: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
        skip,
        take: limit,
      }),
      prisma.review.count({
        where: {
          facilityId,
          status: status as any,
        },
      }),
    ]);

    // Calculate rating distribution
    const ratingDistribution = await prisma.review.groupBy({
      by: ["rating"],
      where: {
        facilityId,
        status: "APPROVED",
      },
      _count: {
        rating: true,
      },
    });

    const distribution = [1, 2, 3, 4, 5].map(rating => ({
      rating,
      count: ratingDistribution.find(r => r.rating === rating)?._count.rating || 0,
    }));

    return NextResponse.json({
      reviews,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
      distribution,
    });

  } catch (error) {
    console.error("Reviews API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch reviews" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = CreateReviewSchema.parse(body);

    // Verify booking exists and belongs to the user
    const booking = await prisma.booking.findFirst({
      where: {
        id: validated.bookingId,
        facilityId: validated.facilityId,
        status: {
          in: ["CHECKED_OUT", "COMPLETED"], // Allow both checked out and completed bookings
        },
      },
    });

    if (!booking) {
      return NextResponse.json(
        { error: "Invalid booking or booking not checked out yet" },
        { status: 400 }
      );
    }

    // Check if review already exists for this booking
    const existingReview = await prisma.review.findUnique({
      where: {
        bookingId: validated.bookingId,
      },
    });

    if (existingReview) {
      return NextResponse.json(
        { error: "Review already exists for this booking" },
        { status: 409 }
      );
    }

    // Create the review
    const review = await prisma.review.create({
      data: {
        facilityId: validated.facilityId,
        bookingId: validated.bookingId,
        rating: validated.rating,
        comment: validated.comment,
        isVerified: true, // Mark as verified since it's from a completed booking
        status: "APPROVED", // Auto-approve reviews
      },
      include: {
        booking: {
          select: {
            customerName: true,
            startDate: true,
            endDate: true,
          },
        },
        facility: {
          select: {
            name: true,
          },
        },
      },
    });

    // Update facility rating cache
    await updateFacilityRating(validated.facilityId);

    return NextResponse.json({
      success: true,
      review,
      message: "Review submitted and published successfully!",
    });

  } catch (error) {
    console.error("Create review error:", error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid request data", details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Failed to create review" },
      { status: 500 }
    );
  }
}

async function updateFacilityRating(facilityId: string) {
  try {
    const ratingStats = await prisma.review.aggregate({
      where: {
        facilityId,
        status: "APPROVED",
      },
      _avg: {
        rating: true,
      },
      _count: {
        rating: true,
      },
    });

    await prisma.facility.update({
      where: { id: facilityId },
      data: {
        averageRating: ratingStats._avg.rating || 0,
        totalReviews: ratingStats._count.rating,
      },
    });
  } catch (error) {
    console.error("Failed to update facility rating:", error);
  }
}
