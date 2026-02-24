import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { getServerSession } from "@/lib/auth";

const ModerateReviewSchema = z.object({
  reviewId: z.string(),
  action: z.enum(["APPROVE", "HIDE", "DELETE"]),
  reason: z.string().optional(),
});

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession();
    
    if (!session?.user || (session.user.role !== "ADMIN" && session.user.role !== "STAFF")) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const status = searchParams.get("status") || "PENDING";
    const facilityId = searchParams.get("facilityId");

    const skip = (page - 1) * limit;

    const where: any = {};

    // Only filter by status if it's not "ALL"
    if (status && status !== "ALL") {
      where.status = status;
    }

    if (facilityId) {
      where.facilityId = facilityId;
    }

    const [reviews, total] = await Promise.all([
      prisma.review.findMany({
        where,
        include: {
          facility: {
            select: {
              id: true,
              name: true,
              kind: true,
            },
          },
          booking: {
            select: {
              id: true,
              code: true,
              customerName: true,
              customerEmail: true,
              startDate: true,
              endDate: true,
              totalAmount: true,
              status: true,
            },
          },
          reviewer: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
        skip,
        take: limit,
      }),
      prisma.review.count({ where }),
    ]);

    return NextResponse.json({
      reviews,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });

  } catch (error) {
    console.error("Admin reviews API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch reviews" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession();
    
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Unauthorized - Admin access required" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const validated = ModerateReviewSchema.parse(body);

    const review = await prisma.review.findUnique({
      where: { id: validated.reviewId },
      include: {
        facility: {
          select: { id: true },
        },
        booking: {
          select: { customerName: true },
        },
        reviewer: {
          select: { name: true },
        },
      },
    });

    if (!review) {
      return NextResponse.json(
        { error: "Review not found" },
        { status: 404 }
      );
    }

    const updateData: any = {
      moderatedBy: session.user.id,
      moderatedAt: new Date(),
    };

    switch (validated.action) {
      case "APPROVE":
        updateData.status = "APPROVED";
        break;
      case "HIDE":
        updateData.status = "HIDDEN";
        break;
      case "DELETE":
        updateData.status = "DELETED";
        break;
    }

    const updatedReview = await prisma.review.update({
      where: { id: validated.reviewId },
      data: updateData,
      include: {
        facility: {
          select: {
            id: true,
            name: true,
          },
        },
        booking: {
          select: { customerName: true },
        },
        reviewer: {
          select: { name: true },
        },
      },
    });

    // Update facility rating cache
    if (validated.action === "APPROVE" || review.status === "APPROVED") {
      await updateFacilityRating(review.facilityId);
    }

    return NextResponse.json({
      success: true,
      review: updatedReview,
      message: `Review ${validated.action.toLowerCase()}d successfully`,
    });

  } catch (error) {
    console.error("Moderate review error:", error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid request data", details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Failed to moderate review" },
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
