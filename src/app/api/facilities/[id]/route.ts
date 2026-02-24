import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    const facility = await prisma.facility.findUnique({
      where: { 
        id, 
        isActive: true 
      },
      select: {
        id: true,
        name: true,
        kind: true,
        description: true,
        capacity: true,
        price: true,
        photos: true,
        amenities: true,
        rules: true,
        freeAmenities: true,
        averageRating: true,
        totalReviews: true,
      },
    });

    if (!facility) {
      return NextResponse.json(
        { error: "Facility not found" },
        { status: 404 }
      );
    }

    // Convert Decimal to number for JSON serialization
    const facilityData = {
      ...facility,
      price: Number(facility.price),
      averageRating: facility.averageRating || 0,
    };

    return NextResponse.json(facilityData);

  } catch (error) {
    console.error("Facility detail API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch facility details" },
      { status: 500 }
    );
  }
}
